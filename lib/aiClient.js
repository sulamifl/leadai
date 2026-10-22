"use client";

/**
 * Клиентский помощник для запросов к защищённым AI-роутам.
 *
 * Проблема, которую он решает: сервер (`/api/ai`, `/api/openai`, `/api/voice`,
 * `/api/codeAI`, `/api/getRecommendations`) теперь требует Firebase ID-token,
 * а прямой `fetch` его не передаёт. `aiFetch` — замена `fetch` один-к-одному:
 *   const response = await aiFetch("/api/ai", { method: "POST", headers, body });
 *   const data = await response.json();
 *   if (!response.ok) throw new Error(data.error);
 *
 * Поведение:
 *  - подставляет `Authorization: Bearer <idToken>` текущего пользователя;
 *  - при 401 один раз повторяет запрос с принудительно обновлённым токеном
 *    (истёкший токен — обычное дело после долгой сессии);
 *  - при 401/429 подменяет поле `error` на человекочитаемый `message`,
 *    потому что страницы показывают именно `data.error`.
 */

import { auth } from "./firebase";

/** Возвращает ID-token текущего пользователя либо пустую строку. */
export async function getIdToken(forceRefresh = false) {
  try {
    const user = auth?.currentUser;
    if (!user) return "";
    return await user.getIdToken(forceRefresh);
  } catch {
    return "";
  }
}

/** Переписывает тело 401/429, чтобы `data.error` был понятным текстом. */
async function withReadableError(response) {
  let data = {};
  try {
    data = await response.clone().json();
  } catch {
    data = {};
  }
  const message =
    data.message ||
    data.error ||
    (response.status === 429
      ? "Слишком много запросов. Подождите и повторите."
      : "Требуется вход в аккаунт.");
  return new Response(JSON.stringify({ ...data, error: message }), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

/**
 * `fetch` с Firebase ID-token и обработкой 401/429.
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function aiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const send = async (forceRefresh) => {
    const token = await getIdToken(forceRefresh);
    const finalHeaders = new Headers(headers);
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...options, headers: finalHeaders });
  };

  let response = await send(false);

  if (response.status === 401) {
    response = await send(true);
  }

  if (response.status === 401 || response.status === 429) {
    return withReadableError(response);
  }

  return response;
}

/**
 * Удобная обёртка: POST JSON и сразу разобранный ответ.
 * Бросает ошибку с текстом из `error`/`message`.
 */
export async function aiJson(url, payload, options = {}) {
  const response = await aiFetch(url, {
    ...options,
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Ошибка запроса (${response.status})`);
  }
  return data;
}

export default aiFetch;
