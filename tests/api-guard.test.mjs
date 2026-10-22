/*
 * Тесты лимитов и единого стража `/api/ai` (lib/rateLimit.mjs + lib/apiGuard.mjs).
 *
 * Цель — доказать, что платный API нельзя дёргать без ограничений:
 *  - ограничитель скользящего окна пускает ровно `limit` запросов;
 *  - уровни проверяются в порядке global → user → ip;
 *  - отказ превращается в 429 с Retry-After, а не в тихую передачу в модель;
 *  - без токена роут отвечает 401 и до модели не доходит.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { guardAiRequest, jsonResponse } from "../lib/apiGuard.mjs";
import {
  AI_LIMITS,
  checkAiRateLimit,
  createRateLimiter,
  getClientIp,
  rateLimitHeaders,
} from "../lib/rateLimit.mjs";

function limiters({ user = 10, ip = 10, global = 100, windowMs = 1000, now } = {}) {
  return {
    perUser: createRateLimiter({ limit: user, windowMs, now }),
    perIp: createRateLimiter({ limit: ip, windowMs, now }),
    global: createRateLimiter({ limit: global, windowMs, now }),
  };
}

// ---------------------------------------------------------------------------
// Ограничитель скользящего окна
// ---------------------------------------------------------------------------

test("createRateLimiter: пускает ровно limit запросов и считает remaining", () => {
  let now = 0;
  const limiter = createRateLimiter({ limit: 3, windowMs: 1000, now: () => now });

  assert.equal(limiter.check("u:1").allowed, true);
  assert.equal(limiter.check("u:1").remaining, 1);
  assert.equal(limiter.check("u:1").allowed, true);

  const denied = limiter.check("u:1");
  assert.equal(denied.allowed, false);
  assert.equal(denied.remaining, 0);
  assert.ok(denied.retryAfterMs > 0);

  // Ключи независимы.
  assert.equal(limiter.check("u:2").allowed, true);
});

test("createRateLimiter: окно скользит, старые попытки освобождают место", () => {
  let now = 0;
  const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: () => now });

  assert.equal(limiter.check("ip:1").allowed, true);
  now = 400;
  assert.equal(limiter.check("ip:1").allowed, true);
  assert.equal(limiter.check("ip:1").allowed, false);

  now = 1001; // первая попытка вышла из окна
  assert.equal(limiter.check("ip:1").allowed, true);
  now = 1500; // вторая тоже
  assert.equal(limiter.check("ip:1").allowed, true);
});

test("createRateLimiter: cost > limit и cost > 1", () => {
  const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: () => 0 });
  assert.equal(limiter.check("k", 3).allowed, false);
  assert.equal(limiter.check("k", 2).allowed, true);
  assert.equal(limiter.check("k").allowed, false);
});

test("createRateLimiter: reset и size работают как ожидается", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => 0 });
  limiter.check("a");
  limiter.check("b");
  assert.equal(limiter.size(), 2);
  limiter.reset("a");
  assert.equal(limiter.size(), 1);
  assert.equal(limiter.check("a").allowed, true);
  limiter.reset();
  assert.equal(limiter.size(), 0);
});

test("createRateLimiter: maxKeys вытесняет самые старые ключи (защита от роста карты)", () => {
  const limiter = createRateLimiter({
    limit: 10,
    windowMs: 1000,
    maxKeys: 2,
    now: () => 0,
  });
  limiter.check("a");
  limiter.check("b");
  limiter.check("c");
  assert.equal(limiter.size(), 2);
  assert.equal(limiter.check("c").allowed, true);
});

test("createRateLimiter: некорректные параметры — явная ошибка", () => {
  assert.throws(() => createRateLimiter({ limit: 0, windowMs: 1000 }), /limit/);
  assert.throws(() => createRateLimiter({ limit: 1, windowMs: 0 }), /windowMs/);
});

// ---------------------------------------------------------------------------
// IP клиента
// ---------------------------------------------------------------------------

test("getClientIp: x-forwarded-for, x-real-ip, cf-connecting-ip", () => {
  assert.equal(
    getClientIp({ headers: new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }) }),
    "1.2.3.4"
  );
  assert.equal(getClientIp({ headers: { "x-real-ip": "9.9.9.9" } }), "9.9.9.9");
  assert.equal(getClientIp({ headers: { "cf-connecting-ip": "8.8.8.8" } }), "8.8.8.8");
  assert.equal(getClientIp({ headers: {} }), "unknown");
  assert.equal(getClientIp(null), "unknown");
});

// ---------------------------------------------------------------------------
// Уровни проверки
// ---------------------------------------------------------------------------

test("checkAiRateLimit: сначала глобальный предохранитель", () => {
  const buckets = limiters({ global: 1 });
  assert.equal(checkAiRateLimit({ userId: "u1", ip: "1.1.1.1" }, buckets).ok, true);

  const second = checkAiRateLimit({ userId: "u2", ip: "2.2.2.2" }, buckets);
  assert.equal(second.ok, false);
  assert.equal(second.level, "global");
});

test("checkAiRateLimit: лимит на пользователя не переносится на другого", () => {
  const buckets = limiters({ user: 1, ip: 100 });
  assert.equal(checkAiRateLimit({ userId: "u1", ip: "1.1.1.1" }, buckets).ok, true);

  const again = checkAiRateLimit({ userId: "u1", ip: "9.9.9.9" }, buckets);
  assert.equal(again.ok, false);
  assert.equal(again.level, "user");

  assert.equal(checkAiRateLimit({ userId: "u2", ip: "1.1.1.1" }, buckets).ok, true);
});

test("checkAiRateLimit: анонимы ограничиваются по IP", () => {
  const buckets = limiters({ user: 100, ip: 1 });
  assert.equal(checkAiRateLimit({ userId: "", ip: "1.1.1.1" }, buckets).ok, true);

  const second = checkAiRateLimit({ userId: "", ip: "1.1.1.1" }, buckets);
  assert.equal(second.ok, false);
  assert.equal(second.level, "ip");

  // Другой IP — снова можно, даже если это другой аноним.
  assert.equal(checkAiRateLimit({ userId: "", ip: "2.2.2.2" }, buckets).ok, true);
});

test("AI_LIMITS: значения по умолчанию осмысленны", () => {
  assert.ok(AI_LIMITS.perUser.limit > 0);
  assert.ok(AI_LIMITS.perIp.limit > 0);
  assert.ok(AI_LIMITS.global.limit >= AI_LIMITS.perUser.limit);
  assert.ok(AI_LIMITS.perUser.windowMs > 0);
});

test("rateLimitHeaders: Retry-After не меньше секунды и всегда строки", () => {
  const headers = rateLimitHeaders({ retryAfterMs: 1_400, limit: 40 });
  assert.equal(headers["Retry-After"], "2");
  assert.equal(headers["X-RateLimit-Limit"], "40");
  assert.equal(headers["X-RateLimit-Remaining"], "0");
  assert.equal(rateLimitHeaders(null)["Retry-After"], "1");
});

test("jsonResponse: статус, JSON-тело и дополнительные заголовки", async () => {
  const res = jsonResponse({ error: "x" }, 429, { "Retry-After": "5" });
  assert.equal(res.status, 429);
  assert.equal(res.headers.get("content-type"), "application/json");
  assert.equal(res.headers.get("retry-after"), "5");
  assert.deepEqual(await res.json(), { error: "x" });
});

// ---------------------------------------------------------------------------
// guardAiRequest: то, что видит роут
// ---------------------------------------------------------------------------

const req = (ip = "1.2.3.4") =>
  new Request("http://localhost/api/ai", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
  });

test("guardAiRequest: без токена — 401 и никакой модели", async () => {
  const result = await guardAiRequest(req(), { mode: "required", limiters: limiters() });
  assert.equal(result.ok, false);
  assert.equal(result.response.status, 401);
  const body = await result.response.json();
  assert.equal(body.error, "unauthorized");
});

test("guardAiRequest: превышение лимита — 429 с Retry-After", async () => {
  const buckets = limiters({ ip: 1, global: 100, user: 100 });

  const first = await guardAiRequest(req("5.5.5.5"), { mode: "off", limiters: buckets });
  assert.equal(first.ok, true);
  assert.equal(first.anonymous, true);

  const second = await guardAiRequest(req("5.5.5.5"), { mode: "off", limiters: buckets });
  assert.equal(second.ok, false);
  assert.equal(second.response.status, 429);
  assert.ok(second.response.headers.get("retry-after"));
  const body = await second.response.json();
  assert.equal(body.error, "rate_limited");
  assert.equal(body.level, "ip");
});

test("guardAiRequest: аноним с чужого IP не делит счётчик с предыдущим", async () => {
  const buckets = limiters({ ip: 1 });
  const a = await guardAiRequest(req("7.7.7.7"), { mode: "off", limiters: buckets });
  const b = await guardAiRequest(req("8.8.8.8"), { mode: "off", limiters: buckets });
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
});

test("guardAiRequest: глобальный отказ тоже 429 и указывает уровень", async () => {
  const buckets = limiters({ global: 1, ip: 100, user: 100 });
  await guardAiRequest(req("1.1.1.1"), { mode: "off", limiters: buckets });
  const blocked = await guardAiRequest(req("2.2.2.2"), { mode: "off", limiters: buckets });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.response.status, 429);
  assert.equal((await blocked.response.json()).level, "global");
});
