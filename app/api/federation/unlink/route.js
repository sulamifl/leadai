/*
 * GET /api/federation/unlink?token=…
 *
 * Уведомление из EduOS о том, что глобальная связь порвана (P1-8B). Хаб
 * подписывает токен с `act=unlink`, а мы честно отвечаем, что забыли ключ.
 *
 * Почему это отдельный эндпоинт, а не «logout»: выходить здесь не из чего —
 * Firebase-сессии у нас нет (см. `/api/federation/sso`), поэтому единственное
 * осмысленное действие — подтвердить, что subject больше не считается нашим.
 * `session: "none"` говорит об этом прямо, чтобы вызывающая сторона не
 * принимала пустоту за сбой.
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
      { unlinked: false, reason: result.reason },
      { status: 401, headers: NO_STORE }
    );
  }

  // Тот же секрет подписывает и вход, и уведомление, поэтому тип действия
  // проверяем явно: handoff-токен не имеет права «отвязывать» человека.
  if (result.payload.act !== "unlink") {
    return NextResponse.json(
      { unlinked: false, reason: "not_an_unlink_notice" },
      { status: 400, headers: NO_STORE }
    );
  }

  return NextResponse.json(
    {
      unlinked: true,
      owner: settings.owner,
      // `subject` после unlink больше не наш — но версию возвращаем: по ней
      // хаб и приёмник понимают, начиная с какого `sv` старые handoff
      // недействительны.
      subject: null,
      subjectVersion: result.subjectVersion,
      email: result.email,
      emailKey: result.emailKey,
      session: "none",
    },
    { headers: NO_STORE }
  );
}
