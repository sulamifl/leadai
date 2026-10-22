/*
 * Тесты ядра подсчёта баллов (lib/exams/scoring.mjs).
 *
 * Проверяем не «самосогласованность кода», а официальные правила:
 *  - IELTS: округление до полубалла (.25 → .5, .75 → целое), таблица raw → band,
 *    пропорциональная нормализация коротких наборов к 40 вопросам;
 *  - TOEFL: 4 секции по 0–30, сумма 0–120, перевод рубрики (0–5 / 0–4) в 0–30;
 *  - SAT: секции 200–800 (минимум 200, а не 0), сумма 400–1600.
 *
 * Запуск: `npm test` (node --test "tests/*.test.mjs").
 */
import assert from "node:assert/strict";
import test from "node:test";

import {
  formatTotal,
  ieltsBandFromRaw,
  ieltsOverallBand,
  roundIeltsBand,
  satSectionScore,
  satTotal,
  scoreExam,
  toeflRubricToSectionScore,
  toeflSectionScore,
  toeflTotal,
} from "../lib/exams/scoring.mjs";

// ---------------------------------------------------------------------------
// IELTS
// ---------------------------------------------------------------------------

test("roundIeltsBand: официальное округление до полубалла", () => {
  assert.equal(roundIeltsBand(6.25), 6.5);
  assert.equal(roundIeltsBand(6.24), 6.0);
  assert.equal(roundIeltsBand(6.26), 6.5);
  assert.equal(roundIeltsBand(6.75), 7.0);
  assert.equal(roundIeltsBand(6.74), 6.5);
  assert.equal(roundIeltsBand(6.1), 6.0);
  assert.equal(roundIeltsBand(7), 7);
});

test("roundIeltsBand: границы шкалы и мусорный вход", () => {
  assert.equal(roundIeltsBand(9), 9);
  assert.equal(roundIeltsBand(9.9), 9);
  assert.equal(roundIeltsBand(8.9), 9);
  assert.equal(roundIeltsBand(0), 0);
  assert.equal(roundIeltsBand(-3), 0);
  assert.equal(roundIeltsBand("6.25"), 6.5);
  assert.equal(roundIeltsBand(null), null);
  assert.equal(roundIeltsBand(undefined), null);
  assert.equal(roundIeltsBand("abc"), null);
});

test("ieltsBandFromRaw: официальная таблица на 40 вопросах", () => {
  assert.equal(ieltsBandFromRaw(40, 40), 9.0);
  assert.equal(ieltsBandFromRaw(39, 40), 9.0);
  assert.equal(ieltsBandFromRaw(37, 40), 8.5);
  assert.equal(ieltsBandFromRaw(35, 40), 8.0);
  assert.equal(ieltsBandFromRaw(30, 40), 7.0);
  assert.equal(ieltsBandFromRaw(23, 40), 6.0);
  assert.equal(ieltsBandFromRaw(1, 40), 1.0);
  assert.equal(ieltsBandFromRaw(0, 40), 0);
});

test("ieltsBandFromRaw: короткий набор нормализуется к 40 вопросам", () => {
  // 10 из 10 — это 100%, а не «сырые 10 из 40» (что дало бы band 4.0).
  assert.equal(ieltsBandFromRaw(10, 10), 9.0);
  // 5 из 10 — половина, то есть 20/40 -> band 5.5.
  assert.equal(ieltsBandFromRaw(5, 10), 5.5);
  // Защита от деления на ноль: total=0 трактуется как 40.
  assert.equal(ieltsBandFromRaw(0, 0), 0);
  // Отрицательные и нечисловые ответы не ломают функцию.
  assert.equal(ieltsBandFromRaw(-5, 40), 0);
  assert.equal(ieltsBandFromRaw("x", 40), 0);
});

test("ieltsOverallBand: среднее четырёх секций с округлением", () => {
  assert.equal(ieltsOverallBand([7, 7, 6, 6]), 6.5);
  assert.equal(ieltsOverallBand([6.5, 6.5, 6, 6]), 6.5); // avg 6.25 -> 6.5
  assert.equal(ieltsOverallBand([5, 5, 5, 5]), 5);
  assert.equal(ieltsOverallBand([9, 9, 8, 8]), 8.5);
  // Некорректные значения отбрасываются, пустой список -> null.
  assert.equal(ieltsOverallBand([7, null, undefined, "x"]), 7);
  assert.equal(ieltsOverallBand([10, -1]), null);
  assert.equal(ieltsOverallBand([]), null);
});

// ---------------------------------------------------------------------------
// TOEFL
// ---------------------------------------------------------------------------

