import Link from "next/link";
import { contentSummary, validateContent } from "@/lib/exams/content.mjs";

export const metadata = {
  title: "Экзамены — IELTS, TOEFL, SAT · LeadAI",
  description:
    "Полные тренировочные экзамены LeadAI: IELTS Academic, TOEFL iBT и Digital SAT с детерминированной проверкой и рубричной оценкой письма и речи.",
};

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, var(--app-bg) 0%, var(--app-bg-alt) 100%)",
  padding: "2.5rem 1rem 4rem",
  display: "flex",
  justifyContent: "center",
};

const contentStyle = { width: "100%", maxWidth: "960px" };

const titleStyle = {
  fontSize: "2rem",
  fontWeight: 800,
  color: "#800120",
  margin: "0 0 0.5rem",
};

const leadStyle = {
  color: "var(--app-secondary-text)",
  fontSize: "1rem",
  lineHeight: 1.65,
  margin: "0 0 2rem",
  maxWidth: "70ch",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "1.25rem",
};

const cardStyle = {
  background: "var(--app-card, #fff)",
  border: "1px solid var(--app-border, #e5e7eb)",
  borderRadius: "18px",
  padding: "1.4rem",
  boxShadow: "0 2px 12px rgba(15, 23, 42, 0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
};

const sectionRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.55rem 0.7rem",
  borderRadius: "10px",
  background: "rgba(20, 70, 90, 0.06)",
  textDecoration: "none",
  color: "var(--app-text, #1f2937)",
  fontSize: "0.9rem",
};

const mutedStyle = { color: "var(--app-secondary-text)", fontSize: "0.82rem" };

export default function ExamsPage() {
  const exams = contentSummary();
  const validation = validateContent();
  const { summary } = validation;

  return (
    <main style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={titleStyle}>Экзамены LeadAI</h1>
        <p style={leadStyle}>
          Три полноценных формата в одном приложении. Reading и Listening проверяются
          детерминированно по ключам — балл не зависит от настроения модели. Writing и
          Speaking оцениваются по официальным критериям: модель выставляет баллы только
          за каждый критерий, итог считает приложение.
        </p>

        <div style={{ ...mutedStyle, marginBottom: "1.5rem" }}>
          {summary.exams} экзамена · {summary.sections} секций · {summary.sets} наборов ·{" "}
          {summary.autoQuestions} вопросов с ключами · {summary.rubricTasks} заданий с
          рубрикой. Контент валиден: {validation.ok ? "да" : `нет (${validation.errors} ошибок)`}.
        </div>

        <div style={gridStyle}>
          {exams.map((exam) => (
            <section key={exam.id} style={cardStyle}>
              <div style={{ fontSize: "1.7rem" }}>{exam.emoji}</div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", color: exam.accent }}>
                {exam.title}
              </h2>
              <div style={mutedStyle}>
                {exam.scaleLabel} · {exam.sections.length} секции · {exam.questionCount}{" "}
                заданий · ~{exam.minutes} мин
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6 }}>
                {exam.description}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {exam.sections.map((section) => (
                  <Link
                    key={section.id}
                    href={`/exams/${exam.id}/${section.id}`}
                    style={sectionRowStyle}
                  >
                    <span style={{ fontWeight: 600 }}>{section.title}</span>
                    <span style={mutedStyle}>
                      {section.kind === "rubric" ? "рубрика" : `${section.questionCount} вопр.`}
                    </span>
                  </Link>
                ))}
              </div>

              <Link
                href={`/exams/${exam.id}`}
                style={{
                  marginTop: "0.4rem",
                  color: exam.accent,
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  textDecoration: "none",
                }}
              >
                Обзор экзамена →
              </Link>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
