/*
 * Federation bridge token — сторона LeadAI (P1-6).
 *
 * EduOS — владелец аккаунта: он подписывает короткоживущий токен перехода и
 * открывает с ним LeadAI. Токен здесь **не** Firebase-сессия: у LeadAI нет
 * Admin SDK, поэтому выпустить сессию Firebase за пользователя нечем. Честный
 * минимум — подтверждённая личность (email из подписи), с которой приложение
 * может связать свой аккаунт.
 *
 * Формат побайтово повторяет `eduos/ai_core/federation_sso.py` (и, значит,
 * `exam-ace/app/bridge.py`):
 *
 *     base64url(json(payload, sort_keys, compact)) "." base64url(hmac_sha256)
 *
 * Совместимость с Python-реализацией — не соглашение на словах: она закреплена
 * golden-вектором в `tests/federation.test.mjs`.
 *
 * Модуль серверный (`node:crypto`): его нельзя импортировать в клиентский
 * компонент. Он ничего не кэширует и в сеть не ходит — чистый verify/sign.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

/** Аудитория, для которой выпускаются токены этого продукта. */
export const BRIDGE_AUDIENCE = "leadai";

/** Владелец идентичности в федерации. */
export const BRIDGE_OWNER = "eduos";

/** Срок жизни токена перехода по умолчанию (совпадает с хабом EduOS). */
export const DEFAULT_TTL_SECONDS = 1800;

/** Отклонённый токен. `code` — машинная причина, `message` — безопасный текст. */
export class BridgeTokenError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "BridgeTokenError";
    this.code = code;
  }
}

// -------------------------------------------------------------------------
// base64url без padding (как в Python-реализации)
// -------------------------------------------------------------------------

function b64urlEncode(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(text) {
  const normalised = String(text).replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalised.length % 4)) % 4);
  return Buffer.from(normalised + padding, "base64");
}

// -------------------------------------------------------------------------
// JSON, побайтово совпадающий с json.dumps(sort_keys=True, ensure_ascii=True)
// -------------------------------------------------------------------------

function compareCodePoints(left, right) {
  const a = Array.from(left);
  const b = Array.from(right);
  const size = Math.min(a.length, b.length);
  for (let i = 0; i < size; i += 1) {
    const diff = a[i].codePointAt(0) - b[i].codePointAt(0);
    if (diff !== 0) return diff;
  }
  return a.length - b.length;
}

function escapeJsonString(value) {
  let out = '"';
  for (const char of String(value)) {
    const code = char.codePointAt(0);
    if (char === '"') out += '\\"';
    else if (char === "\\") out += "\\\\";
    else if (char === "\n") out += "\\n";
    else if (char === "\r") out += "\\r";
    else if (char === "\t") out += "\\t";
    else if (char === "\b") out += "\\b";
    else if (char === "\f") out += "\\f";
    else if (code < 0x20 || code > 0x7e) {
      // Python с ensure_ascii экранирует всё вне диапазона space..tilde,
      // включая DEL и не-ASCII, строчными \uXXXX (астральные — суррогатами).
      if (code > 0xffff) {
        const shifted = code - 0x10000;
        const high = 0xd800 + (shifted >> 10);
        const low = 0xdc00 + (shifted & 0x3ff);
        out +=
          "\\u" + high.toString(16).padStart(4, "0") +
          "\\u" + low.toString(16).padStart(4, "0");
      } else {
        out += "\\u" + code.toString(16).padStart(4, "0");
      }
    } else {
      out += char;
    }
  }
  return out + '"';
}

