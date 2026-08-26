// Единый серверный клиент DeepSeek API.
// Используется только в серверных API-роутах (app/api/**), поэтому
// ключ никогда не попадает в клиентский бандл.

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

/**
 * Выполняет запрос к DeepSeek Chat Completions API.
 * @param {Array<{role: string, content: string}>} messages - массив сообщений
 * @param {Object} [options] - дополнительные опции (max_tokens, temperature)
 * @returns {Promise<string>} - текст ответа модели
 */
export async function chatCompletion(messages, options = {}) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not defined");
  }

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      max_tokens: options.max_tokens || 2000,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}
