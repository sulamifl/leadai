/*
 * P1-8B — приёмник unlink в LeadAI.
 *
 * Хаб EduOS при разрыве связи рассылает уведомление `act=unlink` и ждёт от
 * каждого продукта честного ответа «ключ забыт». Для LeadAI это единственное
 * возможное действие: Firebase-сессии здесь нет, поэтому `session: "none"`
 * говорит вызывающей стороне, что пустота — не сбой.
 *
 * Что проверяем:
 *
 * 1. без `EDUOS_SSO_SECRET` эндпоинта как будто нет (404), и это не 500;
 * 2. любой испорченный токен — 401 с машинной причиной, а не исключение;
 * 3. handoff-токен, подписанный тем же секретом, не имеет права «отвязывать»
 *    человека — 400 `not_an_unlink_notice`;
 * 4. успешный ответ возвращает версию из уведомления (`sv`), но не сам
 *    subject: после unlink он больше не наш;
 * 5. ни один ответ не кэшируется — иначе следующий unlink «не случится».
 *
 * Файл маршрута написан в ESM-синтаксисе внутри CJS-пакета (в package.json нет
 * `"type": "module"`), поэтому Node не импортирует его напрямую. Тест грузит
 * настоящий обработчик через jiti, который уже есть в дереве зависимостей
 * (приходит транзитивно с tailwindcss), — так проверяется код продукта, а не
 * его копия в тесте.
 */
import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { signBridgeToken } from "../lib/federation.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createRequire(import.meta.url)("jiti")(ROOT + path.sep);
const { GET } = jiti("./app/api/federation/unlink/route.js");

const ENV_KEY = "EDUOS_SSO_SECRET";
const SECRET = "leadai-test-secret";
const EMAIL = "student@example.com";
const SUBJECT = "eduos:usr_0123456789abcdef0123456789abcdef";
const OTHER_SUBJECT = "eduos:usr_fedcba9876543210fedcba9876543210";
const ENDPOINT = "http://localhost/api/federation/unlink";

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
function unlinkToken(email = EMAIL, payload = {}) {
  return signBridgeToken(
    { email, aud: "leadai", act: "unlink", sub: SUBJECT, sv: 2, exp: futureExp(), ...payload },
    SECRET
  );
}

async function call(token) {
  const url = token === undefined ? ENDPOINT : `${ENDPOINT}?token=${encodeURIComponent(token)}`;
  const response = await GET(new Request(url));
  return { response, body: await response.json() };
}

// ------------------------------------------------------------ не настроено

test("без EDUOS_SSO_SECRET уведомление не обслуживается вообще", async (t) => {
  const previous = process.env[ENV_KEY];
  delete process.env[ENV_KEY];
  t.after(() => {
    if (previous === undefined) delete process.env[ENV_KEY];
    else process.env[ENV_KEY] = previous;
  });

  const { response, body } = await call(unlinkToken());

  assert.equal(response.status, 404);
  assert.deepEqual(body, { error: "federation is not configured" });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

// --------------------------------------------------------- плохие токены

test("мусор вместо токена — 401 с причиной, а не исключение", async (t) => {
  configure(t);

  const { response, body } = await call("not-a-token");

  assert.equal(response.status, 401);
  assert.deepEqual(body, { unlinked: false, reason: "malformed" });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("токен без параметра token — тот же 401 malformed", async (t) => {
  configure(t);

  const { response, body } = await call(undefined);

  assert.equal(response.status, 401);
  assert.deepEqual(body, { unlinked: false, reason: "malformed" });
});

test("чужой секрет — 401 bad_signature и никакого unlink", async (t) => {
  configure(t);
  const forged = signBridgeToken(
    { email: EMAIL, aud: "leadai", act: "unlink", sub: SUBJECT, sv: 2, exp: futureExp() },
    "wrong-secret"
  );

  const { response, body } = await call(forged);

  assert.equal(response.status, 401);
  assert.deepEqual(body, { unlinked: false, reason: "bad_signature" });
});

test("просроченное уведомление не применяется", async (t) => {
  configure(t);
  const stale = unlinkToken(EMAIL, { exp: Math.floor(Date.now() / 1000) - 1 });

  const { response, body } = await call(stale);

  assert.equal(response.status, 401);
  assert.deepEqual(body, { unlinked: false, reason: "expired" });
});

test("токен, выпущенный для другого продукта, не принимается", async (t) => {
  configure(t);
  const foreign = unlinkToken(EMAIL, { aud: "exam-ace" });

  const { response, body } = await call(foreign);

  assert.equal(response.status, 401);
  assert.deepEqual(body, { unlinked: false, reason: "wrong_audience" });
});

// ------------------------------------------------- не тот тип уведомления

test("handoff-токен не имеет права отвязывать человека", async (t) => {
  configure(t);
  const handoff = signBridgeToken(
    { email: EMAIL, aud: "leadai", sub: SUBJECT, sv: 2, exp: futureExp() },
    SECRET
  );

  const { response, body } = await call(handoff);

  assert.equal(response.status, 400);
  assert.deepEqual(body, { unlinked: false, reason: "not_an_unlink_notice" });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

// -------------------------------------------------------------- успех

test("уведомление подтверждает unlink и возвращает версию subject", async (t) => {
  configure(t);

  const { response, body } = await call(unlinkToken());

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    unlinked: true,
    owner: "eduos",
    // Сам subject больше не наш — иначе мы бы соврали о состоянии.
    subject: null,
    subjectVersion: 2,
    email: EMAIL,
    emailKey: EMAIL,
    session: "none",
  });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("версия из уведомления доезжает до ответа как есть", async (t) => {
  configure(t);

  const { body } = await call(unlinkToken(EMAIL, { sv: 7 }));

  assert.equal(body.subjectVersion, 7);
});

test("уведомление о человеке, которого мы не знали, тоже принимается", async (t) => {
  configure(t);

  const { response, body } = await call(unlinkToken("nobody@example.com", { sub: OTHER_SUBJECT }));

  assert.equal(response.status, 200);
  assert.equal(body.unlinked, true);
  assert.equal(body.email, "nobody@example.com");
  // LeadAI не хранит аккаунтов: «не знали» и «забыли» — одно и то же действие.
  assert.equal(body.session, "none");
});

test("старый отправитель без sv даёт честный null, а не ноль", async (t) => {
  configure(t);
  const legacy = signBridgeToken(
    { email: EMAIL, aud: "leadai", act: "unlink", sub: SUBJECT },
    SECRET
  );

  const { response, body } = await call(legacy);

  assert.equal(response.status, 200);
  assert.equal(body.subjectVersion, null);
  assert.equal(body.subject, null);
});

test("email в уведомлении нормализуется для поиска, но отдаётся как пришёл", async (t) => {
  configure(t);

  const { body } = await call(unlinkToken("  Student@Example.COM  "));

  assert.equal(body.emailKey, "student@example.com");
  assert.equal(body.email, "  Student@Example.COM  ");
});

test("повторное уведомление не ломается", async (t) => {
  configure(t);
  const token = unlinkToken();

  const first = await call(token);
  const second = await call(token);

  assert.equal(first.response.status, 200);
  assert.equal(second.response.status, 200);
  // Повтор идемпотентен по смыслу: ключ уже забыт, отвечаем тем же.
  assert.equal(second.body.unlinked, true);
  assert.equal(second.body.subjectVersion, 2);
});
