import {
  handleEssay,
  handleVoice,
  handleCode,
  handleRecommendations,
  handleStudyPlan,
  handlePracticeTest,
  handleEssayFeedback,
  handleSpeechFeedback,
  handlePersonalizedStudyPlan,
  handleVocabulary,
  handleChatAssistant,
  handleErrorAnalysis,
  handleSpeakingTutor,
  handleWritingTutor,
  handleReadingListeningTutor,
  handleMainChat,
} from "@/lib/aiHandlers";
import { guardAiRequest, jsonResponse } from "@/lib/apiGuard.mjs";

// Проверка подписи Firebase ID-token использует node:crypto,
// поэтому роут обязан работать в Node.js runtime (не в Edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Единый универсальный AI-роут.
 *
 * Маршрутизирует запросы по полю `endpoint` в теле запроса:
 *   - "essay"           -> анализ эссе / генерация темы (бывший /api/openai)
 *   - "voice"           -> анализ речи / генерация темы (бывший /api/voice)
 *   - "code"            -> обучение программированию (бывший /api/codeAI)
 *   - "recommendations" -> рекомендации университетов (бывший /api/getRecommendations)
 *   - "mainChat"        -> оценка результатов, примеры и AI-ассистент раздела /main
*
* Все входы закрыты `guardAiRequest` (lib/apiGuard.mjs): Firebase ID-token
* в заголовке Authorization + лимиты. Старые роуты (/api/openai, /api/voice,
* /api/codeAI, /api/getRecommendations) используют тот же страж, поэтому
* клиентский код продолжает работать без изменений, но анонимные запросы
* к платному API больше невозможны.
*/

/** Читает режим авторизации, чтобы отдать его в `/api/ai/health`. */
export async function GET() {
  const { getAuthMode } = await import("@/lib/apiAuth.mjs");
  return jsonResponse({
    ok: true,
    endpoint: "/api/ai",
    authMode: getAuthMode(),
    endpoints: Object.keys(handlers),
  });
}

const handlers = {
  essay: handleEssay,
  essayFeedback: handleEssayFeedback,
  speechFeedback: handleSpeechFeedback,
  voice: handleVoice,
  code: handleCode,
  recommendations: handleRecommendations,
  studyPlan: handleStudyPlan,
  personalizedStudyPlan: handlePersonalizedStudyPlan,
  practiceTest: handlePracticeTest,
  vocabulary: handleVocabulary,
  chatAssistant: handleChatAssistant,
  errorAnalysis: handleErrorAnalysis,
  speakingTutor: handleSpeakingTutor,
  writingTutor: handleWritingTutor,
  readingListeningTutor: handleReadingListeningTutor,
  mainChat: handleMainChat,
};

export async function POST(req) {
  // Авторизация + лимиты до любого обращения к модели.
  // Режим задаётся AI_AUTH_MODE: required (по умолчанию) | optional | off.
  const guard = await guardAiRequest(req);
  if (!guard.ok) return guard.response;

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { endpoint } = body;
  const handler = handlers[endpoint];

  if (!handler) {
    return jsonResponse(
      {
        error: `Unknown endpoint "${endpoint}". Expected one of: ${Object.keys(
          handlers
        ).join(", ")}`,
      },
      400
    );
  }

  // Тело запроса можно прочитать только один раз: выше мы уже вызвали
  // req.json(), поэтому обработчику передаём новый Request с тем же JSON.
  // Иначе обработчики падали с "Body is unusable: Body has already been read"
  // и все AI-функции отвечали 500. Все обработчики читают тело через req.json().
  return handler(
    new Request(req.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}
