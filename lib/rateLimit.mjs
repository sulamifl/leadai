/**
 * In-memory rate limiting для `/api/ai`.
 *
 * Ограничитель скользящего окна: для каждого ключа хранится список меток
 * времени успешных запросов внутри окна. Память ограничена: при превышении
 * `maxKeys` самые старые ключи вытесняются, поэтому карта не растёт бесконечно
 * при сканировании с разных IP.
 *
 * Ограничения in-memory (сознательно, без Redis):
 *  - счётчики не разделяются между инстансами serverless — на Vercel каждый
 *    инстанс считает свои, поэтому лимит работает как «мягкий» барьер;
 *  - при перезапуске процесса счётчики обнуляются.
 * Для целей «закрыть открытый прокси к платному API» этого достаточно:
 * запросы без токена отклоняются до вызова модели, а токен привязан к uid.
 */

const DEFAULT_MAX_KEYS = 20000;

/**
 * @param {{limit: number, windowMs: number, maxKeys?: number, now?: () => number}} options
 */
export function createRateLimiter(options) {
  const { limit, windowMs, maxKeys = DEFAULT_MAX_KEYS, now = () => Date.now() } = options || {};
  if (!Number.isFinite(limit) || limit <= 0) throw new Error("rateLimit: limit must be > 0");
  if (!Number.isFinite(windowMs) || windowMs <= 0) throw new Error("rateLimit: windowMs must be > 0");

  /** @type {Map<string, number[]>} */
  const buckets = new Map();
  let lastPrune = 0;

  function evictOldest() {
    // Map сохраняет порядок вставки: первый ключ — самый старый.
    const oldest = buckets.keys().next();
    if (!oldest.done) buckets.delete(oldest.value);
  }

  function prune(t) {
    for (const [key, timestamps] of buckets) {
      const fresh = timestamps.filter((ts) => t - ts < windowMs);
      if (!fresh.length) buckets.delete(key);
      else buckets.set(key, fresh);
    }
    lastPrune = t;
  }

  return {
    limit,
    windowMs,
    /**
     * Регистрирует попытку.
     * @param {string} key
     * @param {number} [cost=1]
     * @returns {{allowed: boolean, remaining: number, retryAfterMs: number, limit: number, windowMs: number}}
     */
    check(key, cost = 1) {
      const t = now();
      if (t - lastPrune > windowMs) prune(t);

      const bucket = (buckets.get(key) || []).filter((ts) => t - ts < windowMs);

      if (bucket.length + cost > limit) {
        const oldest = bucket[0] ?? t;
        const retryAfterMs = Math.max(0, windowMs - (t - oldest));
        buckets.set(key, bucket);
        return { allowed: false, remaining: 0, retryAfterMs, limit, windowMs };
      }

      for (let i = 0; i < cost; i += 1) bucket.push(t);

      if (!buckets.has(key) && buckets.size >= maxKeys) evictOldest();
      buckets.set(key, bucket);

      return {
        allowed: true,
        remaining: Math.max(0, limit - bucket.length),
        retryAfterMs: 0,
        limit,
        windowMs,
      };
    },

    /** Сбрасывает один ключ или весь ограничитель. */
    reset(key) {
      if (key === undefined) buckets.clear();
      else buckets.delete(key);
    },

    /** Количество активных ключей (для тестов и метрик). */
    size() {
      return buckets.size;
    },
  };
}

/** Достаёт IP клиента с учётом прокси (Vercel / Cloudflare). */
export function getClientIp(req) {
  const headers = req?.headers;
  const read = (name) => {
    if (!headers) return "";
    if (typeof headers.get === "function") return headers.get(name) || "";
    return headers[name] || "";
  };
  const forwarded = read("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return read("x-real-ip") || read("cf-connecting-ip") || "unknown";
}

function envInt(name, fallback) {
  const raw = process.env?.[name];
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Лимиты по умолчанию (можно переопределить переменными окружения). */
export const AI_LIMITS = {
  perUser: {
    limit: envInt("AI_RATE_USER_LIMIT", 40),
    windowMs: envInt("AI_RATE_USER_WINDOW_MS", 5 * 60 * 1000),
  },
  perIp: {
    limit: envInt("AI_RATE_IP_LIMIT", 20),
    windowMs: envInt("AI_RATE_IP_WINDOW_MS", 5 * 60 * 1000),
  },
  global: {
    limit: envInt("AI_RATE_GLOBAL_LIMIT", 600),
    windowMs: envInt("AI_RATE_GLOBAL_WINDOW_MS", 60 * 1000),
  },
};

/**
 * Проверяет все уровни и возвращает первый отказ.
 * @param {{userId?: string, ip?: string}} identity
 * @returns {{ok: boolean, level?: string, retryAfterMs?: number, result?: object}}
 */
export function checkAiRateLimit(identity, limiters) {
  const { perUser, perIp, global } = limiters || getDefaultLimiters();

  // Глобальный предохранитель — от каскадного отказа при абьюзе.
  const g = global.check("global");
  if (!g.allowed) return { ok: false, level: "global", retryAfterMs: g.retryAfterMs, result: g };

  if (identity?.userId) {
    const u = perUser.check(`u:${identity.userId}`);
    if (!u.allowed) return { ok: false, level: "user", retryAfterMs: u.retryAfterMs, result: u };
  }

  const ip = identity?.ip || "unknown";
  const i = perIp.check(`ip:${ip}`);
  if (!i.allowed) return { ok: false, level: "ip", retryAfterMs: i.retryAfterMs, result: i };

  return { ok: true };
}

let cachedLimiters = null;

/** Ленивая инициализация, чтобы env-переменные читались после загрузки .env. */
export function getDefaultLimiters() {
  if (!cachedLimiters) {
    cachedLimiters = {
      perUser: createRateLimiter(AI_LIMITS.perUser),
      perIp: createRateLimiter(AI_LIMITS.perIp),
      global: createRateLimiter(AI_LIMITS.global),
    };
  }
  return cachedLimiters;
}

/** Только для тестов: подменить/сбросить ограничители. */
export function __setDefaultLimiters(limiters) {
  cachedLimiters = limiters;
}

/** Формирует заголовки ответа 429. */
export function rateLimitHeaders(result) {
  const seconds = Math.max(1, Math.ceil((result?.retryAfterMs || 1000) / 1000));
  return {
    "Retry-After": String(seconds),
    "X-RateLimit-Limit": String(result?.limit ?? ""),
    "X-RateLimit-Remaining": "0",
  };
}
