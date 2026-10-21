/*
 * Тесты моста федерации на стороне LeadAI (P1-6).
 *
 * Запуск: `npm test` (node --test). Тестового раннера в проекте до этого не
 * было, поэтому здесь обычный встроенный node:test — без новых зависимостей.
 *
 * Главный тест — не самосогласованность JS-реализации, а совместимость с
 * Python: GOLDEN_TOKEN выпущен настоящим `eduos/ai_core/federation_sso.py`.
 * Если формат разъедется, сломается именно он.
 */
import assert from "node:assert/strict";
import test from "node:test";

import {
  BRIDGE_AUDIENCE,
  BridgeTokenError,
  DEFAULT_TTL_SECONDS,
  federationSettings,
  federationStatus,
  handoffUrl,
  normalizeEmail,
  readLeadaiToken,
  signBridgeToken,
  stableStringify,
  verifyBridgeToken,
} from "../lib/federation.mjs";

const SECRET = "leadai-test-secret";

// Python: sign_exam_ace_token(
//   {"email": "student@example.com", "aud": "leadai", "exp": 1700003600},
//   "leadai-test-secret", now=1700000000)
const GOLDEN_TOKEN =
  "eyJhdWQiOiJsZWFkYWkiLCJlbWFpbCI6InN0dWRlbnRAZXhhbXBsZS5jb20iLCJleHAiOjE3MDAwMDM2MDAsImlhdCI6MTcwMDAwMDAwMH0" +
  ".0Qz_1NvqVTlXwVHHuNEe60KX1bsuvpe2yIkX3fN7WPs";
const GOLDEN_PAYLOAD = {
  email: "student@example.com",
  aud: "leadai",
  exp: 1700003600,
  iat: 1700000000,
};
const GOLDEN_NOW = 1700000100000; // ms: тот же момент, что 1700000100 в Python

test("golden vector из Python принимается без изменений", () => {
  const payload = verifyBridgeToken(GOLDEN_TOKEN, SECRET, { now: GOLDEN_NOW });
  assert.deepEqual(payload, GOLDEN_PAYLOAD);
});

test("JS подписывает тот же payload теми же байтами, что Python", () => {
  const token = signBridgeToken(GOLDEN_PAYLOAD, SECRET, { now: GOLDEN_NOW });
  assert.equal(token, GOLDEN_TOKEN);
});

test("порядок ключей и экранирование совпадают с json.dumps(sort_keys=True)", () => {
  assert.equal(
    stableStringify({ b: 1, a: "é" }),
    '{"a":"\\u00e9","b":1}'
  );
  assert.equal(stableStringify({ x: "\u007f" }), '{"x":"\\u007f"}');
  assert.equal(stableStringify({ z: [true, null, 2] }), '{"z":[true,null,2]}');
});

test("чужой секрет — bad_signature", () => {
  assert.throws(
    () => verifyBridgeToken(GOLDEN_TOKEN, "другой-секрет", { now: GOLDEN_NOW }),
    (error) => error instanceof BridgeTokenError && error.code === "bad_signature"
  );
});

test("истёкший токен — expired", () => {
  assert.throws(
    () => verifyBridgeToken(GOLDEN_TOKEN, SECRET, { now: 1700003601000 }),
    (error) => error.code === "expired"
  );
});

test("токен для другого продукта — wrong_audience", () => {
  const examAce = signBridgeToken(
    { email: "student@example.com", aud: "exam-ace", exp: 1700003600 },
    SECRET,
    { now: GOLDEN_NOW }
  );
  assert.throws(
    () => verifyBridgeToken(examAce, SECRET, { now: GOLDEN_NOW }),
    (error) => error.code === "wrong_audience"
  );
  // Токен без aud — это EduOS → exam-ace, он тоже не наш.
  const noAud = signBridgeToken(
    { email: "student@example.com", exp: 1700003600 },
    SECRET,
    { now: GOLDEN_NOW }
  );
  assert.throws(
    () => verifyBridgeToken(noAud, SECRET, { now: GOLDEN_NOW }),
    (error) => error.code === "wrong_audience"
  );
});

