/*
 * GET /api/federation/logout?token=…
 *
 * Уведомление из EduOS о едином выходе (P1-8C). Хаб поднимает версию subject
 * и просит всех соседей погасить сессии; здесь гасить нечего — Firebase-сессии
 * у LeadAI нет (см. `/api/federation/sso`), поэтому ответ честный no-op:
 * `loggedOut: true, session: "none"`.
 *
 * Почему no-op всё равно нужен: хаб собирает карту `delivered` и отличает
 * «приёмник подтвердил» от «приёмник не отвечает». Молчащий эндпоинт выглядел
 * бы как сбой федерации, а `session: "none"` прямо говорит, что выходить было
 * не из чего — это не ошибка, а свойство продукта.
 *
 * Конвенция та же, что у остальных швов: **секрет вместо feature-флага**. Нет
 * `EDUOS_SSO_SECRET` — 404, как будто эндпоинта нет.
 */
import { NextResponse } from "next/server";

import { federationSettings, readLeadaiToken } from "../../../../lib/federation.mjs";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request) {
  const settings = federationSettings();
  if (!settings.secret) {
    return NextResponse.json(
      { error: "federation is not configured" },
      { status: 404, headers: NO_STORE }
    );
  }

  const token = new URL(request.url).searchParams.get("token") || "";
  const result = readLeadaiToken(token, { settings });
  if (!result.linked) {
    return NextResponse.json(
      { loggedOut: false, reason: result.reason },
      { status: 401, headers: NO_STORE }
    );
  }

  // Один секрет подписывает вход, отвязку и выход, поэтому тип действия
  // проверяем явно: handoff-токен не имеет права «разлогинивать» человека.
  if (result.payload.act !== "logout") {
    return NextResponse.json(
      { loggedOut: false, reason: "not_a_logout_notice" },
      { status: 400, headers: NO_STORE }
    );
  }

  return NextResponse.json(
    {
      loggedOut: true,
      owner: settings.owner,
      // Subject остаётся нашим: человек выйдет и войдёт снова, прогресс
      // привязан к нему. Версию возвращаем, чтобы хаб видел, на каком `sv`
      // закончилась сессия.
      subject: result.subject,
      subjectVersion: result.subjectVersion,
      email: result.email,
      emailKey: result.emailKey,
      session: "none",
    },
    { headers: NO_STORE }
  );
}
