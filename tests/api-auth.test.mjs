/*
 * Тесты авторизации `/api/ai` (lib/apiAuth.mjs).
 *
 * Здесь проверяется именно то, из-за чего роут был открытым прокси к платному
 * API: без валидного Firebase ID-token запрос обязан получить 401 до вызова
 * модели. Тесты подписывают настоящие RS256-токены своим ключом и подменяют
 * загрузку сертификатов Google, поэтому сеть не нужна.
 */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";

import {
  __resetCertCache,
  decodeJwtPart,
  extractBearerToken,
  getAuthMode,
  getFirebaseProjectId,
  parseMaxAgeMs,
  requireUser,
  verifyFirebaseIdToken,
} from "../lib/apiAuth.mjs";

const PROJECT = "leadai-test-project";
const KID = "test-kid";

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const PUBLIC_PEM = publicKey.export({ type: "spki", format: "pem" }).toString();
const OTHER = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });

const b64url = (value) => Buffer.from(value).toString("base64url");

function signToken(overrides = {}, { key = privateKey, kid = KID } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: `https://securetoken.google.com/${PROJECT}`,
    aud: PROJECT,
    sub: "uid-123",
    iat: now,
    exp: now + 3600,
    email: "student@example.com",
    email_verified: true,
    firebase: { sign_in_provider: "password" },
    ...overrides,
  };
  const header = { alg: "RS256", kid, typ: "JWT" };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const signature = crypto
    .sign("RSA-SHA256", Buffer.from(unsigned), key)
    .toString("base64url");
  return `${unsigned}.${signature}`;
}

const certsFetch = async () =>
  new Response(JSON.stringify({ [KID]: PUBLIC_PEM }), {
    status: 200,
    headers: { "cache-control": "public, max-age=3600" },
  });

function request(authorization) {
  const headers = new Headers();
  if (authorization) headers.set("authorization", authorization);
  return new Request("http://localhost/api/ai", { method: "POST", headers });
}

