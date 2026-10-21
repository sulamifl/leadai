/*
 * P2-9 — health приёмника LeadAI: `GET /api/federation/health`.
 *
 * Зачем отдельный эндпоинт, если есть `/api/federation/sso`
 * ---------------------------------------------------------
 * Хаб EduOS должен уметь отличить три разных мира:
 *
 *   `configured: true`  — мост настроен, handoff будет принят;
 *   `configured: false` — сервис жив, но его половина шва выключена;
 *   нет ответа          — сервис не развёрнут / упал.
 *
 * Поэтому здесь, в отличие от `/api/federation/sso`, **нет 404 при отсутствии
 * `EDUOS_SSO_SECRET`**: 404 неотличим от «сервиса нет» и отправил бы оператора
 * чинить деплой вместо переменной окружения. Ровно так же ведёт себя
 * `/api/bridge/health` в exam-ace (`200`, `enabled: false`).
 *
 * Что проверяем:
 *
 * 1. без секрета — 200 и `configured: false`, а не 404 и не 500;
 * 2. с секретом — `configured: true`;
 * 3. `eduos_url_set` честно отражает `EDUOS_FEDERATION_URL`;
 * 4. в ответе нет секрета, но есть имена маршрутов, которые хаб может дёрнуть;
 * 5. ответ не кэшируется и не пререндерится статически.
 *
 * Обработчик написан в ESM внутри CJS-пакета, поэтому грузим его через jiti —
 * как в `tests/logout-route.test.mjs` и `tests/unlink-route.test.mjs`.
 */
import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createRequire(import.meta.url)("jiti")(ROOT + path.sep);
const route = jiti("./app/api/federation/health/route.js");
const { GET, dynamic } = route;

const SECRET = "leadai-test-secret";
const ENDPOINT = "http://localhost/api/federation/health";

/** Задать окружение на время одного теста (и вернуть прежние значения). */
function withEnv(t, values) {
  const previous = new Map();
  for (const [key, value] of Object.entries(values)) {
    previous.set(key, process.env[key]);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  t.after(() => {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

async function call() {
  const response = await GET(new Request(ENDPOINT));
  return { response, body: await response.json() };
}

// ------------------------------------------------------------ не настроено

test("без EDUOS_SSO_SECRET health отвечает 200 и configured:false", async (t) => {
  withEnv(t, { EDUOS_SSO_SECRET: undefined, EDUOS_FEDERATION_URL: undefined });

  const { response, body } = await call();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.equal(body.configured, false);
  assert.equal(body.eduos_url_set, false);
  assert.equal(body.session, "none");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("ответ описывает владельца, аудиторию и TTL токена", async (t) => {
  withEnv(t, { EDUOS_SSO_SECRET: undefined });

  const { body } = await call();

  assert.equal(body.owner, "eduos");
  assert.equal(body.audience, "leadai");
  assert.equal(body.token_ttl_seconds, 1800);
});

// -------------------------------------------------------------- настроено

test("с секретом health говорит configured:true", async (t) => {
  withEnv(t, { EDUOS_SSO_SECRET: SECRET });

  const { response, body } = await call();

  assert.equal(response.status, 200);
  assert.equal(body.configured, true);
});

test("eduos_url_set отражает EDUOS_FEDERATION_URL", async (t) => {
  withEnv(t, {
    EDUOS_SSO_SECRET: SECRET,
    EDUOS_FEDERATION_URL: "https://eduos.example.org/",
  });

  const { body } = await call();

  assert.equal(body.eduos_url_set, true);
});

test("пустая строка в EDUOS_FEDERATION_URL — это не заданный URL", async (t) => {
  withEnv(t, { EDUOS_SSO_SECRET: SECRET, EDUOS_FEDERATION_URL: "" });

  const { body } = await call();

  assert.equal(body.eduos_url_set, false);
});

// ----------------------------------------------------------- гигиена ответа

test("секрет не утекает в ответ, а маршруты перечислены", async (t) => {
  withEnv(t, { EDUOS_SSO_SECRET: SECRET });

  const { body } = await call();
  const raw = JSON.stringify(body);

  assert.equal(raw.includes(SECRET), false);
  assert.equal(raw.includes("secret"), false);
  assert.deepEqual(body.endpoints, {
    sso: "/api/federation/sso",
    logout: "/api/federation/logout",
    unlink: "/api/federation/unlink",
  });
});

test("маршрут помечен как динамический — статус нельзя пререндерить", () => {
  assert.equal(dynamic, "force-dynamic");
});
