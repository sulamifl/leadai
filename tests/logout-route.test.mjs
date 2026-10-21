/*
 * P1-8C — приёмник единого выхода в LeadAI.
 *
 * Хаб EduOS при выходе рассылает уведомление `act=logout` и собирает карту
 * `delivered`. Для LeadAI гасить нечего: Firebase-сессии здесь нет, поэтому
 * честный ответ — `loggedOut: true, session: "none"`. Молчание или 501
 * выглядели бы как сломанная федерация, хотя продукт просто устроен иначе.
 *
 * Что проверяем:
 *
 * 1. без `EDUOS_SSO_SECRET` эндпоинта как будто нет (404), и это не 500;
 * 2. испорченный/просроченный/чужой токен — 401 с машинной причиной;
 * 3. handoff-токен тем же секретом не имеет права «разлогинивать» — 400;
 * 4. успешный ответ подтверждает выход, сохраняет subject (человек вернётся)
 *    и возвращает версию `sv`, на которой сессия закончилась;
 * 5. ответ не кэшируется.
 *
 * Файл маршрута написан в ESM внутри CJS-пакета, поэтому грузим настоящий
 * обработчик через jiti (приходит транзитивно с tailwindcss), как в
 * `tests/unlink-route.test.mjs`.
 */
import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { signBridgeToken } from "../lib/federation.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createRequire(import.meta.url)("jiti")(ROOT + path.sep);
const { GET } = jiti("./app/api/federation/logout/route.js");

const ENV_KEY = "EDUOS_SSO_SECRET";
const SECRET = "leadai-test-secret";
const EMAIL = "student@example.com";
const SUBJECT = "eduos:usr_0123456789abcdef0123456789abcdef";
const ENDPOINT = "http://localhost/api/federation/logout";

function futureExp() {
  return Math.floor(Date.now() / 1000) + 600;
}

/** Оставить секрет в окружении только на время одного теста. */
function configure(t) {
  const previous = process.env[ENV_KEY];
  process.env[ENV_KEY] = SECRET;
  t.after(() => {
    if (previous === undefined) delete process.env[ENV_KEY];
    else process.env[ENV_KEY] = previous;
  });
}

/** Уведомление хаба: тот же контракт, что строит EduOS для LeadAI. */
function logoutToken(email = EMAIL, payload = {}) {
  return signBridgeToken(
    { email, aud: "leadai", act: "logout", sub: SUBJECT, sv: 3, exp: futureExp(), ...payload },
    SECRET
  );
}

async function call(token) {
  const url = token === undefined ? ENDPOINT : `${ENDPOINT}?token=${encodeURIComponent(token)}`;
  const response = await GET(new Request(url));
  return { response, body: await response.json() };
}

// ------------------------------------------------------------ не настроено

test("без EDUOS_SSO_SECRET уведомление о выходе не обслуживается", async (t) => {
  const previous = process.env[ENV_KEY];
  delete process.env[ENV_KEY];
  t.after(() => {
    if (previous === undefined) delete process.env[ENV_KEY];
    else process.env[ENV_KEY] = previous;
  });

  const { response, body } = await call(logoutToken());

  assert.equal(response.status, 404);
  assert.deepEqual(body, { error: "federation is not configured" });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

// --------------------------------------------------------- плохие токены

test("мусор вместо токена — 401 с причиной, а не исключение", async (t) => {
  configure(t);

  const { response, body } = await call("not-a-token");

  assert.equal(response.status, 401);
  assert.deepEqual(body, { loggedOut: false, reason: "malformed" });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("токен без параметра token — тот же 401 malformed", async (t) => {
  configure(t);

  const { response, body } = await call(undefined);

  assert.equal(response.status, 401);
  assert.deepEqual(body, { loggedOut: false, reason: "malformed" });
});

test("чужой секрет — 401 bad_signature и никакого выхода", async (t) => {
  configure(t);
  const forged = signBridgeToken(
    { email: EMAIL, aud: "leadai", act: "logout", sub: SUBJECT, sv: 3, exp: futureExp() },
    "wrong-secret"
  );

  const { response, body } = await call(forged);

  assert.equal(response.status, 401);
  assert.deepEqual(body, { loggedOut: false, reason: "bad_signature" });
});

test("просроченное уведомление не применяется", async (t) => {
  configure(t);
  const stale = logoutToken(EMAIL, { exp: Math.floor(Date.now() / 1000) - 1 });

  const { response, body } = await call(stale);

  assert.equal(response.status, 401);
  assert.deepEqual(body, { loggedOut: false, reason: "expired" });
});

test("токен, выпущенный для другого продукта, не принимается", async (t) => {
  configure(t);
  const foreign = logoutToken(EMAIL, { aud: "exam-ace" });

  const { response, body } = await call(foreign);

  assert.equal(response.status, 401);
  assert.deepEqual(body, { loggedOut: false, reason: "wrong_audience" });
});

// ------------------------------------------------- не тот тип уведомления

test("handoff-токен не имеет права разлогинивать человека", async (t) => {
  configure(t);
  const handoff = signBridgeToken(
    { email: EMAIL, aud: "leadai", sub: SUBJECT, sv: 3, exp: futureExp() },
    SECRET
  );

  const { response, body } = await call(handoff);

  assert.equal(response.status, 400);
  assert.deepEqual(body, { loggedOut: false, reason: "not_a_logout_notice" });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("уведомление об отвязке не выдаётся за выход", async (t) => {
  configure(t);
  const unlink = logoutToken(EMAIL, { act: "unlink" });

  const { response, body } = await call(unlink);

  assert.equal(response.status, 400);
  assert.deepEqual(body, { loggedOut: false, reason: "not_a_logout_notice" });
});

// -------------------------------------------------------------- успех

test("уведомление подтверждает выход и сохраняет subject", async (t) => {
  configure(t);

  const { response, body } = await call(logoutToken());

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    loggedOut: true,
    owner: "eduos",
    // Subject остаётся нашим: человек выйдет и снова войдёт, прогресс жив.
    subject: SUBJECT,
    subjectVersion: 3,
    email: EMAIL,
    emailKey: EMAIL,
    // Сессии нет — и это сказано прямо, а не умолчано.
    session: "none",
  });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("версия из уведомления доезжает до ответа как есть", async (t) => {
  configure(t);

  const { body } = await call(logoutToken(EMAIL, { sv: 11 }));

  assert.equal(body.subjectVersion, 11);
});

test("старый отправитель без sv даёт честный null, а не ноль", async (t) => {
  configure(t);
  const legacy = signBridgeToken(
    { email: EMAIL, aud: "leadai", act: "logout", exp: futureExp() },
    SECRET
  );

  const { response, body } = await call(legacy);

  assert.equal(response.status, 200);
  assert.equal(body.loggedOut, true);
  assert.equal(body.subject, null);
  assert.equal(body.subjectVersion, null);
});

test("выход незнакомого человека тоже принимается — гасить нечего", async (t) => {
  configure(t);

  const { response, body } = await call(logoutToken("nobody@example.com"));

  assert.equal(response.status, 200);
  assert.equal(body.loggedOut, true);
  assert.equal(body.email, "nobody@example.com");
  // LeadAI не хранит аккаунтов: «не знали» и «вышел» — одно и то же действие.
  assert.equal(body.session, "none");
});
