/*
 * GET /api/federation/health — готовность LeadAI как приёмника федерации (P2-9).
 *
 * Зачем этот эндпоинт существует
 * ------------------------------
 * Хаб EduOS умеет спрашивать каждого соседа «ты готов принять handoff?».
 * Ответ должен различать три разных мира, которые иначе сливаются в один:
 *
 *   `configured: true`  — федерация настроена, handoff-токен будет принят;
 *   `configured: false` — сервис жив, но его половина шва выключена
 *                         (нет `EDUOS_SSO_SECRET`) — лечится в этом репозитории;
 *   сеть/404/500        — сервис не отвечает вовсе — лечится в деплое.
 *
 * Поэтому, в отличие от `/api/federation/sso`, здесь **нет 404 при отсутствии
 * секрета**: молчащий или «несуществующий» health выглядел бы как недоступный
 * сервис, хотя сервис работает и просто не подключён. Ровно так же ведёт себя
 * `/api/bridge/health` в exam-ace: 200 и `enabled: false`.
 *
 * Секретов и PII здесь нет: только признаки конфигурации и имена маршрутов.
 */
import { NextResponse } from "next/server";

import { federationStatus } from "../../../../lib/federation.mjs";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const status = federationStatus();
  return NextResponse.json(
    {
      // `ok` здесь означает «эндпоинт жив», а не «федерация настроена»:
      // второе честно вынесено в `configured`.
      status: "ok",
      owner: status.owner,
      audience: status.audience,
      configured: status.configured,
      eduos_url_set: status.eduos_url_set,
      token_ttl_seconds: status.token_ttl_seconds,
      // У LeadAI нет Firebase-сессии, которую можно было бы погасить или
      // восстановить: и вход, и выход — это про идентичность, не про cookie.
      session: "none",
      endpoints: {
        sso: "/api/federation/sso",
        logout: "/api/federation/logout",
        unlink: "/api/federation/unlink",
      },
    },
    { headers: NO_STORE }
  );
}
