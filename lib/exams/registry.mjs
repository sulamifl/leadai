/**
 * Реестр экзаменов: единая точка входа для IELTS / TOEFL / SAT.
 *
 * Секция бывает двух видов:
 *  - kind: "auto"   — вопросы с эталонами, проверяются детерминированно (`grade.mjs`),
 *                     итог считается через `scoring.mjs`;
 *  - kind: "rubric" — задание на продукцию (эссе/речь), оценивается по рубрике
 *                     через `/api/ai` + `rubrics.mjs`.
 *
 * Чистый ESM без зависимостей от Next/Firebase — модуль импортируется в `node --test`.
 */

import IELTS_READING from "../../data/exams/ielts-reading.mjs";
import IELTS_LISTENING from "../../data/exams/ielts-listening.mjs";
import IELTS_WRITING from "../../data/exams/ielts-writing.mjs";
import IELTS_SPEAKING from "../../data/exams/ielts-speaking.mjs";
import TOEFL_READING from "../../data/exams/toefl-reading.mjs";
import TOEFL_LISTENING from "../../data/exams/toefl-listening.mjs";
import TOEFL_WRITING from "../../data/exams/toefl-writing.mjs";
import TOEFL_SPEAKING from "../../data/exams/toefl-speaking.mjs";
import SAT_RW from "../../data/exams/sat-rw.mjs";
import SAT_MATH from "../../data/exams/sat-math.mjs";

/** Количество вопросов в наборе: у rubric-наборов это одна задача. */
export function countSetQuestions(set) {
  if (!set) return 0;
  if (Array.isArray(set.questions)) return set.questions.length;
  return 1;
}

function sumQuestions(sets = []) {
  return sets.reduce((acc, set) => acc + countSetQuestions(set), 0);
}

const IELTS_SECTIONS = [
  {
    id: "listening",
    title: "Listening",
    kind: "auto",
    minutes: 30,
    scale: "band",
    note: "4 части, 6 наборов с транскриптами и ключами",
    sets: IELTS_LISTENING,
  },
  {
    id: "reading",
    title: "Reading",
    kind: "auto",
    minutes: 60,
    scale: "band",
    note: "4 академических пассажа, 40 вопросов с ключами",
    sets: IELTS_READING,
  },
  {
    id: "writing",
    title: "Writing",
    kind: "rubric",
    minutes: 60,
    scale: "band",
    note: "4 критерия × band 0–9, итог считает приложение",
    sets: IELTS_WRITING,
  },
  {
    id: "speaking",
    title: "Speaking",
    kind: "rubric",
    minutes: 14,
    scale: "band",
    note: "Part 1–3, 4 критерия × band 0–9",
    sets: IELTS_SPEAKING,
  },
];

const TOEFL_SECTIONS = [
  {
    id: "reading",
    title: "Reading",
    kind: "auto",
    minutes: 54,
    scale: "section30",
    note: "4 академических пассажа, 40 вопросов с ключами",
    sets: TOEFL_READING,
  },
  {
    id: "listening",
    title: "Listening",
    kind: "auto",
    minutes: 41,
    scale: "section30",
    note: "5 треков (лекции и диалоги), 30 вопросов",
    sets: TOEFL_LISTENING,
  },
  {
    id: "writing",
    title: "Writing",
    kind: "rubric",
    minutes: 50,
    scale: "section30",
    note: "Integrated + Academic Discussion, 4 критерия × 0–5",
    sets: TOEFL_WRITING,
  },
  {
    id: "speaking",
    title: "Speaking",
    kind: "rubric",
    minutes: 17,
    scale: "section30",
    note: "4 типа заданий, 3 критерия × 0–4",
    sets: TOEFL_SPEAKING,
  },
];

const SAT_SECTIONS = [
  {
    id: "rw",
    title: "Reading & Writing",
    kind: "auto",
    minutes: 64,
    scale: "satSection",
    note: "6 модулей, 36 вопросов с ключами",
    sets: SAT_RW,
  },
  {
    id: "math",
    title: "Math",
    kind: "auto",
    minutes: 70,
    scale: "satSection",
    note: "4 домена, 24 задания (включая числовые ответы)",
    sets: SAT_MATH,
  },
];

export const EXAMS = [
  {
    id: "ielts",
    title: "IELTS Academic",
    short: "IELTS",
    emoji: "🎓",
    accent: "#2563eb",
    scaleLabel: "Band 0–9",
    totalLabel: "Overall band",
    description:
      "Полный академический формат: Listening, Reading, Writing, Speaking. Writing и Speaking оцениваются по четырём официальным критериям — итог считает приложение, а не языковая модель.",
    sections: IELTS_SECTIONS,
  },
  {
    id: "toefl",
    title: "TOEFL iBT",
    short: "TOEFL",
    emoji: "🌐",
    accent: "#0d9488",
    scaleLabel: "0–120",
    totalLabel: "Total score",
    description:
      "Четыре секции по 0–30: чтение и аудирование проверяются по ключам, письмо и речь — по рубрикам (Integrated Writing, Academic Discussion, четыре типа Speaking).",
    sections: TOEFL_SECTIONS,
  },
  {
    id: "sat",
    title: "Digital SAT",
    short: "SAT",
    emoji: "📐",
    accent: "#b45309",
    scaleLabel: "400–1600",
    totalLabel: "Total score",
    description:
      "Reading & Writing (36 вопросов) и Math (24 задания, включая числовые ответы). Итог по секциям 200–800, сумма 400–1600 — по официальной шкале.",
    sections: SAT_SECTIONS,
  },
];

/** Полная карта: { examId: { ...exam, stats } }. */
export const EXAM_REGISTRY = EXAMS.reduce((acc, exam) => {
  const sections = exam.sections.map((section) => ({
    ...section,
    questionCount: sumQuestions(section.sets),
    setCount: section.sets.length,
  }));
  const questionCount = sections.reduce((sum, s) => sum + s.questionCount, 0);
  const minutes = sections.reduce((sum, s) => sum + (s.minutes || 0), 0);
  acc[exam.id] = { ...exam, sections, questionCount, minutes };
  return acc;
}, {});

export function listExams() {
  return Object.values(EXAM_REGISTRY);
}

export function getExam(examId) {
  return EXAM_REGISTRY[String(examId || "").toLowerCase()] || null;
}

export function getSection(examId, sectionId) {
  const exam = getExam(examId);
  if (!exam) return null;
  return exam.sections.find((s) => s.id === sectionId) || null;
}

export function getSet(examId, sectionId, setId) {
  const section = getSection(examId, sectionId);
  if (!section) return null;
  if (!setId) return section.sets[0] || null;
  return section.sets.find((s) => s.id === setId) || null;
}

export function listSets(examId, sectionId) {
  const section = getSection(examId, sectionId);
  if (!section) return [];
  return section.sets.map((set) => ({
    id: set.id,
    title: set.title,
    minutes: set.minutes || null,
    questions: countSetQuestions(set),
    kind: section.kind,
  }));
}

export default EXAM_REGISTRY;
