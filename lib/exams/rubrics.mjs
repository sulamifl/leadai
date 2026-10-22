/**
 * Рубрики оценки Writing и Speaking для IELTS и TOEFL.
 *
 * Задача модуля — убрать главную слабость прежней реализации: модель сама
 * называла «overall band», и балл нельзя было ни проверить, ни воспроизвести.
 * Теперь модель оценивает только критерии, а итог считает код по официальным
 * правилам усреднения и округления (`calibrateRubric`).
 *
 * Модуль чистый (без Next/Firebase), чтобы работать под `node --test`.
 */

import { roundIeltsBand } from "./scoring.mjs";

// ---------------------------------------------------------------------------
// Определения рубрик
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} RubricCriterion
 * @property {string} id       машинный ключ
 * @property {string} label    подпись для UI
 * @property {string} short    аббревиатура (TR, CC, LR, GRA, FC, P)
 * @property {string} focus    что именно оценивается — попадает в промпт
 */

/**
 * @typedef {Object} Rubric
 * @property {string} exam
 * @property {string} skill
 * @property {number} scaleMax
 * @property {number} step
 * @property {string} summary  как читается итог
 * @property {RubricCriterion[]} criteria
 */

/** IELTS Writing: Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy. */
export const IELTS_WRITING = {
  exam: "ielts",
  skill: "writing",
  scaleMax: 9,
  step: 0.5,
  summary:
    "IELTS Writing band descriptors. Each criterion is scored 0–9 in 0.5 increments.",
  criteria: [
    {
      id: "task_response",
      label: "Task Response / Achievement",
      short: "TR",
      focus:
        "whether every part of the task is addressed, how fully and relevantly ideas are developed, and whether the position is clear and supported",
    },
    {
      id: "coherence_cohesion",
      label: "Coherence & Cohesion",
      short: "CC",
      focus:
        "logical sequencing of ideas, paragraphing, and the range and accuracy of cohesive devices without mechanical overuse",
    },
    {
      id: "lexical_resource",
      label: "Lexical Resource",
      short: "LR",
      focus:
        "range, precision and naturalness of vocabulary, collocation, spelling, and tolerance of inappropriate word choice",
    },
    {
      id: "grammatical_range_accuracy",
      label: "Grammatical Range & Accuracy",
      short: "GRA",
      focus:
        "variety of complex structures and the proportion of error-free sentences; systematic errors cap the score",
    },
  ],
};

/** IELTS Speaking: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation. */
export const IELTS_SPEAKING = {
  exam: "ielts",
  skill: "speaking",
  scaleMax: 9,
  step: 0.5,
  summary:
    "IELTS Speaking band descriptors. Each criterion is scored 0–9 in 0.5 increments.",
  criteria: [
    {
      id: "fluency_coherence",
      label: "Fluency & Coherence",
      short: "FC",
      focus:
        "speed and smoothness of delivery, length of runs of speech, and how coherently ideas are linked",
    },
    {
      id: "lexical_resource",
      label: "Lexical Resource",
      short: "LR",
      focus:
        "range and flexibility of vocabulary, paraphrase ability, and idiomatic language used appropriately",
    },
    {
      id: "grammatical_range_accuracy",
      label: "Grammatical Range & Accuracy",
      short: "GRA",
      focus:
        "range of structures and frequency of errors, especially errors that impede communication",
    },
    {
      id: "pronunciation",
      label: "Pronunciation",
      short: "P",
      focus:
        "intelligibility, stress, rhythm and intonation; heavy L1 interference caps the score",
    },
  ],
};

/** TOEFL Writing (2023+ format): holistic 0–5 per task, разложенная на 4 наблюдаемых критерия. */
export const TOEFL_WRITING = {
  exam: "toefl",
  skill: "writing",
  scaleMax: 5,
  step: 0.5,
  summary:
    "TOEFL iBT Writing rubric. Each criterion is scored 0–5 in 0.5 increments; the official task score is the mean.",
  criteria: [
    {
      id: "task_response",
      label: "Task Fulfilment",
      short: "TF",
      focus:
        "whether the required content is present (integrated: lecture points related to reading; discussion: a clear own position in the conversation)",
    },
    {
      id: "organization",
      label: "Organization",
      short: "ORG",
      focus:
        "progression of ideas, paragraph structure, and use of transitions",
    },
    {
      id: "language_use",
      label: "Language Use",
      short: "LU",
      focus:
        "range and accuracy of grammar and vocabulary, including sentence variety",
    },
    {
      id: "conventions",
      label: "Mechanics",
      short: "MECH",
      focus:
        "spelling, punctuation and capitalisation errors that affect readability",
    },
  ],
};

