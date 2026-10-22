/**
 * Сводка и валидация контент-паков экзаменов.
 *
 * Используется тестами (`tests/exam-content.test.mjs`) и страницей хаба,
 * чтобы битые вопросы не попадали в UI: у каждого вопроса автопроверки
 * обязателен эталон, индекс ответа должен существовать, а в текстах
 * не должно быть посторонних символов.
 */

import { EXAM_REGISTRY, listExams, countSetQuestions } from "./registry.mjs";
import { isAutoCheckable } from "./grade.mjs";

const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
const CHOICE_TYPES = new Set([
  "multiple_choice",
  "true_false",
  "true_false_not_given",
  "matching_headings",
]);

function pushIssue(issues, level, scope, message) {
  issues.push({ level, scope, message });
}

/** Проверяет текстовые поля на посторонние (не латинские/не кириллические) символы. */
export function findForeignScripts(text) {
  if (typeof text !== "string") return [];
  const match = text.match(CJK);
  if (!match) return [];
  const idx = text.indexOf(match[0]);
  return [{ index: idx, snippet: text.slice(Math.max(0, idx - 30), idx + 30) }];
}

function validateQuestion(question, scope, issues) {
  if (!question || typeof question !== "object") {
    pushIssue(issues, "error", scope, "вопрос не является объектом");
    return;
  }
  if (!question.id) pushIssue(issues, "error", scope, "у вопроса нет id");
  if (!question.prompt) pushIssue(issues, "error", scope, "у вопроса нет prompt");
  if (!question.type) pushIssue(issues, "error", scope, "у вопроса нет type");

  const options = Array.isArray(question.options) ? question.options : null;

  if (CHOICE_TYPES.has(question.type)) {
    if (!options || options.length < 2) {
      pushIssue(issues, "error", scope, `типу ${question.type} нужно ≥2 варианта`);
    } else if (
      typeof question.answer !== "number" ||
      question.answer < 0 ||
      question.answer >= options.length
    ) {
      pushIssue(issues, "error", scope, "индекс answer вне диапазона options");
    }
  }

  if (question.type === "multiple_answer") {
    if (!options) {
      pushIssue(issues, "error", scope, "multiple_answer без options");
    } else if (!Array.isArray(question.answer) || question.answer.length < 2) {
      pushIssue(issues, "error", scope, "multiple_answer требует ≥2 индексов в answer");
    } else if (question.answer.some((i) => typeof i !== "number" || i < 0 || i >= options.length)) {
      pushIssue(issues, "error", scope, "индекс в answer вне диапазона options");
    }
  }

  if (question.type === "short_answer" || question.type === "numeric") {
    if (question.answer === undefined || question.answer === null || question.answer === "") {
      pushIssue(issues, "error", scope, "свободный ответ без эталона");
    }
  }

  if (question.explanation) {
    const foreign = findForeignScripts(question.explanation);
    if (foreign.length) pushIssue(issues, "error", scope, "посторонние символы в explanation");
  }

  if (!isAutoCheckable(question)) {
    pushIssue(issues, "error", scope, "вопрос без эталона не может быть в auto-секции");
  }
}

function validateSet(set, section, scope, issues) {
  if (!set.id) pushIssue(issues, "error", scope, "у набора нет id");
  if (!set.title) pushIssue(issues, "warn", scope, "у набора нет title");

  const textsToCheck = [set.title, set.audioText, set.prompt, set.guidance?.join(" ")];
  if (set.passage) {
    textsToCheck.push(set.passage.title, ...(set.passage.paragraphs || []), set.passage.text);
  }
  if (set.reading) textsToCheck.push(set.reading.title, set.reading.text, ...(set.reading.paragraphs || []));
  if (set.listening) textsToCheck.push(set.listening);

  for (const text of textsToCheck) {
    const foreign = findForeignScripts(text);
    if (foreign.length) {
      pushIssue(issues, "error", scope, `посторонние символы: «${foreign[0].snippet.trim()}»`);
    }
  }

  if (section.kind === "auto") {
    if (!Array.isArray(set.questions) || set.questions.length === 0) {
      pushIssue(issues, "error", scope, "в auto-наборе нет вопросов");
      return;
    }
    const ids = new Set();
    for (const question of set.questions) {
      const qScope = `${scope}/${question?.id ?? "?"}`;
      if (ids.has(question?.id)) pushIssue(issues, "error", qScope, "дубликат id вопроса");
      ids.add(question?.id);
      validateQuestion(question, qScope, issues);
    }
    if (!set.audioText && !set.passage) {
      pushIssue(issues, "warn", scope, "у auto-набора нет ни текста, ни транскрипта");
    }
  } else {
    if (!set.prompt) pushIssue(issues, "error", scope, "rubric-набор без prompt");
    if (!set.guidance || !set.guidance.length) {
      pushIssue(issues, "warn", scope, "rubric-набор без guidance");
    }
  }
}

/**
 * Валидация всего реестра.
 * @returns {{ok: boolean, errors: number, warnings: number, issues: Array, summary: object}}
 */
export function validateContent() {
  const issues = [];
  const seenSetIds = new Set();
  const summary = { exams: 0, sections: 0, sets: 0, questions: 0, autoQuestions: 0, rubricTasks: 0 };

  for (const exam of listExams()) {
    summary.exams += 1;
    for (const section of exam.sections) {
      summary.sections += 1;
      for (const set of section.sets) {
        summary.sets += 1;
        const scope = `${exam.id}/${section.id}/${set.id}`;
        if (seenSetIds.has(set.id)) {
          pushIssue(issues, "error", scope, "дубликат id набора (id должны быть глобально уникальны)");
        }
        seenSetIds.add(set.id);

        validateSet(set, section, scope, issues);

        const count = countSetQuestions(set);
        summary.questions += count;
        if (section.kind === "auto") summary.autoQuestions += count;
        else summary.rubricTasks += count;
      }
    }
  }

  const errors = issues.filter((i) => i.level === "error").length;
  const warnings = issues.filter((i) => i.level === "warn").length;
  return { ok: errors === 0, errors, warnings, issues, summary };
}

/** Компактная сводка для UI: [{ id, title, emoji, sections: [...] }]. */
export function contentSummary() {
  return listExams().map((exam) => ({
    id: exam.id,
    title: exam.title,
    short: exam.short,
    emoji: exam.emoji,
    accent: exam.accent,
    description: exam.description,
    scaleLabel: exam.scaleLabel,
    questionCount: exam.questionCount,
    minutes: exam.minutes,
    sections: exam.sections.map((section) => ({
      id: section.id,
      title: section.title,
      kind: section.kind,
      minutes: section.minutes,
      note: section.note,
      setCount: section.setCount,
      questionCount: section.questionCount,
    })),
  }));
}

export { EXAM_REGISTRY };
export default validateContent;
