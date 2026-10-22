/*
 * Тесты контент-паков и их валидации (lib/exams/content.mjs + data/exams/*).
 *
 * Смысл: `validateContent()` не должен молча пропускать битые данные, а сам
 * контент должен соответствовать заявленному объёму. Если кто-то добавит
 * вопрос без эталона, с индексом вне options или с посторонними символами,
 * эти тесты упадут раньше, чем это увидит ученик.
 */
import assert from "node:assert/strict";
import test from "node:test";

import {
  contentSummary,
  findForeignScripts,
  validateContent,
} from "../lib/exams/content.mjs";
import { getExam, getSection, listExams, listSets } from "../lib/exams/registry.mjs";

const REPORT = validateContent();

test("валидация всех контент-паков проходит без ошибок", () => {
  assert.deepEqual(
    REPORT.issues.filter((issue) => issue.level === "error"),
    [],
    "в контенте есть ошибки"
  );
  assert.equal(REPORT.ok, true);
  assert.equal(REPORT.errors, 0);
});

test("сводка валидатора согласована с реестром", () => {
  const exams = listExams();
  assert.equal(REPORT.summary.exams, exams.length);
  assert.equal(
    REPORT.summary.sections,
    exams.reduce((sum, exam) => sum + exam.sections.length, 0)
  );
  assert.equal(
    REPORT.summary.sets,
    exams.reduce(
      (sum, exam) =>
        sum + exam.sections.reduce((inner, section) => inner + section.sets.length, 0),
      0
    )
  );
  assert.equal(
    REPORT.summary.questions,
    exams.reduce((sum, exam) => sum + exam.questionCount, 0)
  );
  assert.equal(
    REPORT.summary.questions,
    REPORT.summary.autoQuestions + REPORT.summary.rubricTasks
  );
  assert.ok(REPORT.summary.autoQuestions > 0, "должны быть вопросы с автопроверкой");
  assert.ok(REPORT.summary.rubricTasks > 0, "должны быть рубричные задания");
});

test("в реестре ровно три экзамена: IELTS, TOEFL, SAT", () => {
  assert.deepEqual(
    listExams().map((exam) => exam.id),
    ["ielts", "toefl", "sat"]
  );
  for (const exam of listExams()) {
    assert.ok(exam.sections.length > 0, `${exam.id}: нет секций`);
    assert.ok(exam.scaleLabel, `${exam.id}: нет подписи шкалы`);
    assert.ok(exam.emoji, `${exam.id}: нет emoji для UI`);
  }
});

test("у каждого экзамена достаточно контента для полноценной тренировки", () => {
  for (const exam of listExams()) {
    assert.ok(
      exam.questionCount >= 55,
      `${exam.id}: всего ${exam.questionCount} заданий, ожидалось ≥55`
    );
    for (const section of exam.sections) {
      if (section.kind === "auto") {
        assert.ok(
          section.questionCount >= 10,
          `${exam.id}/${section.id}: всего ${section.questionCount} вопросов, ожидалось ≥10`
        );
      }
      assert.ok(section.setCount >= 1, `${exam.id}/${section.id}: нет наборов`);
      // Сумма вопросов секции равна заявленному questionCount.
      assert.equal(
        section.questionCount,
        section.sets.reduce(
          (sum, set) =>
            sum + (Array.isArray(set.questions) ? set.questions.length : 1),
          0
        )
      );
    }
    // Сумма секций равна итогу экзамена.
    assert.equal(
      exam.questionCount,
      exam.sections.reduce((sum, section) => sum + section.questionCount, 0)
    );
  }
});

test("IELTS и TOEFL закрывают все четыре секции, SAT — две", () => {
  assert.deepEqual(
    getExam("ielts").sections.map((s) => s.id),
    ["listening", "reading", "writing", "speaking"]
  );
  assert.deepEqual(
    getExam("toefl").sections.map((s) => s.id),
    ["reading", "listening", "writing", "speaking"]
  );
  assert.deepEqual(
    getExam("sat").sections.map((s) => s.id),
    ["rw", "math"]
  );
  assert.equal(getSection("toefl", "writing").kind, "rubric");
  assert.equal(getSection("sat", "math").kind, "auto");
  assert.equal(getExam("gre"), null);
  assert.equal(getSection("ielts", "math"), null);
});

test("id наборов глобально уникальны (на них строятся URL и сохранение результатов)", () => {
  const seen = new Map();
  for (const exam of listExams()) {
    for (const section of exam.sections) {
      for (const set of section.sets) {
        const scope = `${exam.id}/${section.id}`;
        assert.ok(!seen.has(set.id), `набор ${set.id} встречается дважды: ${seen.get(set.id)} и ${scope}`);
        seen.set(set.id, scope);
      }
    }
  }
});

test("id вопросов уникальны внутри набора, эталоны валидны по типу", () => {
  for (const exam of listExams()) {
    for (const section of exam.sections) {
      if (section.kind !== "auto") continue;
      for (const set of section.sets) {
        const ids = new Set();
        for (const question of set.questions) {
          assert.ok(!ids.has(question.id), `${set.id}: дубликат ${question.id}`);
          ids.add(question.id);

          if (question.options) {
            assert.ok(Array.isArray(question.options), `${set.id}/${question.id}: options не массив`);
            if (question.type === "multiple_answer") {
              for (const index of question.answer) {
                assert.ok(
                  Number.isInteger(index) && index >= 0 && index < question.options.length,
                  `${set.id}/${question.id}: индекс ответа вне options`
                );
              }
            } else {
              assert.ok(
                Number.isInteger(question.answer) &&
                  question.answer >= 0 &&
                  question.answer < question.options.length,
                `${set.id}/${question.id}: answer вне options`
              );
            }
          }
        }
      }
    }
  }
});

test("listSets отдаёт краткие карточки наборов для UI", () => {
  for (const exam of listExams()) {
    for (const section of exam.sections) {
      const sets = listSets(exam.id, section.id);
      assert.equal(sets.length, section.sets.length);
      for (const set of sets) {
        assert.ok(set.id && set.title);
        assert.ok(set.questions >= 1);
        assert.equal(set.kind, section.kind);
      }
    }
  }
  assert.deepEqual(listSets("gre", "reading"), []);
});

test("contentSummary повторяет реестр и не теряет секции", () => {
  const summary = contentSummary();
  const exams = listExams();
  assert.equal(summary.length, exams.length);
  summary.forEach((exam, index) => {
    const source = exams[index];
    assert.equal(exam.id, source.id);
    assert.equal(exam.questionCount, source.questionCount);
    assert.equal(exam.sections.length, source.sections.length);
    for (const section of exam.sections) {
      assert.ok(["auto", "rubric"].includes(section.kind));
      assert.ok(section.title);
    }
  });
});

test("findForeignScripts ловит иероглифы и пропускает латиницу с кириллицей", () => {
  assert.deepEqual(findForeignScripts("Plain English text."), []);
  assert.deepEqual(findForeignScripts("Текст на русском."), []);
  assert.equal(findForeignScripts("Text with 汉字 inside").length, 1);
  assert.deepEqual(findForeignScripts(null), []);
  assert.deepEqual(findForeignScripts(42), []);
});

test("в текстах пассажей и объяснений нет посторонних символов", () => {
  for (const issue of REPORT.issues) {
    assert.equal(issue.level === "error" && issue.message.includes("посторонние"), false, issue.scope);
  }
});