/** TOEFL Speaking: Delivery, Language Use, Topic Development (0–4). */
export const TOEFL_SPEAKING = {
  exam: "toefl",
  skill: "speaking",
  scaleMax: 4,
  step: 0.5,
  summary:
    "TOEFL iBT Speaking rubric. Each criterion is scored 0–4 in 0.5 increments; the official task score is the mean.",
  criteria: [
    {
      id: "delivery",
      label: "Delivery",
      short: "DEL",
      focus:
        "clarity of speech, pace, pronunciation and intonation; whether a listener can follow without effort",
    },
    {
      id: "language_use",
      label: "Language Use",
      short: "LU",
      focus:
        "grammatical accuracy and vocabulary range appropriate to an academic register",
    },
    {
      id: "topic_development",
      label: "Topic Development",
      short: "TD",
      focus:
        "completeness and relevance of the answer, coherence, and use of specific supporting detail",
    },
  ],
};

const REGISTRY = {
  "ielts:writing": IELTS_WRITING,
  "ielts:speaking": IELTS_SPEAKING,
  "toefl:writing": TOEFL_WRITING,
  "toefl:speaking": TOEFL_SPEAKING,
};

/**
 * Резолвер рубрики. По умолчанию IELTS — так ведут себя старые клиенты,
 * которые не передают exam/skill.
 */
export function getRubric(exam = "ielts", skill = "writing") {
  const key = `${exam}:${skill}`;
  return REGISTRY[key] || REGISTRY[`ielts:${skill}`] || IELTS_WRITING;
}

export function rubricForSkill(skill) {
  return { ielts: getRubric("ielts", skill), toefl: getRubric("toefl", skill) };
}

// ---------------------------------------------------------------------------
// Промпт
// ---------------------------------------------------------------------------

/**
 * Собирает системный промпт с дескрипторами. Ключевое отличие от прежнего:
 * модель НЕ выставляет overall — только критерии, из которых код считает итог.
 *
 * @param {string} exam
 * @param {string} skill "writing" | "speaking"
 */
export function buildRubricSystemPrompt(exam = "ielts", skill = "writing") {
  const rubric = getRubric(exam, skill);
  const criteriaList = rubric.criteria
    .map(
      (c, i) =>
        `${i + 1}. "${c.id}" (${c.short}) — ${c.label}: ${c.focus}.`
    )
    .join("\n");

  const halfStep =
    rubric.step === 0.5
      ? "You may use half-points (e.g. 6.5), but nothing finer than 0.5."
      : "Use whole points only.";

  return `You are a certified ${exam.toUpperCase()} ${skill} examiner.

${rubric.summary}

Score each criterion strictly according to these descriptors:
${criteriaList}

Rules:
- Score each criterion independently on a ${rubric.scaleMax}-point scale. ${halfStep}
- Do NOT compute or state an overall score — the application does that itself from your criterion scores.
- Be strict and evidence-based: quote short fragments from the candidate's text/transcript as evidence.
- "evidence" must be an actual substring of the candidate's response (max 140 characters). If you cannot quote, use "".
- Comments must be concrete and actionable, not generic praise.

Respond with ONLY a valid JSON object, no markdown fences, no prose outside it:
{
  "criteria": [
    { "id": "${rubric.criteria[0].id}", "score": <number>, "evidence": "<quote>", "comment": "<why this score>" }
  ],
  "strengths": ["..."],
  "weaknesses": ["..."],
  "recommendations": ["..."],
  "correctedExcerpt": "<one rewritten sentence of the candidate's text, or '' for speaking>"
}

"criteria" must contain exactly ${rubric.criteria.length} objects with ids: ${rubric.criteria
    .map((c) => c.id)
    .join(", ")}.`;
}

/**
 * Пользовательский промпт с самим ответом кандидата.
 * @param {{text: string, prompt?: string, taskType?: string, exam?: string, skill?: string}} input
 */