test("подмена payload ломает подпись", () => {
  const [, signature] = GOLDEN_TOKEN.split(".");
  const forged = Buffer.from(
    JSON.stringify({ email: "evil@example.com", aud: "leadai", exp: 1700003600 })
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  assert.throws(
    () => verifyBridgeToken(`${forged}.${signature}`, SECRET, { now: GOLDEN_NOW }),
    (error) => error.code === "bad_signature"
  );
});

test("мусор вместо токена — malformed", () => {
  for (const junk of ["", "nodot", "a.", ".".repeat(300)]) {
    assert.throws(
      () => verifyBridgeToken(junk, SECRET, { now: GOLDEN_NOW }),
      (error) => error.code === "malformed"
    );
  }
});

test("не-ASCII email переживает round-trip", () => {
  const email = "Иван@Пример.РФ";
  const token = signBridgeToken(
    { email, aud: BRIDGE_AUDIENCE, exp: 1700003600 },
    SECRET,
    { now: GOLDEN_NOW }
  );
  const payload = verifyBridgeToken(token, SECRET, { now: GOLDEN_NOW });
  assert.equal(payload.email, email);
});

test("подпись без секрета невозможна", () => {
  assert.throws(
    () => signBridgeToken({ email: "a@b.c" }, "", { now: GOLDEN_NOW }),
    (error) => error.code === "missing_secret"
  );
  assert.throws(
    () => verifyBridgeToken(GOLDEN_TOKEN, "", { now: GOLDEN_NOW }),
    (error) => error.code === "missing_secret"
  );
});

test("readLeadaiToken не бросает — возвращает причину", () => {
  assert.deepEqual(readLeadaiToken(GOLDEN_TOKEN, { env: {} }), {
    linked: false,
    reason: "not_configured",
  });
  const env = { EDUOS_SSO_SECRET: SECRET };
  const ok = readLeadaiToken(GOLDEN_TOKEN, { env, now: GOLDEN_NOW });
  assert.equal(ok.linked, true);
  assert.equal(ok.email, "student@example.com");
  assert.equal(ok.emailKey, "student@example.com");
  assert.equal(ok.expiresAt, 1700003600);

  const stale = readLeadaiToken(GOLDEN_TOKEN, { env, now: 1700003601000 });
  assert.deepEqual(stale, { linked: false, reason: "expired" });
  assert.deepEqual(readLeadaiToken("", { env }), {
    linked: false,
    reason: "malformed",
  });
});

test("readLeadaiToken отдаёт глобальный subject, но не требует его", () => {
  const env = { EDUOS_SSO_SECRET: SECRET };

  // Старый отправитель (до P1-8): в payload только email. Поле есть всегда,
  // чтобы клиент не угадывал схему, но значение — null.
  const legacy = readLeadaiToken(GOLDEN_TOKEN, { env, now: GOLDEN_NOW });
  assert.equal(legacy.linked, true);
  assert.equal(legacy.subject, null);
  assert.equal(legacy.subjectVersion, null);

  // Новый отправитель: sub/sv доезжают вместе с email, формат тот же.
  const token = signBridgeToken(
    {
      email: "student@example.com",
      aud: "leadai",
      exp: 1700003600,
      sub: "eduos:usr_abc",
      sv: 3,
    },
    SECRET,
    { now: GOLDEN_NOW }
  );
  const bound = readLeadaiToken(token, { env, now: GOLDEN_NOW });
  assert.equal(bound.linked, true);
  assert.equal(bound.email, "student@example.com");
  assert.equal(bound.subject, "eduos:usr_abc");
  assert.equal(bound.subjectVersion, 3);
});

test("настройки читаются только из серверных переменных", () => {
  const settings = federationSettings({
    EDUOS_SSO_SECRET: SECRET,
    EDUOS_FEDERATION_URL: "https://eduos.example.com/",
    NEXT_PUBLIC_EDUOS_SSO_SECRET: "утечка",
  });
  assert.equal(settings.secret, SECRET);
  assert.equal(settings.eduosUrl, "https://eduos.example.com");
  assert.equal(settings.owner, "eduos");
  assert.equal(settings.audience, "leadai");
  assert.equal(settings.ttlSeconds, DEFAULT_TTL_SECONDS);

  assert.deepEqual(federationStatus({}), {
    owner: "eduos",
    audience: "leadai",
    configured: false,
    eduos_url_set: false,
    token_ttl_seconds: DEFAULT_TTL_SECONDS,
  });
  assert.equal(federationStatus({ EDUOS_SSO_SECRET: SECRET }).configured, true);
});

test("ссылка перехода строится только при заданном базовом URL", () => {
  assert.equal(handoffUrl("tok", { eduosUrl: "" }), null);
  assert.equal(
    handoffUrl("a.b", { eduosUrl: "https://eduos.example.com/" }),
    "https://eduos.example.com/api/federation/sso?token=a.b"
  );
});

test("нормализация email совпадает с правилом склейки EduOS", () => {
  assert.equal(normalizeEmail("  Student@Example.COM "), "student@example.com");
  assert.equal(normalizeEmail(undefined), "");
});
