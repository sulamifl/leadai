import {
  handleEssay,
  handleVoice,
  handleCode,
  handleRecommendations,
  handleStudyPlan,
  handlePracticeTest,
} from "@/lib/aiHandlers";

/**
 * Единый универсальный AI-роут.
 *
 * Маршрутизирует запросы по полю `endpoint` в теле запроса:
 *   - "essay"           -> анализ эссе / генерация темы (бывший /api/openai)
 *   - "voice"           -> анализ речи / генерация темы (бывший /api/voice)
 *   - "code"            -> обучение программированию (бывший /api/codeAI)
 *   - "recommendations" -> рекомендации университетов (бывший /api/getRecommendations)
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
  voice: handleVoice,
  code: handleCode,
  recommendations: handleRecommendations,
  studyPlan: handleStudyPlan,
  practiceTest: handlePracticeTest,
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

  return handler(req);
}
