/**
 * Ядро подсчёта баллов для всех экзаменов LeadAI.
 *
 * Модуль намеренно чистый: никаких импортов из React/Next/Firebase, чтобы
 * его можно было прогонять в `node --test` без сборки. Все функции —
 * детерминированные: одинаковый вход всегда даёт одинаковый выход.
 *
 * Три шкалы:
 *   IELTS  — band 0–9 с шагом 0.5, округление по официальному правилу
 *            (0.25 → вверх до .5, 0.75 → вверх до целого);
 *   TOEFL  — секции 0–30, сумма 0–120;
 *   SAT    — секции 200–800, сумма 400–1600.
 */

// ---------------------------------------------------------------------------
// IELTS
// ---------------------------------------------------------------------------

/**
 * Округление до ближайшего полубалла по правилу IELTS.
 * 6.25 -> 6.5, 6.24 -> 6.0, 6.26 -> 6.5, 6.75 -> 7.0, 6.74 -> 6.5.
 *
 * Официальное правило: дробная часть < .25 — вниз, < .75 — до .5, иначе вверх.
 */
export function roundIeltsBand(score) {
  // null/undefined/"" — это «нет данных», а не band 0 (Number(null) === 0).
  if (score === null || score === undefined || score === "" || typeof score === "boolean") {
    return null;
  }
  const n = Number(score);
  if (!Number.isFinite(n)) return null;
  const clamped = Math.min(9, Math.max(0, n));
  const whole = Math.floor(clamped);
  const frac = clamped - whole;
  if (frac < 0.25) return whole;
  if (frac < 0.75) return whole + 0.5;
  return Math.min(9, whole + 1);
}

/**
 * Официальные таблицы IELTS Academic Reading / Listening: сколько правильных
 * ответов из 40 даёт какой band. Порядок — от высшего band к низшему.
 * Источник: публичные conversion tables Cambridge IELTS.
 */
const IELTS_RAW_TO_BAND = [
  [39, 9.0],
  [37, 8.5],
  [35, 8.0],
  [33, 7.5],
  [30, 7.0],
  [27, 6.5],
  [23, 6.0],
  [19, 5.5],
  [15, 5.0],
  [13, 4.5],
  [10, 4.0],
  [8, 3.5],
  [6, 3.0],
  [4, 2.5],
  [3, 2.0],
  [2, 1.5],
  [1, 1.0],
  [0, 0.0],
];

/**
 * Сырой балл -> band для Reading/Listening.
 *
 * Если тест не на 40 вопросов (например, короткий тренировочный набор),
 * сырой балл приводится к 40-балльной шкале пропорционально, чтобы таблица
 * оставалась корректной — иначе 10/10 давало бы band 4.0.
 *
 * @param {number} correct число верных ответов
 * @param {number} total число вопросов в секции
 * @returns {number} band 0–9 с шагом 0.5
 */
export function ieltsBandFromRaw(correct, total) {
  const c = Math.max(0, Number(correct) || 0);
  const t = Number(total) > 0 ? Number(total) : 40;
  const normalized = Math.round((c / t) * 40);
  for (const [threshold, band] of IELTS_RAW_TO_BAND) {
    if (normalized >= threshold) return band;
  }
  return 0;
}

/**
 * Overall band = среднее четырёх секций, округлённое по правилу IELTS.
 * @param {number[]} bands
 */
export function ieltsOverallBand(bands) {
  // Отсутствующую секцию нельзя считать нулём: иначе overall занижается.
  const valid = (Array.isArray(bands) ? bands : [])
    .filter((b) => b !== null && b !== undefined && b !== "" && typeof b !== "boolean")
    .map(Number)
    .filter((b) => Number.isFinite(b) && b >= 0 && b <= 9);
  if (!valid.length) return null;
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  return roundIeltsBand(avg);
}

// ---------------------------------------------------------------------------
// TOEFL iBT
// ---------------------------------------------------------------------------

/**
 * Процент верных ответов -> балл секции 0–30.
 *
 * Официальная шкала TOEFL привязана к «сырому» баллу конкретного варианта,
 * который нам недоступен, поэтому используется монотонная таблица по
 * проценту выполнения — она сохраняет главное свойство: 100% = 30,
 * 0% = 0, шаг между уровнями нелинейный (верхняя часть шкалы «дороже»).
 */
const TOEFL_PERCENT_TO_SECTION = [
  [97, 30],
  [94, 29],
  [91, 28],
  [88, 27],
  [85, 26],
  [82, 25],
  [79, 24],
  [76, 23],
  [73, 22],
  [70, 21],
  [67, 20],
  [64, 19],
  [61, 18],
  [58, 17],
  [55, 16],
  [52, 15],
  [49, 14],
  [46, 13],
  [43, 12],
  [40, 11],
  [37, 10],
  [34, 9],
  [31, 8],
  [28, 7],
  [25, 6],
  [22, 5],
  [19, 4],
  [16, 3],
  [12, 2],
  [8, 1],
  [0, 0],
];

/**
 * @param {number} correct
 * @param {number} total
 * @returns {number} балл секции 0–30
 */
export function toeflSectionScore(correct, total) {
  const t = Number(total);
  if (!(t > 0)) return 0;
  const c = Math.min(t, Math.max(0, Number(correct) || 0));
  const percent = (c / t) * 100;
  for (const [threshold, score] of TOEFL_PERCENT_TO_SECTION) {
    if (percent >= threshold) return score;
  }
  return 0;
}

