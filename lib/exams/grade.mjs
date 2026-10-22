/**
 * Детерминированная проверка ответов для всех экзаменационных наборов.
 *
 * Чистый модуль без зависимостей: используется и в клиентском раннере,
 * и в `node --test` (см. `tests/exam-content.test.mjs`).
 */

/** Типографские кавычки и тире: приходят из мобильных клавиатур и копипаста из PDF. */
const SMART_CHARS = /[\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u00AB\u00BB\u2039\u203A\u2010-\u2015\u2212]/g;
/** Неразрывные и узкие пробелы (в т.ч. разделитель тысяч в fr/ru-раскладках). */
const NARROW_SPACES = /[\u00A0\u2007\u2009\u200A\u202F\u3000]/g;
/** Тире (в отличие от кавычек) приводим к ASCII-дефису, чтобы "-1/2" остался минусом. */
const DASHES = /[\u2010-\u2015\u2212]/;

/**
 * Приводит свободный ответ к сравнимому виду: без регистра, валют, кавычек,
 * завершающей пунктуации и разделителей тысяч.
 *
 * Точка сохраняется, когда она — десятичный разделитель: иначе "66.0"
 * превращалось в "660" и верный числовой ответ не совпадал никогда.
 */
export function normalizeFreeText(value) {
  if (value === null || value === undefined) return "";
  let s = String(value).normalize("NFKC").trim().toLowerCase();

  // “Paris” / «Paris» / ‘Paris’ -> "paris"; NBSP -> обычный пробел.
  s = s.replace(SMART_CHARS, (ch) => (DASHES.test(ch) ? "-" : '"'));
  s = s.replace(NARROW_SPACES, " ");

  // Валюты.
  s = s.replace(/[£$€]/g, "");
  // Разделители тысяч: "1,200" / "1 200" / "1,200,000" -> "1200" / "1200000".
  s = s.replace(/(\d)[,\s](?=\d{3}(?:\D|$))/g, "$1");
  // Десятичная запятая: "0,8" -> "0.8" (строго после тысяч, иначе "1,200" -> "1.2").
  s = s.replace(/(\d),(\d)/g, "$1.$2");
  // Кавычки и апострофы — прочь.
  s = s.replace(/["'`]/g, "");
  // Прочая пунктуация: оставляем буквы, цифры, пробелы, точку, дробь, минус и плюс.
  s = s.replace(/[^\p{L}\p{N}\s./+-]/gu, "");
  // Точка/запятая/дробь по краям — пунктуация, а не часть значения.
  s = s.replace(/^[.,/]+|[.,/]+$/g, "");
  s = s.replace(/\s+/g, " ").trim();
  // Лишние нули в десятичной дроби: "0.80" -> "0.8", "10.0" -> "10".
  if (/^-?\d+\.\d+$/.test(s)) {
    s = s.replace(/0+$/, "").replace(/\.$/, "");
  }
  return s;
}

/** Разбирает «1/2» в 0.5; возвращает null, если это не дробь. */
export function parseFraction(value) {
  const m = String(value).match(/^\s*(-?\d+)\s*\/\s*(\d+)\s*$/);
  if (!m) return null;
  const den = Number(m[2]);
  if (!den) return null;
  return Number(m[1]) / den;
}

/**
 * Сравнивает свободный ответ с эталоном и списком допустимых записей.
 * Числовые записи сравниваются как числа с допуском, текстовые — как строки.
 */
export function freeTextMatches(given, expected, accept = []) {
  const candidates = [expected, ...(Array.isArray(accept) ? accept : [])]
    .filter((v) => v !== undefined && v !== null)
    .map((v) => String(v));

  const givenNorm = normalizeFreeText(given);
  if (!givenNorm) return false;

  for (const candidate of candidates) {
    if (normalizeFreeText(candidate) === givenNorm) return true;
  }

  // Числовое сравнение: "66" против "66.0", "1/2" против "0.5".
  const g = parseFraction(given) ?? Number(normalizeFreeText(given));
  if (Number.isFinite(g)) {
    for (const candidate of candidates) {
      const c = parseFraction(candidate) ?? Number(normalizeFreeText(candidate));
      if (Number.isFinite(c) && Math.abs(g - c) < 1e-9) return true;
    }
  }

  return false;
}

function toIndexList(value) {
  if (Array.isArray(value)) return value.map(Number).sort((a, b) => a - b);
  if (value === null || value === undefined || value === "") return [];
  return [Number(value)];
}

/**
 * Проверяет один вопрос.
 * @param {object} question — элемент `questions` набора.
 * @param {*} given — ответ пользователя (индекс, массив индексов или строка).
 * @returns {boolean}
 */
export function checkAnswer(question, given) {
  if (!question) return false;
  const type = question.type || "multiple_choice";

  if (type === "multiple_answer") {
    const expected = toIndexList(question.answer);
    const actual = toIndexList(given);
    if (expected.length !== actual.length) return false;
    return expected.every((v, i) => v === actual[i]);
  }

  if (
    type === "multiple_choice" ||
    type === "true_false" ||
    type === "true_false_not_given" ||
    type === "matching_headings"
  ) {
    if (given === null || given === undefined || given === "") return false;
    return Number(given) === Number(question.answer);
  }

  return freeTextMatches(given, question.answer, question.accept);
}

/** Вопрос считается «с автопроверкой», если у него есть эталон. */
export function isAutoCheckable(question) {
  if (!question || !question.type) return false;
  if (question.type === "multiple_answer") {
    return Array.isArray(question.answer) && question.answer.length > 0;
  }
  return question.answer !== undefined && question.answer !== null && question.answer !== "";
}

/**
 * Проверяет весь набор (set) и возвращает подробный разбор.
 * @param {object} set — набор с `questions`.
 * @param {object} answers — карта {questionId: ответ}.
 */
export function gradeSet(set, answers = {}) {
  const questions = Array.isArray(set?.questions) ? set.questions : [];
  const details = questions.map((q) => {
    const given = answers[q.id];
    const correct = checkAnswer(q, given);
    return {
      id: q.id,
      prompt: q.prompt,
      type: q.type,
      given: given ?? null,
      expected: q.answer,
      accept: q.accept ?? [],
      correct,
      explanation: q.explanation || "",
    };
  });

  const total = details.length;
  const correct = details.filter((d) => d.correct).length;
  return {
    setId: set?.id ?? null,
    total,
    correct,
    accuracy: total ? correct / total : 0,
    details,
  };
}