/** Компактный JSON с сортировкой ключей — байт-в-байт как у Python. */
export function stableStringify(value) {
  if (value === null) return "null";
  const type = typeof value;
  if (type === "string") return escapeJsonString(value);
  if (type === "number") {
    if (!Number.isFinite(value)) {
      throw new BridgeTokenError("invalid_payload", "Payload contains a non-finite number.");
    }
    return String(value);
  }
  if (type === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
  if (type === "object") {
    const keys = Object.keys(value).sort(compareCodePoints);
    const parts = keys.map(
      (key) => escapeJsonString(key) + ":" + stableStringify(value[key])
    );
    return "{" + parts.join(",") + "}";
  }
  throw new BridgeTokenError("invalid_payload", "Payload contains an unsupported value.");
}

// -------------------------------------------------------------------------
// Подпись и проверка
// -------------------------------------------------------------------------

function nowSeconds(options) {
  const moment = options && options.now !== undefined ? options.now : Date.now();
  return Math.floor(Number(moment) / 1000);
}

/**
 * Подписать payload в мостовой формат. Возвращает `segment.signature`.
 *
 * `iat` добавляется как `floor(now / 1000)`, как это делает Python-хаб.
 */
export function signBridgeToken(payload, secret, options = {}) {
  if (!secret) {
    throw new BridgeTokenError("missing_secret", "Bridge secret is not configured.");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new BridgeTokenError("invalid_payload", "Bridge payload must be an object.");
  }
  const body = { ...payload };
  if (body.iat === undefined || body.iat === null) {
    const moment = options.now !== undefined ? options.now : Date.now();
    body.iat = Math.floor(Number(moment) / 1000);
  }
  const segment = b64urlEncode(Buffer.from(stableStringify(body), "utf8"));
  const signature = createHmac("sha256", Buffer.from(secret, "utf8"))
    .update(segment, "ascii")
    .digest();
  return segment + "." + b64urlEncode(signature);
}

/**
 * Проверить подпись, срок и направление токена. Возвращает payload.
 *
 * Бросает {@link BridgeTokenError} — вызывающий код решает, как ответить.
 * `aud` проверяется строго: токен, выпущенный для другого продукта,
 * отклоняется даже при случайно совпавшем секрете.
 */
export function verifyBridgeToken(token, secret, options = {}) {
  if (!secret) {
    throw new BridgeTokenError("missing_secret", "Bridge secret is not configured.");
  }
  const audience = options.audience || BRIDGE_AUDIENCE;
  if (typeof token !== "string" || token.length === 0) {
    throw new BridgeTokenError("malformed", "Bridge token is missing.");
  }
  const separator = token.indexOf(".");
  if (separator <= 0 || separator === token.length - 1) {
    throw new BridgeTokenError("malformed", "Bridge token is malformed.");
  }
  const segment = token.slice(0, separator);
  const provided = b64urlDecode(token.slice(separator + 1));
  const expected = createHmac("sha256", Buffer.from(secret, "utf8"))
    .update(segment, "ascii")
    .digest();
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    throw new BridgeTokenError("bad_signature", "Bridge token signature does not match.");
  }

  let payload;
  try {
    payload = JSON.parse(b64urlDecode(segment).toString("utf8"));
  } catch {
    throw new BridgeTokenError("malformed", "Bridge token payload is malformed.");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new BridgeTokenError("malformed", "Bridge token payload is malformed.");
  }
  if (payload.exp !== undefined && payload.exp !== null) {
    if (nowSeconds(options) > Number(payload.exp)) {
      throw new BridgeTokenError("expired", "Bridge token has expired.");
    }
  }
  if (!payload.email) {
    throw new BridgeTokenError("missing_email", "Bridge token carries no email.");
  }
  if (payload.aud !== audience) {
    throw new BridgeTokenError(
      "wrong_audience",
      `Bridge token was issued for ${payload.aud || "no audience"}, not ${audience}.`
    );
  }
  return payload;
}

// -------------------------------------------------------------------------
// Конфигурация из окружения и удобные обёртки
// -------------------------------------------------------------------------

/**
 * Настройки федерации. Читаются только серверные переменные — префикса
 * `NEXT_PUBLIC_` здесь быть не должно, иначе секрет утечёт в бандл.
 *
 * - `EDUOS_SSO_SECRET` — общий секрет, равен `LEADAI_SSO_SECRET` в EduOS;
 * - `EDUOS_FEDERATION_URL` — базовый URL EduOS (для обратной ссылки).
 */
export function federationSettings(env = process.env) {
  const source = env || {};
  return {
    secret: source.EDUOS_SSO_SECRET || "",
    eduosUrl: String(source.EDUOS_FEDERATION_URL || "").replace(/\/+$/, ""),
    owner: BRIDGE_OWNER,
    audience: BRIDGE_AUDIENCE,
    ttlSeconds: DEFAULT_TTL_SECONDS,
  };
}

/** Статус подключения к федерации — без секрета и без сети. */
export function federationStatus(env = process.env) {
  const settings = federationSettings(env);
  return {
    owner: settings.owner,
    audience: settings.audience,
    configured: Boolean(settings.secret),
    eduos_url_set: Boolean(settings.eduosUrl),
    token_ttl_seconds: settings.ttlSeconds,
  };
}

/** Нормализация email — та же, что применяет EduOS при склейке аккаунтов. */
export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

/**
 * Разобрать входящий токен и вернуть результат, не бросая исключение.
 *
 * `{ linked: true, email, emailKey, subject, subjectVersion, expiresAt, payload }`
 * либо `{ linked: false, reason }`, где `reason` — код из {@link BridgeTokenError}
 * или `not_configured`.
 *
 * `subject` — глобальный идентификатор EduOS (`eduos:usr_…`, P1-8). Он бывает
 * `null`: старые отправители кладут в токен только email, и это нормальный
 * режим совместимости, а не ошибка. `subjectVersion` растёт при unlink/merge,
 * поэтому получатель может отличить устаревший handoff от свежего.
 */
export function readLeadaiToken(token, options = {}) {
  const settings = options.settings || federationSettings(options.env);
  if (!settings.secret) return { linked: false, reason: "not_configured" };
  try {
    const payload = verifyBridgeToken(token, settings.secret, {
      now: options.now,
      audience: settings.audience,
    });
    const email = String(payload.email);
    const subject = payload.sub ? String(payload.sub) : null;
    const subjectVersion =
      payload.sv === undefined || payload.sv === null ? null : Number(payload.sv);
    return {
      linked: true,
      email,
      emailKey: normalizeEmail(email),
      subject,
      subjectVersion,
      expiresAt: payload.exp === undefined ? null : Number(payload.exp),
      payload,
    };
  } catch (error) {
    const reason = error instanceof BridgeTokenError ? error.code : "rejected";
    return { linked: false, reason };
  }
}

/** Ссылка перехода в LeadAI — то, что строит EduOS на своей стороне. */
export function handoffUrl(token, settings = federationSettings()) {
  const base = String(settings.eduosUrl || "").replace(/\/+$/, "");
  if (!base || !token) return null;
  return `${base}/api/federation/sso?token=${encodeURIComponent(token)}`;
}
