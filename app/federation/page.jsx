/*
 * /federation — вход в LeadAI по токену перехода из EduOS (P1-6).
 *
 * Страница серверная: токен проверяется до рендера, поэтому в HTML попадает уже
 * подтверждённая личность (или причина отказа), а не «ссылка, которую сейчас
 * кто-то проверит в браузере». Секрет в клиентский бандл не попадает.
 *
 * Здесь **нет** создания сессии Firebase: у LeadAI нет Admin SDK. Пользователь
 * видит, что EduOS подтвердил его личность, и продолжает обычным входом в
 * Firebase под тем же email — это честный минимум, а не имитация SSO.
 */
import Link from "next/link";

import { federationSettings, readLeadaiToken } from "../../lib/federation.mjs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "LeadAI · вход из EduOS",
};

const REASONS = {
  not_configured: "Федерация выключена: на сервере не задан EDUOS_SSO_SECRET.",
  malformed: "Ссылка повреждена — токен не читается.",
  bad_signature: "Подпись не сходится: ссылка выпущена не этим EduOS.",
  expired: "Ссылка устарела. Вернитесь в EduOS и выпустите новый токен перехода.",
  missing_email: "В токене нет email — связать аккаунт не с чем.",
  wrong_audience: "Токен выпущен для другого продукта федерации.",
  missing_secret: "Федерация выключена: на сервере не задан EDUOS_SSO_SECRET.",
  rejected: "Токен отклонён.",
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    background: "linear-gradient(160deg, #0f172a 0%, #1e293b 55%, #0b1120 100%)",
    color: "#e2e8f0",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "rgba(15, 23, 42, 0.86)",
    border: "1px solid rgba(148, 163, 184, 0.28)",
    borderRadius: 18,
    padding: "28px 26px",
    boxShadow: "0 24px 60px rgba(2, 6, 23, 0.55)",
  },
  brand: {
    fontSize: 13,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#93c5fd",
    marginBottom: 10,
  },
  title: { fontSize: 24, fontWeight: 650, margin: "0 0 10px" },
  text: { fontSize: 14, lineHeight: 1.6, color: "#cbd5e1", margin: "0 0 14px" },
  identity: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderTop: "1px solid rgba(148, 163, 184, 0.18)",
    fontSize: 14,
  },
  key: { color: "#94a3b8" },
  ok: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: "rgba(34, 197, 94, 0.16)",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    color: "#86efac",
    marginBottom: 16,
  },
  bad: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: "rgba(248, 113, 113, 0.14)",
    border: "1px solid rgba(248, 113, 113, 0.38)",
    color: "#fca5a5",
    marginBottom: 16,
  },
  actions: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 },
  primary: {
    display: "inline-block",
    padding: "11px 18px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    background: "#3b82f6",
    color: "#f8fafc",
  },
  ghost: {
    display: "inline-block",
    padding: "11px 18px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    background: "rgba(148, 163, 184, 0.14)",
    color: "#e2e8f0",
  },
};

function formatMoment(seconds) {
  if (!seconds) return "—";
  return `${new Date(seconds * 1000).toISOString().replace("T", " ").slice(0, 16)} UTC`;
}

export default function FederationPage({ searchParams }) {
  const settings = federationSettings();
  const token =
    searchParams && typeof searchParams.token === "string" ? searchParams.token : "";
  const result = readLeadaiToken(token, { settings });
  const backToEduOS = settings.eduosUrl || null;

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>LeadAI · федерация EduOS</div>

        {result.linked ? (
          <>
            <span style={styles.ok}>✓ Личность подтверждена EduOS</span>
            <h1 style={styles.title}>Вход из EduOS</h1>
            <p style={styles.text}>
              EduOS подтвердил, кто вы. Продолжите вход в LeadAI под этим же email —
              сессия Firebase создаётся только самим пользователем, потому что
              серверного Admin SDK в проекте нет.
            </p>
            <div>
              <div style={styles.identity}>
                <span style={styles.key}>Email</span>
                <span>{result.email}</span>
              </div>
              <div style={styles.identity}>
                <span style={styles.key}>Ключ склейки</span>
                <span>{result.emailKey}</span>
              </div>
              <div style={styles.identity}>
                <span style={styles.key}>Токен действует до</span>
                <span>{formatMoment(result.expiresAt)}</span>
              </div>
            </div>
            <div style={styles.actions}>
              <Link style={styles.primary} href="/login">
                Войти в LeadAI
              </Link>
              {backToEduOS ? (
                <a style={styles.ghost} href={backToEduOS}>
                  Вернуться в EduOS
                </a>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <span style={styles.bad}>✕ Переход не подтверждён</span>
            <h1 style={styles.title}>Нужна новая ссылка</h1>
            <p style={styles.text}>
              {REASONS[result.reason] || REASONS.rejected}
            </p>
            <p style={styles.text}>
              {result.reason === "not_configured"
                ? "Администратору: задайте EDUOS_SSO_SECRET (тот же, что LEADAI_SSO_SECRET в EduOS) и EDUOS_FEDERATION_URL."
                : "Ссылку выпускает EduOS: экран «Федерация» → «Переходы». Каждый токен живёт 30 минут и одноразово не отзывается."}
            </p>
            <div style={styles.actions}>
              <Link style={styles.primary} href="/login">
                Обычный вход
              </Link>
              {backToEduOS ? (
                <a style={styles.ghost} href={backToEduOS}>
                  Вернуться в EduOS
                </a>
              ) : null}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
