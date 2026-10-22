// Совместимость: клиент по-прежнему вызывает /api/voice, но роут больше не
// открытый прокси. Сначала Firebase ID-token и лимиты (guardAiRequest),
// затем общий обработчик handleVoice из lib/aiHandlers.js.
import { handleVoice } from "@/lib/aiHandlers";
import { guardAiRequest } from "@/lib/apiGuard.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const guard = await guardAiRequest(req);
  if (!guard.ok) return guard.response;
  return handleVoice(req);
}
