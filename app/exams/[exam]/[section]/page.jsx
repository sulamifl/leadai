import { notFound } from "next/navigation";
import { getExam, getSection, listExams } from "@/lib/exams/registry.mjs";
import ExamRunner from "@/components/exam/ExamRunner";

export function generateStaticParams() {
  const params = [];
  for (const exam of listExams()) {
    for (const section of exam.sections) {
      params.push({ exam: exam.id, section: section.id });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const exam = getExam(params.exam);
  const section = getSection(params.exam, params.section);
  if (!exam || !section) return { title: "Секция не найдена · LeadAI" };
  return {
    title: `${exam.short} ${section.title} — тренировка · LeadAI`,
    description: section.note,
  };
}

export default function ExamSectionPage({ params }) {
  const exam = getExam(params.exam);
  if (!exam) notFound();
  const section = getSection(params.exam, params.section);
  if (!section) notFound();

  // Клиенту отдаём только нужную секцию (и минимум метаданных экзамена),
  // чтобы в бандл не попадали контент-паки всех трёх экзаменов.
  return (
    <ExamRunner
      exam={{
        id: exam.id,
        title: exam.title,
        short: exam.short,
        emoji: exam.emoji,
        accent: exam.accent,
      }}
      section={section}
    />
  );
}
