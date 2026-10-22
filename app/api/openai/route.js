// Совместимость: клиент по-прежнему вызывает /api/openai, но роут больше не
// открытый прокси. Сначала Firebase ID-token и лимиты (guardAiRequest),
// затем общий обработчик handleEssay из lib/aiHandlers.js.
import { handleEssay } from "@/lib/aiHandlers";
import { guardAiRequest } from "@/lib/apiGuard.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const guard = await guardAiRequest(req);
  if (!guard.ok) return guard.response;
  return handleEssay(req);
}
