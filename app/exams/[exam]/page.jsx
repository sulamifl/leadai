import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam, listExams } from "@/lib/exams/registry.mjs";

export function generateStaticParams() {
  return listExams().map((exam) => ({ exam: exam.id }));
}

export async function generateMetadata({ params }) {
  const exam = getExam(params.exam);
  if (!exam) return { title: "Экзамен не найден · LeadAI" };
  return {
    title: `${exam.title} — структура и баллы · LeadAI`,
    description: exam.description,
  };
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, var(--app-bg) 0%, var(--app-bg-alt) 100%)",
  padding: "2.5rem 1rem 4rem",
  display: "flex",
  justifyContent: "center",
};

const contentStyle = { width: "100%", maxWidth: "880px" };

const backStyle = {
  display: "inline-block",
  padding: "0.5rem 1rem",
  border: "1px solid #14465a",
  borderRadius: "10px",
  color: "#14465a",
  fontSize: "0.85rem",
  fontWeight: 600,
  textDecoration: "none",
  marginBottom: "1.25rem",
};

const cardStyle = {
  background: "var(--app-card, #fff)",
  border: "1px solid var(--app-border, #e5e7eb)",
  borderRadius: "16px",
  padding: "1.25rem 1.35rem",
  marginBottom: "1rem",
};

export default function ExamOverviewPage({ params }) {
  const exam = getExam(params.exam);
  if (!exam) notFound();

  return (
    <main style={pageStyle}>
      <div style={contentStyle}>
        <Link href="/exams" style={backStyle}>
          ← Все экзамены
        </Link>

        <h1 style={{ fontSize: "1.9rem", fontWeight: 800, color: "#800120", margin: "0 0 0.4rem" }}>
          {exam.emoji} {exam.title}
        </h1>
        <p style={{ color: "var(--app-secondary-text)", margin: "0 0 1.75rem", lineHeight: 1.65 }}>
          {exam.description}
        </p>

        <div style={{ ...cardStyle, display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--app-secondary-text)" }}>Шкала</div>
            <div style={{ fontWeight: 700, color: exam.accent }}>{exam.scaleLabel}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--app-secondary-text)" }}>Итог</div>
            <div style={{ fontWeight: 700 }}>{exam.totalLabel}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--app-secondary-text)" }}>Заданий</div>
            <div style={{ fontWeight: 700 }}>{exam.questionCount}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--app-secondary-text)" }}>Время</div>
            <div style={{ fontWeight: 700 }}>~{exam.minutes} мин</div>
          </div>
        </div>

        {exam.sections.map((section) => (
          <section key={section.id} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem", color: "#14465a" }}>
                {section.title}
              </h2>
              <span style={{ fontSize: "0.82rem", color: "var(--app-secondary-text)" }}>
                {section.minutes} мин · {section.setCount} наборов · {section.questionCount} заданий
              </span>
            </div>
            <p style={{ margin: "0.6rem 0 0.9rem", fontSize: "0.9rem", color: "var(--app-secondary-text)" }}>
              {section.note}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {section.sets.map((set) => (
                <span
                  key={set.id}
                  style={{
                    padding: "0.4rem 0.7rem",
                    borderRadius: "999px",
                    background: "rgba(20, 70, 90, 0.08)",
                    fontSize: "0.8rem",
                  }}
                >
                  {set.title}
                </span>
              ))}
            </div>

            <Link
              href={`/exams/${exam.id}/${section.id}`}
              style={{
                display: "inline-block",
                marginTop: "1rem",
                padding: "0.55rem 1.1rem",
                borderRadius: "10px",
                background: exam.accent,
                color: "#fff",
                fontSize: "0.88rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {section.kind === "rubric" ? "Тренировать с рубрикой" : "Пройти секцию"} →
            </Link>
          </section>
        ))}
      </div>
    </main>
  );
}
