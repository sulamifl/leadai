/*
 * GET /api/federation/sso?token=…
 *
 * Приёмник токена перехода из EduOS (P1-6). Поведение сознательно повторяет
 * конвенцию остальных швов федерации: **секрет вместо feature-флага**. Нет
 * `EDUOS_SSO_SECRET` — эндпоинт отвечает 404, как будто его нет; включать
 * отдельным флагом нечего, потому что без секрета проверить токен невозможно.
 *
 * Ответ — только подтверждённая личность. Никакой сессии Firebase здесь не
 * выпускается: Admin SDK в проекте нет, а подделывать cookie клиентским SDK
 * (или писать её вручную) — значит выдать неподписанную сессию за настоящую.
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
      { linked: false, reason: result.reason },
      { status: 401, headers: NO_STORE }
    );
  }

  return NextResponse.json(
    {
      linked: true,
      owner: settings.owner,
      // Глобальный идентификатор EduOS (P1-8). `null` — отправитель старый,
      // личность подтверждена только почтой; ключ присутствует всегда, чтобы
      // клиент не угадывал схему ответа.
      subject: result.subject,
      subjectVersion: result.subjectVersion,
      email: result.email,
      emailKey: result.emailKey,
      expiresAt: result.expiresAt,
    },
    { headers: NO_STORE }
  );
}
