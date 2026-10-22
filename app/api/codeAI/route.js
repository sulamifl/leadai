// Совместимость: клиент по-прежнему вызывает /api/codeAI, но роут больше не
// открытый прокси. Сначала Firebase ID-token и лимиты (guardAiRequest),
// затем общий обработчик handleCode из lib/aiHandlers.js.
import { handleCode } from "@/lib/aiHandlers";
import { guardAiRequest } from "@/lib/apiGuard.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const guard = await guardAiRequest(req);
  if (!guard.ok) return guard.response;
  return handleCode(req);
}