/**
 * Письменная/устная часть TOEFL: средняя оценка по рубрике (0–5 или 0–4)
 * переводится в 0–30. Официальная связка для Writing — 5.0 -> 30, 4.0 -> 25,
 * 3.0 -> 20, 2.0 -> 14, 1.0 -> 7; для Speaking 4.0 -> 30, 3.0 -> 23,
 * 2.0 -> 15, 1.0 -> 8 (усреднённые официальные таблицы).
 * @param {number} rubricMean
 * @param {number} maxRubric максимальная оценка рубрики (5 для writing, 4 для speaking)
 */
export function toeflRubricToSectionScore(rubricMean, maxRubric = 5) {
  const m = Number(rubricMean);
  const max = Number(maxRubric) > 0 ? Number(maxRubric) : 5;
  if (!Number.isFinite(m) || m <= 0) return 0;
  const ratio = Math.min(1, m / max);
  const thresholds =
    max === 4
      ? [
          [1, 30],
          [0.9, 27],
          [0.75, 23],
          [0.6, 19],
          [0.5, 15],
          [0.4, 11],
          [0.25, 8],
          [0.1, 4],
          [0, 0],
        ]
      : [
          [1, 30],
          [0.9, 27],
          [0.8, 25],
          [0.7, 22],
          [0.6, 20],
          [0.5, 17],
          [0.4, 14],
          [0.3, 11],
          [0.2, 7],
          [0.1, 4],
          [0, 0],
        ];
  for (const [threshold, score] of thresholds) {
    if (ratio >= threshold) return score;
  }
  return 0;
}

/**
 * @param {{reading:number, listening:number, writing:number, speaking:number}} sections
 * @returns {number} суммарный балл 0–120
 */
export function toeflTotal(sections) {
  const sum = ["reading", "listening", "writing", "speaking"]
    .map((k) => Number(sections?.[k]) || 0)
    .reduce((a, b) => a + b, 0);
  return Math.max(0, Math.min(120, Math.round(sum)));
}

// ---------------------------------------------------------------------------
// SAT (Digital SAT)
// ---------------------------------------------------------------------------

/**
 * Процент верных -> балл секции 200–800.
 *
 * Digital SAT переводит сырой балл в «section score» через equated table,
 * зависящую от варианта. Здесь — монотонная аппроксимация по проценту:
 * 0% = 200 (минимум, а не 0), 100% = 800, средний рост равномерный с
 * небольшим сжатием в верхней части шкалы.
 */
export function satSectionScore(correct, total) {
  const t = Number(total);
  if (!(t > 0)) return 200;
  const c = Math.min(t, Math.max(0, Number(correct) || 0));
  const ratio = c / t;
  // 200 + 600 * (ratio^0.92): чуть «дороже» в верхней части диапазона.
  const raw = 200 + 600 * Math.pow(ratio, 0.92);
  // Округление до 10, как в реальном отчёте SAT.
  return Math.max(200, Math.min(800, Math.round(raw / 10) * 10));
}

/**
 * @param {number} rw Reading & Writing (200–800)
 * @param {number} math Math (200–800)
 * @returns {number} 400–1600
 */
export function satTotal(rw, math) {
  const a = Number(rw) || 200;
  const b = Number(math) || 200;
  return Math.max(400, Math.min(1600, Math.round(a + b)));
}

// ---------------------------------------------------------------------------
// Универсальный вход
// ---------------------------------------------------------------------------

/**
 * Приводит сырые результаты к баллам конкретного экзамена.
 *
 * @param {string} exam "ielts" | "toefl" | "sat"
 * @param {Record<string, {correct: number, total: number}>} rawResults
 * @param {{writingRubric?: number, speakingRubric?: number}} [rubrics]
 * @returns {{sections: Record<string, number>, total: number, scale: string}}
 */
export function scoreExam(exam, rawResults, rubrics = {}) {
  const sections = {};

  if (exam === "ielts") {
    for (const [id, { correct, total }] of Object.entries(rawResults)) {
      sections[id] = ieltsBandFromRaw(correct, total);
    }
    const bands = Object.values(sections);
    return {
      sections,
      total: ieltsOverallBand(bands),
      scale: "band",
    };
  }

  if (exam === "toefl") {
    for (const [id, { correct, total }] of Object.entries(rawResults)) {
      sections[id] = toeflSectionScore(correct, total);
    }
    if (Number.isFinite(rubrics.writingRubric)) {
      sections.writing = toeflRubricToSectionScore(rubrics.writingRubric, 5);
    }
    if (Number.isFinite(rubrics.speakingRubric)) {
      sections.speaking = toeflRubricToSectionScore(rubrics.speakingRubric, 4);
    }
    return {
      sections,
      total: toeflTotal(sections),
      scale: "toefl",
    };
  }

  if (exam === "sat") {
    for (const [id, { correct, total }] of Object.entries(rawResults)) {
      sections[id] = satSectionScore(correct, total);
    }
    return {
      sections,
      total: satTotal(sections.rw ?? sections.reading, sections.math),
      scale: "sat",
    };
  }

  throw new Error(`Unknown exam "${exam}"`);
}

/** Человекочитаемая подпись итога: "Band 6.5", "104 / 120", "1280 / 1600". */
export function formatTotal(exam, result) {
  if (!result) return "";
  if (exam === "ielts") return `Band ${result.total}`;
  if (exam === "toefl") return `${result.total} / 120`;
  if (exam === "sat") return `${result.total} / 1600`;
  return String(result.total);
}
