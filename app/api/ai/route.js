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
 * Старые роуты (/api/openai, /api/voice, /api/codeAI, /api/getRecommendations)
 * реэкспортируют соответствующие обработчики из lib/aiHandlers.js, поэтому
 * клиентский код продолжает работать без изменений.
 */

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
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