function withEnv(vars, fn) {
  const saved = {};
  for (const [key, value] of Object.entries(vars)) {
    saved[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return fn();
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

// ---------------------------------------------------------------------------
// Утилиты
// ---------------------------------------------------------------------------

test("extractBearerToken: находит токен в Headers и в простом объекте", () => {
  assert.equal(
    extractBearerToken({ headers: new Headers({ authorization: "Bearer abc.def.ghi" }) }),
    "abc.def.ghi"
  );
  assert.equal(extractBearerToken({ headers: { Authorization: "bearer token-1" } }), "token-1");
  assert.equal(extractBearerToken({ headers: { authorization: "Basic abc" } }), "");
  assert.equal(extractBearerToken({ headers: {} }), "");
  assert.equal(extractBearerToken(null), "");
});

test("decodeJwtPart: base64url -> объект, мусор -> null", () => {
  assert.deepEqual(decodeJwtPart(b64url('{"a":1}')), { a: 1 });
  assert.equal(decodeJwtPart("not-base64-@@"), null);
  assert.equal(decodeJwtPart(""), null);
  assert.equal(decodeJwtPart(undefined), null);
});

test("parseMaxAgeMs: читает max-age и падает на fallback", () => {
  assert.equal(parseMaxAgeMs("public, max-age=120"), 120000);
  assert.equal(parseMaxAgeMs("no-store", 5000), 5000);
  assert.equal(parseMaxAgeMs("max-age=0", 5000), 5000);
  assert.equal(parseMaxAgeMs(null), 3600000);
});

test("getAuthMode: по умолчанию required, мусор тоже required", () => {
  assert.equal(withEnv({ AI_AUTH_MODE: undefined }, getAuthMode), "required");
  assert.equal(withEnv({ AI_AUTH_MODE: "off" }, getAuthMode), "off");
  assert.equal(withEnv({ AI_AUTH_MODE: "OPTIONAL" }, getAuthMode), "optional");
  assert.equal(withEnv({ AI_AUTH_MODE: "banana" }, getAuthMode), "required");
});

test("getFirebaseProjectId: серверная переменная приоритетнее публичной", () => {
  const id = withEnv(
    { FIREBASE_PROJECT_ID: "server-id", NEXT_PUBLIC_FIREBASE_PROJECT_ID: "public-id" },
    getFirebaseProjectId
  );
  assert.equal(id, "server-id");
  const fallback = withEnv(
    { FIREBASE_PROJECT_ID: undefined, NEXT_PUBLIC_FIREBASE_PROJECT_ID: "public-id" },
    getFirebaseProjectId
  );
  assert.equal(fallback, "public-id");
});

// ---------------------------------------------------------------------------
// Проверка подписи
// ---------------------------------------------------------------------------

test("verifyFirebaseIdToken принимает корректный токен и отдаёт пользователя", () => {
  const token = signToken();
  const result = verifyFirebaseIdToken(token, {
    projectId: PROJECT,
    certs: { [KID]: PUBLIC_PEM },
  });
  assert.equal(result.ok, true);
  assert.equal(result.user.uid, "uid-123");
  assert.equal(result.user.email, "student@example.com");
  assert.equal(result.user.emailVerified, true);
  assert.equal(result.user.provider, "password");
});

test("verifyFirebaseIdToken отклоняет истёкший токен и токен из будущего", () => {
  const now = Math.floor(Date.now() / 1000);
  const expired = verifyFirebaseIdToken(signToken({ exp: now - 7200 }), {
    projectId: PROJECT,
    certs: { [KID]: PUBLIC_PEM },
  });
  assert.deepEqual(expired, { ok: false, error: "expired" });

  const future = verifyFirebaseIdToken(signToken({ iat: now + 7200, exp: now + 10800 }), {
    projectId: PROJECT,
    certs: { [KID]: PUBLIC_PEM },
  });
  assert.deepEqual(future, { ok: false, error: "issued_in_future" });
});

test("verifyFirebaseIdToken проверяет aud, iss, kid и подпись", () => {
  const certs = { [KID]: PUBLIC_PEM };
  assert.deepEqual(
    verifyFirebaseIdToken(signToken({ aud: "other" }), { projectId: PROJECT, certs }),
    { ok: false, error: "bad_audience" }
  );
  assert.deepEqual(
    verifyFirebaseIdToken(signToken({ iss: "https://evil.example.com" }), {
      projectId: PROJECT,
      certs,
    }),
    { ok: false, error: "bad_issuer" }
  );
  assert.deepEqual(
    verifyFirebaseIdToken(signToken({}, { key: OTHER.privateKey }), {
      projectId: PROJECT,
      certs,
    }),
    { ok: false, error: "bad_signature" }
  );
  assert.deepEqual(
    verifyFirebaseIdToken(signToken({}, { kid: "unknown" }), { projectId: PROJECT, certs }),
    { ok: false, error: "unknown_key" }
  );
});

test("verifyFirebaseIdToken: структура токена и alg проверяются до подписи", () => {
  const certs = { [KID]: PUBLIC_PEM };
  assert.deepEqual(verifyFirebaseIdToken("abc", { projectId: PROJECT, certs }), {
    ok: false,
    error: "malformed_token",
  });
  assert.deepEqual(verifyFirebaseIdToken("", { projectId: PROJECT, certs }), {
    ok: false,
    error: "missing_token",
  });
  // alg=none — классическая попытка обойти подпись.
  const header = b64url(JSON.stringify({ alg: "none", kid: KID }));
  const payload = b64url(JSON.stringify({ sub: "x", aud: PROJECT }));
  assert.deepEqual(
    verifyFirebaseIdToken(`${header}.${payload}.`, { projectId: PROJECT, certs }),
    { ok: false, error: "unsupported_alg" }
  );
  // Токен без sub отклоняется.
  assert.deepEqual(
    verifyFirebaseIdToken(signToken({ sub: "" }), { projectId: PROJECT, certs }),
    { ok: false, error: "missing_subject" }
  );
});

// ---------------------------------------------------------------------------
// requireUser: то, что видит роут
// ---------------------------------------------------------------------------

test("requireUser: без токена в режиме required — 401 до любого вызова модели", async () => {
  const result = await requireUser(request(), { mode: "required", projectId: PROJECT });
  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
  assert.equal(result.error, "unauthorized");
});

test("requireUser: валидный токен пропускает запрос", async () => {
  __resetCertCache();
  const result = await requireUser(request(`Bearer ${signToken()}`), {
    projectId: PROJECT,
    fetchImpl: certsFetch,
  });
  assert.equal(result.ok, true);
  assert.equal(result.user.uid, "uid-123");
  assert.notEqual(result.anonymous, true);
});

test("requireUser: недействительный токен — 401, а не 200", async () => {
  __resetCertCache();
  const result = await requireUser(request(`Bearer ${signToken({ aud: "other" })}`), {
    projectId: PROJECT,
    fetchImpl: certsFetch,
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
  assert.equal(result.error, "bad_audience");
});

test("requireUser: режим off — только для локальной разработки", async () => {
  const result = await requireUser(request(), { mode: "off" });
  assert.equal(result.ok, true);
  assert.equal(result.anonymous, true);
  assert.equal(result.user.uid, "anonymous");
});

test("requireUser: режим optional пускает анонимов, но помечает их", async () => {
  const anonymous = await requireUser(request(), { mode: "optional", projectId: PROJECT });
  assert.equal(anonymous.ok, true);
  assert.equal(anonymous.anonymous, true);
  assert.equal(anonymous.user.uid, "");

  __resetCertCache();
  const broken = await requireUser(request(`Bearer ${signToken({ aud: "other" })}`), {
    mode: "optional",
    projectId: PROJECT,
    fetchImpl: certsFetch,
  });
  assert.equal(broken.ok, true);
  assert.equal(broken.anonymous, true);
});

test("requireUser: без FIREBASE_PROJECT_ID сервер честно отвечает 500", async () => {
  const result = await withEnv(
    { FIREBASE_PROJECT_ID: undefined, NEXT_PUBLIC_FIREBASE_PROJECT_ID: undefined },
    () => requireUser(request(`Bearer ${signToken()}`))
  );
  assert.equal(result.ok, false);
  assert.equal(result.status, 500);
  assert.equal(result.error, "server_misconfigured");
});

test("requireUser: недоступность сертификатов — 503, а не 401", async () => {
  __resetCertCache();
  const result = await requireUser(request(`Bearer ${signToken()}`), {
    projectId: PROJECT,
    fetchImpl: async () => {
      throw new Error("network down");
    },
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 503);
  assert.equal(result.error, "certs_fetch_failed");
});

test("requireUser: пустой ответ сертификатов тоже 503", async () => {
  __resetCertCache();
  const result = await requireUser(request(`Bearer ${signToken()}`), {
    projectId: PROJECT,
    fetchImpl: async () => new Response("{}", { status: 200 }),
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 503);
  assert.equal(result.error, "certs_empty");
});
