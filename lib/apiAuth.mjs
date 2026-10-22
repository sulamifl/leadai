/**
 * Проверка Firebase ID-token для серверных роутов (`/api/ai`).
 *
 * Зачем: `/api/ai` — прокси к платному DeepSeek API. Без проверки токена
 * любой, кто нашёл URL, может жечь бюджет. Токен выдаёт Firebase Auth
 * на клиенте (`getIdToken()`), сервер проверяет подпись RS256 по публичным
 * сертификатам Google и валидирует `iss`/`aud`/`exp`.
 *
 * Реализация без `firebase-admin`: не нужен service-account JSON и лишняя
 * зависимость, а логика остаётся чистой функцией, которую можно покрыть тестами
 * (`tests/api-auth.test.mjs`).
 */

import crypto from "node:crypto";

export const GOOGLE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 час, как рекомендует Google
const DEFAULT_SKEW_MS = 60 * 1000; // допуск на расхождение часов (±60 с)

/** Декодирует base64url-сегмент JWT в объект. */
export function decodeJwtPart(part) {
  if (!part || typeof part !== "string") return null;
  try {
    const json = Buffer.from(part, "base64url").toString("utf8");
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

/** ID проекта Firebase: серверная переменная приоритетнее публичной. */
export function getFirebaseProjectId() {
  return (
    process.env?.FIREBASE_PROJECT_ID ||
    process.env?.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    ""
  );
}

/**
 * Извлекает Bearer-токен из заголовков запроса.
 * @returns {string} токен или пустая строка
 */
export function extractBearerToken(req) {
  const headers = req?.headers;
  const raw =
    typeof headers?.get === "function"
      ? headers.get("authorization") || headers.get("Authorization") || ""
      : headers?.authorization || headers?.Authorization || "";
  const match = String(raw).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

/**
 * Проверяет подпись и утверждения токена по уже полученным сертификатам.
 * Чистая синхронная функция — удобна для тестов.
 *
 * @param {string} token
 * @param {{projectId: string, certs: Record<string,string>, now?: number, clockSkewMs?: number}} options
 * @returns {{ok: true, user: object} | {ok: false, error: string}}
 */
export function verifyFirebaseIdToken(token, options) {
  const { projectId, certs, now = Date.now(), clockSkewMs = DEFAULT_SKEW_MS } = options || {};

  if (!token || typeof token !== "string") return { ok: false, error: "missing_token" };
  if (!projectId) return { ok: false, error: "missing_project_id" };
  if (!certs || typeof certs !== "object") return { ok: false, error: "missing_certs" };

  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, error: "malformed_token" };

  const [rawHeader, rawPayload, rawSignature] = parts;
  const header = decodeJwtPart(rawHeader);
  const payload = decodeJwtPart(rawPayload);
  if (!header || !payload) return { ok: false, error: "malformed_token" };

  if (header.alg !== "RS256") return { ok: false, error: "unsupported_alg" };
  if (!header.kid) return { ok: false, error: "missing_kid" };

  const cert = certs[header.kid];
  if (!cert) return { ok: false, error: "unknown_key" };

  const signatureOk = (() => {
    try {
      return crypto.verify(
        "RSA-SHA256",
        Buffer.from(`${rawHeader}.${rawPayload}`, "utf8"),
        cert,
        Buffer.from(rawSignature, "base64url")
      );
    } catch {
      return false;
    }
  })();
  if (!signatureOk) return { ok: false, error: "bad_signature" };

  const expectedIss = `https://securetoken.google.com/${projectId}`;
  if (payload.aud !== projectId) return { ok: false, error: "bad_audience" };
  if (payload.iss !== expectedIss) return { ok: false, error: "bad_issuer" };

  const expMs = Number(payload.exp) * 1000;
  if (!Number.isFinite(expMs) || expMs + clockSkewMs < now) return { ok: false, error: "expired" };

  if (payload.iat !== undefined) {
    const iatMs = Number(payload.iat) * 1000;
    if (!Number.isFinite(iatMs) || iatMs - clockSkewMs > now) return { ok: false, error: "issued_in_future" };
  }

  const uid = typeof payload.sub === "string" ? payload.sub.trim() : "";
  if (!uid) return { ok: false, error: "missing_subject" };

  return {
    ok: true,
    user: {
      uid,
      email: typeof payload.email === "string" ? payload.email : "",
      emailVerified: Boolean(payload.email_verified),
      name: typeof payload.name === "string" ? payload.name : "",
      provider: payload.firebase?.sign_in_provider || "",
      expiresAt: expMs,
    },
  };
}

/** Разбирает Cache-Control: max-age=..., чтобы не тянуть сертификаты на каждый запрос. */
export function parseMaxAgeMs(cacheControl, fallback = DEFAULT_TTL_MS) {
  const match = String(cacheControl || "").match(/max-age\s*=\s*(\d+)/i);
  if (!match) return fallback;
  const seconds = Number(match[1]);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : fallback;
}

const certCache = { certs: null, expiresAt: 0 };

/**
 * Получает сертификаты Google (с кэшем в памяти процесса).
 * @param {{fetchImpl?: Function, now?: number, force?: boolean}} [options]
 */
export async function getGoogleCerts(options = {}) {
  const { fetchImpl = globalThis.fetch, now = Date.now(), force = false } = options;
  if (!force && certCache.certs && certCache.expiresAt > now) {
    return { ok: true, certs: certCache.certs, cached: true };
  }
  if (typeof fetchImpl !== "function") return { ok: false, error: "fetch_unavailable" };

  try {
    const res = await fetchImpl(GOOGLE_CERTS_URL);
    if (!res || !res.ok) return { ok: false, error: "certs_fetch_failed" };
    const certs = await res.json();
    if (!certs || typeof certs !== "object" || !Object.keys(certs).length) {
      return { ok: false, error: "certs_empty" };
    }
    const ttl = parseMaxAgeMs(res.headers?.get?.("cache-control"));
    certCache.certs = certs;
    certCache.expiresAt = now + ttl;
    return { ok: true, certs, cached: false };
  } catch {
    return { ok: false, error: "certs_fetch_failed" };
  }
}

/** Только для тестов. */
export function __resetCertCache() {
  certCache.certs = null;
  certCache.expiresAt = 0;
}

/** Режим авторизации: required (по умолчанию) | optional | off (только локально). */
export function getAuthMode() {
  const mode = String(process.env?.AI_AUTH_MODE || "required").toLowerCase();
  return ["required", "optional", "off"].includes(mode) ? mode : "required";
}

/**
 * Проверяет запрос и возвращает пользователя либо готовый отказ.
 *
 * @param {Request} req
 * @param {{fetchImpl?: Function, now?: number, mode?: string, projectId?: string}} [options]
 * @returns {Promise<{ok: true, user: object, anonymous?: boolean} | {ok: false, status: number, error: string, message: string}>}
 */
export async function requireUser(req, options = {}) {
  const mode = options.mode || getAuthMode();

  if (mode === "off") {
    return { ok: true, user: { uid: "anonymous", anonymous: true }, anonymous: true };
  }

  const token = extractBearerToken(req);

  if (!token) {
    if (mode === "optional") {
      return { ok: true, user: { uid: "", anonymous: true }, anonymous: true };
    }
    return {
      ok: false,
      status: 401,
      error: "unauthorized",
      message: "Требуется вход: передайте Firebase ID-token в заголовке Authorization.",
    };
  }

  const projectId = options.projectId || getFirebaseProjectId();
  if (!projectId) {
    return {
      ok: false,
      status: 500,
      error: "server_misconfigured",
      message: "Не задан FIREBASE_PROJECT_ID — сервер не может проверить токен.",
    };
  }

  const fetched = await getGoogleCerts({ fetchImpl: options.fetchImpl, now: options.now });
  if (!fetched.ok) {
    // Не отдаём 401 при недоступности Google: это не вина клиента.
    return {
      ok: false,
      status: 503,
      error: fetched.error,
      message: "Не удалось получить ключи проверки токена. Повторите запрос.",
    };
  }

  const verified = verifyFirebaseIdToken(token, {
    projectId,
    certs: fetched.certs,
    now: options.now,
  });

  if (!verified.ok) {
    if (mode === "optional") {
      return { ok: true, user: { uid: "", anonymous: true }, anonymous: true };
    }
    return {
      ok: false,
      status: 401,
      error: verified.error,
      message: "Токен недействителен или истёк. Войдите заново.",
    };
  }

  return verified;
}

export default requireUser;
