/*
 * Тесты рубричной оценки Writing/Speaking (lib/exams/rubrics.mjs).
 *
 * Ключевая гарантия, которую защищают эти тесты: модель оценивает ТОЛЬКО
 * критерии, а итоговый балл считает код по официальному правилу. Поэтому
 * подделанный «overall» от модели игнорируется, лишние критерии отбрасываются,
 * а пропавшие добиваются нулём с предупреждением.
 */
import assert from "node:assert/strict";
import test from "node:test";

import {
  IELTS_SPEAKING,
  IELTS_WRITING,
  TOEFL_SPEAKING,
  TOEFL_WRITING,
  buildRubricSystemPrompt,
  buildRubricUserPrompt,
  calibrateRubric,
  extractJsonObject,
  getRubric,
  rubricForSkill,
  snapToRubricScale,
} from "../lib/exams/rubrics.mjs";

// ---------------------------------------------------------------------------
// Реестр рубрик
// ---------------------------------------------------------------------------

test("getRubric: официальные шкалы IELTS и TOEFL", () => {
  assert.equal(getRubric("ielts", "writing").scaleMax, 9);
  assert.equal(getRubric("ielts", "writing").criteria.length, 4);
  assert.equal(getRubric("ielts", "speaking").criteria.length, 4);
  assert.equal(getRubric("toefl", "writing").scaleMax, 5);
  assert.equal(getRubric("toefl", "writing").criteria.length, 4);
  assert.equal(getRubric("toefl", "speaking").scaleMax, 4);
  assert.equal(getRubric("toefl", "speaking").criteria.length, 3);
});

test("getRubric: неизвестный экзамен падает на IELTS — так ведут себя старые клиенты", () => {
  assert.equal(getRubric("gre", "writing"), IELTS_WRITING);
  assert.equal(getRubric(undefined, "speaking"), IELTS_SPEAKING);
  assert.equal(getRubric("toefl", "listening"), IELTS_WRITING);
});

test("rubricForSkill: обе рубрики для экрана", () => {
  const writing = rubricForSkill("writing");
  assert.equal(writing.ielts, IELTS_WRITING);
  assert.equal(writing.toefl, TOEFL_WRITING);
});

test("у каждого критерия есть id, short и focus — они уходят в промпт", () => {
  for (const rubric of [IELTS_WRITING, IELTS_SPEAKING, TOEFL_WRITING, TOEFL_SPEAKING]) {
    const ids = new Set();
    for (const criterion of rubric.criteria) {
      assert.ok(criterion.id, "id обязателен");
      assert.ok(criterion.short, "short обязателен");
      assert.ok(criterion.focus && criterion.focus.length > 20, "focus должен быть описательным");
      assert.ok(!ids.has(criterion.id), `дубликат критерия ${criterion.id}`);
      ids.add(criterion.id);
    }
  }
});

// ---------------------------------------------------------------------------
// Промпты
// ---------------------------------------------------------------------------

test("системный промпт запрещает модели называть итоговый балл", () => {
  const prompt = buildRubricSystemPrompt("ielts", "writing");
  assert.match(prompt, /Do NOT compute or state an overall score/i);
  assert.match(prompt, /0–9/);
  // Перечислены все четыре критерия IELTS Writing.
  for (const criterion of IELTS_WRITING.criteria) {
    assert.ok(prompt.includes(criterion.id), `промпт должен содержать ${criterion.id}`);
  }
});

test("системный промпт TOEFL Speaking просит ровно три критерия и шкалу 0–4", () => {
  const prompt = buildRubricSystemPrompt("toefl", "speaking");
  assert.match(prompt, /0–4/);
  assert.match(prompt, /exactly 3 objects/);
  assert.ok(prompt.includes("Delivery") || prompt.includes("delivery"));
});

test("пользовательский промпт содержит задание и текст кандидата", () => {
  const prompt = buildRubricUserPrompt({
    text: "Some people believe that...",
    prompt: "Discuss both views.",
    taskType: "Task 2",
    exam: "ielts",
    skill: "writing",
  });
  assert.match(prompt, /Discuss both views\./);
  assert.match(prompt, /Task type: Task 2/);
  assert.match(prompt, /Criteria scale: 0–9/);
  assert.match(prompt, /Some people believe that/);

  const speaking = buildRubricUserPrompt({
    text: "I usually study in the evening.",
    exam: "toefl",
    skill: "speaking",
  });
  assert.match(speaking, /Transcript of the spoken answer/);
  assert.match(speaking, /Criteria scale: 0–4/);
  assert.match(speaking, /Task: Not specified/);
});

// ---------------------------------------------------------------------------
// Разбор ответа модели
// ---------------------------------------------------------------------------

test("extractJsonObject: снимает ```json-обёртку и текст вокруг", () => {
  const raw = 'Here is the result:\n```json\n{"criteria":[]}\n```\nHope it helps.';
  assert.deepEqual(extractJsonObject(raw), { criteria: [] });
  assert.deepEqual(extractJsonObject('{"a":1}'), { a: 1 });
});

test("extractJsonObject: мусор возвращает null, а не бросает", () => {
  assert.equal(extractJsonObject(""), null);
  assert.equal(extractJsonObject(null), null);
  assert.equal(extractJsonObject("no json here"), null);
  assert.equal(extractJsonObject("{ broken: "), null);
});