test("toeflSectionScore: процент верных -> 0–30, 100% = 30", () => {
  assert.equal(toeflSectionScore(40, 40), 30);
  assert.equal(toeflSectionScore(0, 40), 0);
  assert.equal(toeflSectionScore(30, 40), 22); // 75% -> порог 73
  assert.equal(toeflSectionScore(20, 40), 14); // 50% -> порог 49
  assert.equal(toeflSectionScore(24, 40), 17); // 60% -> порог 58
  // Больше вопросов, чем есть, не даёт больше 30.
  assert.equal(toeflSectionScore(99, 40), 30);
  // total=0 -> 0 (а не NaN).
  assert.equal(toeflSectionScore(5, 0), 0);
});

test("toeflRubricToSectionScore: рубрика Writing (0–5) и Speaking (0–4)", () => {
  assert.equal(toeflRubricToSectionScore(5, 5), 30);
  assert.equal(toeflRubricToSectionScore(4, 5), 25);
  assert.equal(toeflRubricToSectionScore(3, 5), 20);
  assert.equal(toeflRubricToSectionScore(0, 5), 0);

  assert.equal(toeflRubricToSectionScore(4, 4), 30);
  assert.equal(toeflRubricToSectionScore(3, 4), 23);
  assert.equal(toeflRubricToSectionScore(2, 4), 15);
  assert.equal(toeflRubricToSectionScore(0, 4), 0);

  // Выше максимума рубрики — ограничивается 30, мусор — 0.
  assert.equal(toeflRubricToSectionScore(9, 4), 30);
  assert.equal(toeflRubricToSectionScore(null, 5), 0);
});

test("toeflTotal: сумма секций ограничена 0–120", () => {
  assert.equal(
    toeflTotal({ reading: 30, listening: 30, writing: 25, speaking: 23 }),
    108
  );
  assert.equal(toeflTotal({}), 0);
  assert.equal(
    toeflTotal({ reading: 30, listening: 30, writing: 30, speaking: 30 }),
    120
  );
  assert.equal(
    toeflTotal({ reading: 99, listening: 99, writing: 99, speaking: 99 }),
    120
  );
});

// ---------------------------------------------------------------------------
// SAT
// ---------------------------------------------------------------------------

test("satSectionScore: 200–800, минимум 200, максимум 800", () => {
  assert.equal(satSectionScore(0, 36), 200);
  assert.equal(satSectionScore(36, 36), 800);
  assert.equal(satSectionScore(18, 36), 520);
  assert.equal(satSectionScore(99, 36), 800);
  assert.equal(satSectionScore(0, 0), 200);
  // Монотонность: больше верных — не меньше балл.
  let prev = -1;
  for (let correct = 0; correct <= 36; correct += 1) {
    const score = satSectionScore(correct, 36);
    assert.ok(score >= prev, `score must be monotonic at ${correct}`);
    prev = score;
  }
});

test("satTotal: 400–1600", () => {
  assert.equal(satTotal(520, 520), 1040);
  assert.equal(satTotal(800, 800), 1600);
  assert.equal(satTotal(200, 200), 400);
  assert.equal(satTotal(0, 0), 400);
  assert.equal(satTotal(900, 900), 1600);
});

// ---------------------------------------------------------------------------
// Универсальный вход
// ---------------------------------------------------------------------------

test("scoreExam: IELTS считает секции и средний band", () => {
  const result = scoreExam("ielts", {
    listening: { correct: 30, total: 40 },
    reading: { correct: 30, total: 40 },
    writing: { correct: 23, total: 40 },
  });
  assert.deepEqual(result.sections, { listening: 7, reading: 7, writing: 6 });
  assert.equal(result.total, 6.5);
  assert.equal(result.scale, "band");
});

test("scoreExam: TOEFL подставляет рубричные секции и сумму", () => {
  const result = scoreExam(
    "toefl",
    {
      reading: { correct: 40, total: 40 },
      listening: { correct: 30, total: 40 },
    },
    { writingRubric: 5, speakingRubric: 3 }
  );
  assert.equal(result.sections.reading, 30);
  assert.equal(result.sections.listening, 22);
  assert.equal(result.sections.writing, 30);
  assert.equal(result.sections.speaking, 23);
  assert.equal(result.total, 105);
  assert.equal(result.scale, "toefl");
});

test("scoreExam: SAT считает rw + math и сумму 400–1600", () => {
  const result = scoreExam("sat", {
    rw: { correct: 36, total: 36 },
    math: { correct: 18, total: 36 },
  });
  assert.equal(result.sections.rw, 800);
  assert.equal(result.sections.math, 520);
  assert.equal(result.total, 1320);
  assert.equal(result.scale, "sat");
});

test("scoreExam: неизвестный экзамен — явная ошибка, а не тихий ноль", () => {
  assert.throws(() => scoreExam("gre", {}), /Unknown exam/);
});

test("formatTotal: человекочитаемая подпись по экзамену", () => {
  assert.equal(formatTotal("ielts", { total: 6.5 }), "Band 6.5");
  assert.equal(formatTotal("toefl", { total: 105 }), "105 / 120");
  assert.equal(formatTotal("sat", { total: 1320 }), "1320 / 1600");
  assert.equal(formatTotal("sat", null), "");
});