export function buildRubricUserPrompt({
  text,
  prompt,
  taskType,
  exam = "ielts",
  skill = "writing",
}) {
  const rubric = getRubric(exam, skill);
  const label = skill === "speaking" ? "Transcript of the spoken answer" : "Essay";
  return [
    `Task: ${prompt || "Not specified"}`,
    taskType ? `Task type: ${taskType}` : null,
    `Criteria scale: 0–${rubric.scaleMax}.`,
    "",
    `${label}:`,
    text,
  ]
    .filter(Boolean)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Разбор и калибровка
// ---------------------------------------------------------------------------

/**
 * Извлекает JSON из ответа модели. Модели любят оборачивать JSON в ```json,
 * добавлять пояснения до/после — поэтому берём первую { и последнюю }.
 * @param {string} text
 * @returns {Object|null}
 */
export function extractJsonObject(text) {
  if (!text || typeof text !== "string") return null;
  const cleaned = text
    .replace(/^\uFEFF/, "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** Приводит критерий к сетке рубрики: [0, scaleMax] с шагом step. */
export function snapToRubricScale(score, scaleMax, step = 0.5) {
  // null/"" — критерий не распознан, а не «модель поставила 0»: иначе
  // пропавший критерий молча засчитывался бы как честный ноль без предупреждения.
  if (score === null || score === undefined || score === "" || typeof score === "boolean") {
    return null;
  }
  const n = Number(score);
  if (!Number.isFinite(n)) return null;
  const clamped = Math.min(scaleMax, Math.max(0, n));
  return Math.round(clamped / step) * step;
}

/**
 * Калибрует ответ модели: валидирует критерии, отбрасывает лишние, добивает
 * отсутствующие нулём (и сообщает об этом в warnings), затем сам считает итог.
 *
 * Итог IELTS — среднее четырёх критериев с округлением по правилу экзамена
 * (6.25 -> 6.5, 6.75 -> 7.0). Итог TOEFL — среднее, округлённое до 0.5
 * (официальный task score).
 *
 * @param {Object} parsed ответ модели
 * @param {{exam?:string, skill?:string}} [options]
 */
export function calibrateRubric(parsed, options = {}) {
  const rubric = getRubric(options.exam, options.skill);
  const incoming = Array.isArray(parsed?.criteria) ? parsed.criteria : [];
  const byId = new Map();
  for (const c of incoming) {
    const id = String(c?.id || c?.name || "")
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    if (id) byId.set(id, c);
  }

  const warnings = [];
  const criteria = rubric.criteria.map((def) => {
    const found =
      byId.get(def.id) ||
      [...byId.entries()].find(([id]) => id.includes(def.id.slice(0, 5)))?.[1];
    const rawScore = found?.score ?? found?.band ?? found?.value;
    const score = snapToRubricScale(rawScore, rubric.scaleMax, rubric.step);
    if (score === null) {
      warnings.push(`Критерий «${def.short}» не распознан — выставлен 0.`);
    }
    return {
      id: def.id,
      label: found?.label || def.label,
      short: def.short,
      score: score ?? 0,
      evidence: typeof found?.evidence === "string" ? found.evidence : "",
      comment:
        typeof found?.comment === "string"
          ? found.comment
          : typeof found?.feedback === "string"
            ? found.feedback
            : "",
    };
  });

  const scores = criteria.map((c) => c.score);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;

  let overall;
  let scale;
  if (rubric.exam === "ielts") {
    overall = roundIeltsBand(mean);
    scale = "band";
  } else {
    overall = Math.round(mean * 2) / 2;
    scale = "task";
  }

  return {
    exam: rubric.exam,
    skill: rubric.skill,
    scale,
    scaleMax: rubric.scaleMax,
    criteria,
    mean: Math.round(mean * 100) / 100,
    overall,
    strengths: asStringArray(parsed?.strengths),
    weaknesses: asStringArray(parsed?.weaknesses),
    recommendations: asStringArray(parsed?.recommendations),
    correctedExcerpt:
      typeof parsed?.correctedExcerpt === "string" ? parsed.correctedExcerpt : "",
    warnings,
  };
}

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === "string" && v.trim()).map((v) => v.trim());
}

/**
 * Проверяет, что ответ модели вообще пригоден: есть хотя бы один критерий
 * с числовым баллом. Иначе роут должен вернуть 502, а не «успех с нулями».
 */
export function hasUsableCriteria(parsed) {
  if (!parsed || !Array.isArray(parsed.criteria) || !parsed.criteria.length) {
    return false;
  }
  return parsed.criteria.some((c) =>
    Number.isFinite(Number(c?.score ?? c?.band ?? c?.value))
  );
}