test("snapToRubricScale: сетка рубрики и ограничение диапазона", () => {
  assert.equal(snapToRubricScale(6.3, 9, 0.5), 6.5);
  assert.equal(snapToRubricScale(6.2, 9, 0.5), 6);
  assert.equal(snapToRubricScale(9.7, 9, 0.5), 9);
  assert.equal(snapToRubricScale(-1, 9, 0.5), 0);
  assert.equal(snapToRubricScale(3.2, 4, 0.5), 3);
  assert.equal(snapToRubricScale(1, 5, 1), 1);
  assert.equal(snapToRubricScale("abc", 9, 0.5), null);
  assert.equal(snapToRubricScale(null, 9, 0.5), null);
});

// ---------------------------------------------------------------------------
// Калибровка
// ---------------------------------------------------------------------------

const ieltsWritingResponse = {
  criteria: [
    { id: "task_response", score: 7, evidence: "clear position", comment: "fully addressed" },
    { id: "coherence_cohesion", score: 7, comment: "well organised" },
    { id: "lexical_resource", score: 6, comment: "some repetition" },
    { id: "grammatical_range_accuracy", score: 6, comment: "errors do not impede" },
  ],
  strengths: ["clear structure"],
  weaknesses: ["limited vocabulary range"],
  recommendations: ["learn collocations"],
  correctedExcerpt: "A rewritten sentence.",
  overall: 9, // модель не должна влиять на итог
};

test("calibrateRubric: IELTS считает итог как среднее критериев, а не по слову модели", () => {
  const result = calibrateRubric(ieltsWritingResponse, { exam: "ielts", skill: "writing" });
  assert.equal(result.criteria.length, 4);
  assert.deepEqual(
    result.criteria.map((c) => c.score),
    [7, 7, 6, 6]
  );
  assert.equal(result.mean, 6.5);
  assert.equal(result.overall, 6.5); // overall: 9 от модели проигнорирован
  assert.equal(result.scale, "band");
  assert.equal(result.scaleMax, 9);
  assert.equal(result.exam, "ielts");
  assert.equal(result.skill, "writing");
  assert.deepEqual(result.strengths, ["clear structure"]);
  assert.equal(result.correctedExcerpt, "A rewritten sentence.");
  assert.deepEqual(result.warnings, []);
});

test("calibrateRubric: порядок критериев задаёт рубрика, а не модель", () => {
  const shuffled = {
    criteria: [...ieltsWritingResponse.criteria].reverse(),
  };
  const result = calibrateRubric(shuffled, { exam: "ielts", skill: "writing" });
  assert.deepEqual(
    result.criteria.map((c) => c.id),
    IELTS_WRITING.criteria.map((c) => c.id)
  );
  assert.deepEqual(
    result.criteria.map((c) => c.score),
    [7, 7, 6, 6]
  );
});

test("calibrateRubric: лишние критерии отбрасываются, пропавшие обнуляются с предупреждением", () => {
  const result = calibrateRubric(
    {
      criteria: [
        { id: "task_response", score: 6 },
        { id: "pronunciation", score: 8 }, // чужой критерий для writing
      ],
    },
    { exam: "ielts", skill: "writing" }
  );
  assert.equal(result.criteria.length, 4);
  assert.equal(result.criteria[0].score, 6);
  assert.deepEqual(
    result.criteria.slice(1).map((c) => c.score),
    [0, 0, 0]
  );
  assert.equal(result.warnings.length, 3);
  assert.equal(result.mean, 1.5);
  assert.equal(result.overall, 1.5);
});

test("calibrateRubric: пустой ответ модели даёт нули, а не падение", () => {
  const result = calibrateRubric(null, { exam: "toefl", skill: "speaking" });
  assert.equal(result.criteria.length, 3);
  assert.equal(result.overall, 0);
  assert.equal(result.scaleMax, 4);
  assert.equal(result.warnings.length, 3);
  assert.deepEqual(result.strengths, []);
  assert.equal(result.correctedExcerpt, "");
});

test("calibrateRubric: TOEFL округляет средний балл до 0.5 и не выходит за максимум", () => {
  const writing = calibrateRubric(
    {
      criteria: [
        { id: "task_response", score: 4 },
        { id: "organization", score: 4 },
        { id: "language_use", score: 3 },
        { id: "conventions", score: 3 },
      ],
    },
    { exam: "toefl", skill: "writing" }
  );
  assert.equal(writing.mean, 3.5);
  assert.equal(writing.overall, 3.5);
  assert.equal(writing.scale, "task");
  assert.equal(writing.scaleMax, 5);

  const clamped = calibrateRubric(
    {
      criteria: [
        { id: "delivery", score: 7 }, // выше максимума рубрики
        { id: "language_use", score: 9 },
        { id: "topic_development", score: 100 },
      ],
    },
    { exam: "toefl", skill: "speaking" }
  );
  assert.deepEqual(
    clamped.criteria.map((c) => c.score),
    [4, 4, 4]
  );
  assert.equal(clamped.overall, 4);
});

test("calibrateRubric: принимает band/value/feedback как алиасы полей", () => {
  const result = calibrateRubric(
    {
      criteria: [
        { name: "Task Response", band: 7 },
        { name: "Coherence & Cohesion", value: 6.5 },
        { name: "Lexical Resource", score: 6, feedback: "narrow range" },
        { name: "Grammatical Range and Accuracy", score: 5.5 },
      ],
    },
    { exam: "ielts", skill: "writing" }
  );
  assert.deepEqual(
    result.criteria.map((c) => c.score),
    [7, 6.5, 6, 5.5]
  );
  assert.equal(result.criteria[2].comment, "narrow range");
  assert.equal(result.overall, 6.5); // mean 6.25 -> 6.5
});
