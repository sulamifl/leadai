// Совместимость: клиент по-прежнему вызывает /api/getRecommendations, но роут
// больше не открытый прокси. Сначала Firebase ID-token и лимиты
// (guardAiRequest), затем общий обработчик handleRecommendations.
import { handleRecommendations } from "@/lib/aiHandlers";
import { guardAiRequest } from "@/lib/apiGuard.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const guard = await guardAiRequest(req);
  if (!guard.ok) return guard.response;
  return handleRecommendations(req);
}
