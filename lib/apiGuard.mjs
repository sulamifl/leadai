/**
 * Единый страж для всех роутов, которые ходят в платный DeepSeek API.
 *
 * Зачем отдельный модуль: `/api/ai` — не единственная дверь наружу.
 * Исторические роуты `/api/openai`, `/api/voice`, `/api/codeAI` и
 * `/api/getRecommendations` реэкспортировали обработчики из `lib/aiHandlers.js`
 * напрямую, то есть оставались такими же открытыми прокси к платному API.
 * Теперь все они проходят через `guardAiRequest`, и точка проверки одна.
 *
 * Порядок проверок:
 *   1. авторизация (Firebase ID-token) → 401/500/503;
 *   2. лимиты: глобальный → per-user → per-IP → 429 с Retry-After.
 */

import { requireUser } from "./apiAuth.mjs";
import { checkAiRateLimit, getClientIp, rateLimitHeaders } from "./rateLimit.mjs";

/** JSON-ответ с произвольными дополнительными заголовками. */
export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

/**
 * @param {Request} req
 * @param {{fetchImpl?: Function, now?: number, mode?: string, projectId?: string, limiters?: object}} [options]
 * @returns {Promise<{ok: true, user: object, anonymous: boolean} | {ok: false, response: Response}>}
 */
export async function guardAiRequest(req, options = {}) {
  const auth = await requireUser(req, options);
  if (!auth.ok) {
    return {
      ok: false,
      response: jsonResponse({ error: auth.error, message: auth.message }, auth.status),
    };
  }

  // Анонимные запросы (режимы optional/off) считаются только по IP:
  // иначе все анонимы делили бы один общий пользовательский счётчик.
  const limited = checkAiRateLimit(
    {
      userId: auth.anonymous ? "" : auth.user.uid,
      ip: getClientIp(req),
    },
    options.limiters
  );

  if (!limited.ok) {
    return {
      ok: false,
      response: jsonResponse(
        {
          error: "rate_limited",
          level: limited.level,
          retryAfterMs: limited.retryAfterMs,
          message: "Слишком много запросов к ИИ. Подождите и повторите.",
        },
        429,
        rateLimitHeaders(limited.result)
      ),
    };
  }

  return { ok: true, user: auth.user, anonymous: Boolean(auth.anonymous) };
}

export default guardAiRequest;
