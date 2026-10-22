/*
 * Тесты детерминированной проверки ответов (lib/exams/grade.mjs).
 *
 * Вторая половина файла — сквозная проверка контента: для КАЖДОГО набора
 * каждой auto-секции ответы, собранные из эталонов, должны давать 100%.
 * Это ловит опечатки в ключах (например, answer: 4 при четырёх вариантах)
 * и расхождение типов, из-за которого ученик не смог бы ответить верно.
 */
import assert from "node:assert/strict";
import test from "node:test";

import {
  checkAnswer,
  freeTextMatches,
  gradeSet,
  isAutoCheckable,
  normalizeFreeText,
  parseFraction,
} from "../lib/exams/grade.mjs";
import { listExams } from "../lib/exams/registry.mjs";
import { scoreExam } from "../lib/exams/scoring.mjs";

// ---------------------------------------------------------------------------
// Нормализация свободных ответов
// ---------------------------------------------------------------------------

test("normalizeFreeText: регистр, пробелы, валюты и завершающая пунктуация", () => {
  assert.equal(normalizeFreeText("  TRUE. "), "true");
  assert.equal(normalizeFreeText("$1,200"), "1200");
  assert.equal(normalizeFreeText("£1 200"), "1200");
  assert.equal(normalizeFreeText("“Paris”"), "paris");
  assert.equal(normalizeFreeText("0,8"), "0.8");
  assert.equal(normalizeFreeText("0.80"), "0.8");
  assert.equal(normalizeFreeText("3.50"), "3.5");
  assert.equal(normalizeFreeText(null), "");
  assert.equal(normalizeFreeText(undefined), "");
});

test("parseFraction: «1/2» -> 0.5, мусор -> null", () => {
  assert.equal(parseFraction("1/2"), 0.5);
  assert.equal(parseFraction(" 3 / 4 "), 0.75);
  assert.equal(parseFraction("-1/2"), -0.5);
  assert.equal(parseFraction("1/0"), null);
  assert.equal(parseFraction("two"), null);
});

test("freeTextMatches: числа сравниваются как числа, а не строки", () => {
  assert.equal(freeTextMatches("66", "66"), true);
  assert.equal(freeTextMatches("66.0", "66"), true);
  assert.equal(freeTextMatches("$66", "66"), true);
  assert.equal(freeTextMatches("1/2", "0.5"), true);
  assert.equal(freeTextMatches("0.50", "1/2"), true);
  assert.equal(freeTextMatches("67", "66"), false);
  assert.equal(freeTextMatches("", "66"), false);
});

test("freeTextMatches: список accept расширяет допустимые записи", () => {
  assert.equal(freeTextMatches("colour", "color", ["colour"]), true);
  assert.equal(freeTextMatches("colur", "color", ["colour"]), false);
});

// ---------------------------------------------------------------------------
// Проверка одного вопроса
// ---------------------------------------------------------------------------

test("checkAnswer: выбор варианта сравнивается численно", () => {
  const question = { type: "multiple_choice", answer: 2, options: ["a", "b", "c"] };
  assert.equal(checkAnswer(question, 2), true);
  assert.equal(checkAnswer(question, "2"), true);
  assert.equal(checkAnswer(question, 1), false);
  assert.equal(checkAnswer(question, ""), false);
  assert.equal(checkAnswer(question, null), false);
});

test("checkAnswer: true/false/not given и matching headings — тоже индексы", () => {
  assert.equal(checkAnswer({ type: "true_false_not_given", answer: 0 }, 0), true);
  assert.equal(checkAnswer({ type: "true_false_not_given", answer: 2 }, 0), false);
  assert.equal(checkAnswer({ type: "matching_headings", answer: 3 }, "3"), true);
});

test("checkAnswer: multiple_answer требует точного набора, порядок не важен", () => {
  const question = { type: "multiple_answer", answer: [0, 2] };
  assert.equal(checkAnswer(question, [2, 0]), true);
  assert.equal(checkAnswer(question, [0, 2]), true);
  assert.equal(checkAnswer(question, [0]), false);
  assert.equal(checkAnswer(question, [0, 2, 3]), false);
  assert.equal(checkAnswer(question, []), false);
});

test("checkAnswer: свободный ответ и числовые типы", () => {
  assert.equal(checkAnswer({ type: "short_answer", answer: "photosynthesis" }, "Photosynthesis."), true);
  assert.equal(checkAnswer({ type: "numeric", answer: "0.5" }, "1/2"), true);
  assert.equal(checkAnswer({ type: "numeric", answer: "42" }, "43"), false);
  assert.equal(checkAnswer(null, "x"), false);
});

test("isAutoCheckable: вопрос без эталона автопроверке не подлежит", () => {
  assert.equal(isAutoCheckable({ type: "multiple_choice", answer: 0 }), true);
  assert.equal(isAutoCheckable({ type: "multiple_choice" }), false);
  assert.equal(isAutoCheckable({ type: "multiple_choice", answer: "" }), false);
  assert.equal(isAutoCheckable({ type: "multiple_answer", answer: [1, 2] }), true);
  assert.equal(isAutoCheckable({ type: "multiple_answer", answer: [] }), false);
  assert.equal(isAutoCheckable({ answer: 1 }), false); // без type
  assert.equal(isAutoCheckable(null), false);
});

// ---------------------------------------------------------------------------
// Проверка набора
// ---------------------------------------------------------------------------

test("gradeSet: считает правильные, точность и разбор по вопросам", () => {
  const set = {
    id: "demo",
    questions: [
      { id: "q1", type: "multiple_choice", prompt: "1", answer: 1, explanation: "потому что" },
      { id: "q2", type: "numeric", prompt: "2", answer: "10" },
      { id: "q3", type: "short_answer", prompt: "3", answer: "lion" },
    ],
  };
  const result = gradeSet(set, { q1: 1, q2: "10.0", q3: "Tiger" });
  assert.equal(result.setId, "demo");
  assert.equal(result.total, 3);
  assert.equal(result.correct, 2);
  assert.ok(Math.abs(result.accuracy - 2 / 3) < 1e-9);
  assert.equal(result.details.length, 3);
  assert.equal(result.details[0].correct, true);
  assert.equal(result.details[0].explanation, "потому что");
  assert.equal(result.details[1].correct, true);
  assert.equal(result.details[2].correct, false);
  assert.equal(result.details[2].given, "Tiger");
});

test("gradeSet: пустые ответы и пустой набор не ломают расчёт", () => {
  const set = { id: "s", questions: [{ id: "q1", type: "multiple_choice", answer: 0 }] };
  const empty = gradeSet(set, {});
  assert.equal(empty.correct, 0);
  assert.equal(empty.accuracy, 0);
  assert.equal(empty.details[0].given, null);

  const nothing = gradeSet({}, {});
  assert.equal(nothing.total, 0);
  assert.equal(nothing.accuracy, 0);
  assert.equal(gradeSet(null).total, 0);
});

// ---------------------------------------------------------------------------
// Сквозная проверка: контент согласован со своей же проверкой
// ---------------------------------------------------------------------------

const EXAMS = listExams();

for (const exam of EXAMS) {
  for (const section of exam.sections) {
    if (section.kind !== "auto") continue;

    test(`${exam.id}/${section.id}: эталоны всех наборов дают 100%`, () => {
      assert.ok(section.sets.length > 0, "у auto-секции должен быть хотя бы один набор");
      for (const set of section.sets) {
        const answers = {};
        for (const question of set.questions) answers[question.id] = question.answer;
        const result = gradeSet(set, answers);
        assert.equal(
          result.correct,
          result.total,
          `${exam.id}/${section.id}/${set.id}: не все эталоны приняты своей же проверкой`
        );
      }
    });

    test(`${exam.id}/${section.id}: пустые ответы дают 0, а скоринг остаётся в шкале`, () => {
      for (const set of section.sets) {
        const failed = gradeSet(set, {});
        assert.equal(failed.correct, 0);
        assert.equal(failed.total, set.questions.length);
      }
      const scored = scoreExam(exam.id, {
        [section.id]: { correct: 0, total: section.sets[0].questions.length },
      });
      const value = scored.sections[section.id];
      assert.ok(value !== undefined && value !== null, "секция должна попасть в результат");
      assert.ok(Number.isFinite(value), "балл секции должен быть числом");
    });
  }
}
