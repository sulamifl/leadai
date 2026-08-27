import { chatCompletion } from "@/lib/deepseek";

/**
 * Единые AI-обработчики для всех типов запросов к DeepSeek.
 *
 * Эти функции не являются Next.js Route-обработчиками напрямую, поэтому
 * их можно безопасно импортировать из нескольких роутов без конфликтов
 * с валидацией типов Next.js Route.
 *
 *   - handleEssay           -> анализ эссе / генерация темы (бывший /api/openai)
 *   - handleVoice           -> анализ речи / генерация темы (бывший /api/voice)
 *   - handleCode            -> обучение программированию (бывший /api/codeAI)
 *   - handleRecommendations -> рекомендации университетов (бывший /api/getRecommendations)
 */

// ---------------------------------------------------------------------------
// Вспомогательные функции
// ---------------------------------------------------------------------------

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function handleError(error, message) {
  console.error("DeepSeek API error:", error);
  return jsonResponse({ error: message }, 500);
}

// ---------------------------------------------------------------------------
// Essay (бывший /api/openai)
// ---------------------------------------------------------------------------

async function analyzeEssay(essay) {
  return chatCompletion([
    {
      role: "system",
      content:
        "You are a helpful assistant that analyzes essays. Provide your analysis in a structured format with a score out of 100, detailed feedback, and recommendations for improvement.",
    },
    {
      role: "user",
      content: `Please analyze the following essay and provide a score out of 100, detailed feedback, and recommendations for improvement:\n\n${essay}`,
    },
  ]);
}

async function generateEssayTopic() {
  return chatCompletion([
    {
      role: "system",
      content: "You are a helpful assistant that generates essay topics.",
    },
    {
      role: "user",
      content: "Generate an interesting and challenging essay topic.",
    },
  ]);
}

export async function handleEssay(req) {
  const { prompt, task } = await req.json();
  try {
    let response;
    if (task === "analyze") {
      response = await analyzeEssay(prompt);
    } else if (task === "generate") {
      response = await generateEssayTopic();
    } else {
      return jsonResponse({ error: "Invalid task" }, 400);
    }
    return jsonResponse({ result: response });
  } catch (error) {
    return handleError(error, "Error processing your request");
  }
}

// ---------------------------------------------------------------------------
// Voice (бывший /api/voice)
// ---------------------------------------------------------------------------

async function analyzeSpeech(speech) {
  const content = await chatCompletion([
    {
      role: "system",
      content:
        "You are a helpful assistant that analyzes speeches. Provide your analysis in a structured format with a detailed evaluation, score out of 100, and specific recommendations for improvement. Format your response with clear paragraph breaks and a distinct score line.",
    },
    {
      role: "user",
      content: `Please analyze the following speech and provide a detailed evaluation, score out of 100, and specific recommendations for improvement:\n\n${speech}`,
    },
  ]);

  // Extract the score
  const scoreMatch = content.match(/Score:\s*(\d+)/i);
  const score = scoreMatch ? scoreMatch[1] : "N/A";

  // Remove the score from the content and split into paragraphs
  const cleanedContent = content
    .replace(/(?:Overall|Score):\s*\d+(?:\s*\/\s*100)?/gi, "")
    .trim();
  const paragraphs = cleanedContent.split("\n\n");

  // Reconstruct the response with clear paragraph breaks and a distinct score line
  return [`Score: ${score} out of 100`, ...paragraphs.map((p) => p.trim())].join(
    "\n\n"
  );
}

async function generateSpeechTopic() {
  return chatCompletion([
    {
      role: "system",
      content: "You are a helpful assistant that generates interesting speech topics.",
    },
    {
      role: "user",
      content: "Generate an interesting and challenging topic for a speech.",
    },
  ]);
}

export async function handleVoice(req) {
  const { text, task } = await req.json();
  try {
    let response;
    if (task === "analyze") {
      response = await analyzeSpeech(text);
    } else if (task === "generate") {
      response = await generateSpeechTopic();
    } else {
      return jsonResponse({ error: "Invalid task" }, 400);
    }
    return jsonResponse({ result: response });
  } catch (error) {
    return handleError(error, "Error processing your request");
  }
}

// ---------------------------------------------------------------------------
// Code (бывший /api/codeAI)
// ---------------------------------------------------------------------------

export async function handleCode(req) {
  try {
    const userData = await req.json();
    const systemMessage = `You are an expert programming instructor. Provide detailed learning plans, theory, practical tasks, and answer questions about programming topics. Tailor your responses to the user's selected programming topic and learning duration. When appropriate, provide tests and conduct mini-interviews to assess the user's progress. Always remember the context of the conversation and the user's progress. If the user submits code or answers, evaluate them and provide feedback.

Current learning state:
Topic: ${userData.selectedTopic}
Duration: ${userData.selectedDuration ? `${userData.selectedDuration.name} (${userData.selectedDuration.time})` : "Not specified"}
Current Day: ${userData.currentDay || "Not started"}
Current Module: ${userData.currentModule || "Not started"}

Provide appropriate response based on this context.`;

    const userMessage = userData.userMessage;

    // Создаем массив сообщений для отправки в API
    const apiMessages = [
      { role: "system", content: systemMessage },
      ...(userData.messages || []), // Добавляем всю историю сообщений
      { role: "user", content: userMessage },
    ];

    const content = await chatCompletion(apiMessages, { max_tokens: 2000 });

    // Логика для определения следующих шагов
    const nextDay = content.toLowerCase().includes("переходим к следующему дню");
    const nextModule = content.toLowerCase().includes("переходим к следующему модулю");
    const isTest = content.toLowerCase().includes("тест:");
    const isInterview = content.toLowerCase().includes("интервью:");

    return jsonResponse({ content, nextDay, nextModule, isTest, isInterview });
  } catch (error) {
    return handleError(error, "An error occurred while getting a response");
  }
}

// ---------------------------------------------------------------------------
// Recommendations (бывший /api/getRecommendations)
// ---------------------------------------------------------------------------

export async function handleRecommendations(req) {
  try {
    const userData = await req.json();

    const systemMessage = `You are a university admissions expert. Provide detailed recommendations for universities based on the given user information. Include a mix of universities from different countries and explain why each university might be a good fit. Provide links to the university websites, detailed information about each university, its location (city and country), and ratings based on various criteria (academic reputation, employer reputation, faculty/student ratio, citations per faculty, international faculty ratio, international student ratio).`;

    const userMessage = `
      Based on the following user information:
      Test Score: ${userData.test_score}
      Test Type: ${userData.test_type}
      Test Details: ${userData.test_details}
      Gender: ${userData.gender}
      Native Language: ${userData.native_language}
      Interests: ${userData.interests}
      Desired Major: ${userData.desired_major}
      Age: ${userData.age}
      Desired Country: ${userData.desired_country}

      Recommend 5 universities that would be suitable for this student. Include the university name, location (city and country), a detailed explanation of why it's recommended, the percentage chance of admission, a link to the university's official website, and ratings for various criteria (academic reputation, employer reputation, faculty/student ratio, citations per faculty, international faculty ratio, international student ratio). Provide the response in ${userData.native_language || "English"}.
    `;

    const recommendations = await chatCompletion(
      [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      { max_tokens: 2000 }
    );

    return jsonResponse({ recommendations });
  } catch (error) {
    return handleError(error, "An error occurred while getting recommendations");
  }
}

// ---------------------------------------------------------------------------
// Study Plan (персональный план подготовки к IELTS)
// ---------------------------------------------------------------------------

export async function handleStudyPlan(req) {
  try {
    const {
      currentScore,
      targetScore,
      weeks = 8,
      sectionScores,
      dailyMinutes,
    } = await req.json();

    const systemMessage =
      "You are an expert IELTS preparation coach. Create a detailed, personalized weekly study plan that helps the student reach their target band score. Focus on their weakest sections, provide specific exercises, and recommend concrete resources. Structure the plan week by week with clear goals, daily tasks, and measurable milestones.";

    const userMessage = `
      Please generate a detailed weekly IELTS preparation plan based on the following information:

      Current overall score: ${currentScore ?? "Not specified"}
      Target overall score: ${targetScore ?? "Not specified"}
      Number of weeks to prepare: ${weeks}
      Minutes available per day: ${dailyMinutes ?? "Not specified"}

      Section scores (if available):
      - Listening: ${sectionScores?.listening ?? "Not specified"}
      - Reading: ${sectionScores?.reading ?? "Not specified"}
      - Speaking: ${sectionScores?.speaking ?? "Not specified"}
      - Writing: ${sectionScores?.writing ?? "Not specified"}

      Create a week-by-week plan that prioritizes the weakest sections, includes specific exercises and study resources, and sets clear milestones to track progress toward the target score.
    `;

    const content = await chatCompletion(
      [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      { max_tokens: 2000 }
    );

    return jsonResponse({ plan: content });
  } catch (error) {
    return handleError(error, "An error occurred while generating the study plan");
  }
}

// ---------------------------------------------------------------------------
// Practice Test (AI-генерация практических тестов по секциям IELTS)
// ---------------------------------------------------------------------------

const SECTION_LABELS = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

const LEVEL_LABELS = {
  easy: "Easy (Band 4-5)",
  medium: "Medium (Band 6-7)",
  hard: "Hard (Band 7.5-9)",
};

/**
 * Строит системный промпт для генерации практического теста.
 * Требует строгий JSON-ответ, чтобы клиент мог распарсить его напрямую.
 */
function buildPracticeTestSystemPrompt() {
  return `You are an expert IELTS test generator. You create unique, high-quality practice questions that closely mirror the real IELTS exam format.

You MUST respond with ONLY a valid JSON object. Do not include any markdown, code fences, explanations, or text outside the JSON. The JSON must be parseable with JSON.parse().

The JSON structure must be exactly:

{
  "section": "listening" | "reading" | "writing" | "speaking",
  "level": "easy" | "medium" | "hard",
  "topic": "the topic used for the questions",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice" | "gap_fill" | "matching" | "task",
      "question": "the question text or instruction",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "the correct option text or answer",
      "explanation": "a brief explanation of why this is correct"
    }
  ]
}

Rules:
- For "multiple_choice" questions, ALWAYS provide 4 options in the "options" array and set "correctAnswer" to one of them.
- For "gap_fill" questions, "options" may be omitted; "correctAnswer" is the missing word/phrase.
- For "matching" questions, "options" are the items to match and "correctAnswer" describes the correct pairing.
- For "writing" and "speaking" sections, each question is a "task" with "question" being the full prompt, "options" omitted, "correctAnswer" set to a short summary of what a good response should include, and "explanation" containing the assessment criteria (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy for writing; Fluency, Lexical Resource, Grammatical Range, Pronunciation for speaking).
- Questions must be unique, realistic, and appropriate for the requested difficulty level.
- The "topic" field must reflect the requested topic (or a sensible default if none was provided).`;
}

/**
 * Строит пользовательский промпт с параметрами запроса.
 */
function buildPracticeTestUserPrompt({ section, level, count, topic }) {
  const sectionLabel = SECTION_LABELS[section] || section;
  const levelLabel = LEVEL_LABELS[level] || level;

  let typeInstruction;
  if (section === "writing") {
    typeInstruction =
      "Generate writing tasks (Task 1 and/or Task 2 style prompts) with clear instructions and assessment criteria.";
  } else if (section === "speaking") {
    typeInstruction =
      "Generate speaking tasks (Part 1, Part 2, and/or Part 3 style questions) with cue cards and follow-up questions.";
  } else if (section === "listening") {
    typeInstruction =
      "Generate listening-style questions (multiple choice, form completion, matching, sentence completion) with realistic audio-transcript-style content.";
  } else {
    typeInstruction =
      "Generate reading-style questions (multiple choice, matching headings, true/false/not given, gap fill) based on a realistic passage topic.";
  }

  return `Please generate a unique IELTS practice test with the following parameters:

Section: ${sectionLabel}
Difficulty level: ${levelLabel}
Number of questions: ${count}
Topic: ${topic || "General IELTS topic (choose a realistic and interesting one)"}

${typeInstruction}

Return ONLY the JSON object described in the system prompt. Do not wrap it in markdown code fences.`;
}

/**
 * Пытается извлечь JSON из ответа модели, устойчиво обрабатывая
 * возможные markdown-обёртки или лишний текст вокруг JSON.
 */
function extractJson(content) {
  if (!content) return null;

  // Пробуем распарсить как есть
  try {
    return JSON.parse(content);
  } catch {
    // ignore
  }

  // Пробуем вытащить JSON из markdown-код-блока ```json ... ```
  const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // ignore
    }
  }

  // Пробуем вытащить первый {...} объект
  const objectMatch = content.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      // ignore
    }
  }

  return null;
}

export async function handlePracticeTest(req) {
  try {
    const { section, level = "medium", count = 5, topic } = await req.json();

    const validSections = ["listening", "reading", "writing", "speaking"];
    const validLevels = ["easy", "medium", "hard"];

    if (!validSections.includes(section)) {
      return jsonResponse(
        { error: `Invalid section "${section}". Expected one of: ${validSections.join(", ")}` },
        400
      );
    }

    if (!validLevels.includes(level)) {
      return jsonResponse(
        { error: `Invalid level "${level}". Expected one of: ${validLevels.join(", ")}` },
        400
      );
    }

    const parsedCount = parseInt(count, 10);
    const safeCount = Number.isNaN(parsedCount)
      ? 5
      : Math.min(Math.max(parsedCount, 1), 20);

    const content = await chatCompletion(
      [
        { role: "system", content: buildPracticeTestSystemPrompt() },
        {
          role: "user",
          content: buildPracticeTestUserPrompt({
            section,
            level,
            count: safeCount,
            topic,
          }),
        },
      ],
      { max_tokens: 3000, temperature: 0.8 }
    );

    const parsed = extractJson(content);

    if (!parsed || !Array.isArray(parsed.questions)) {
      return jsonResponse(
        {
          error: "The AI response could not be parsed as valid JSON. Please try again.",
          raw: content,
        },
        502
      );
    }

    return jsonResponse({
      section: parsed.section || section,
      level: parsed.level || level,
      topic: parsed.topic || topic || "",
      questions: parsed.questions,
    });
  } catch (error) {
    return handleError(error, "An error occurred while generating the practice test");
  }
}

// ---------------------------------------------------------------------------
// Essay Feedback (AI-проверка эссе по критериям IELTS Writing)
// ---------------------------------------------------------------------------

/**
 * Строит системный промпт для детальной проверки эссе по критериям IELTS.
 * Требует строгий JSON-ответ, чтобы клиент мог распарсить его напрямую.
 */
function buildEssayFeedbackSystemPrompt() {
  return `You are an expert IELTS Writing examiner. You evaluate essays using the official IELTS Writing Task 2 assessment criteria and provide detailed, constructive feedback.

You MUST respond with ONLY a valid JSON object. Do not include any markdown, code fences, explanations, or text outside the JSON. The JSON must be parseable with JSON.parse().

The JSON structure must be exactly:

{
  "overallBand": 6.5,
  "overallScore": 65,
  "criteria": [
    {
      "name": "Task Response",
      "band": 6.5,
      "score": 65,
      "comment": "detailed comment on how well the essay addresses the task"
    },
    {
      "name": "Coherence & Cohesion",
      "band": 6.5,
      "score": 65,
      "comment": "detailed comment on paragraphing, linking, and logical flow"
    },
    {
      "name": "Lexical Resource",
      "band": 6.5,
      "score": 65,
      "comment": "detailed comment on vocabulary range and accuracy"
    },
    {
      "name": "Grammatical Range & Accuracy",
      "band": 6.5,
      "score": 65,
      "comment": "detailed comment on grammar range and accuracy"
    }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"],
  "correctedExcerpt": "a short corrected/improved version of a key sentence or paragraph from the essay"
}

Rules:
- "overallBand" is the overall IELTS band (0-9, can be half bands like 6.5).
- "overallScore" is the overall score out of 100.
- Each criterion must have a "band" (0-9, half bands allowed), a "score" (0-100), and a detailed "comment".
- "strengths", "weaknesses", and "recommendations" must each be arrays of 3-5 specific, actionable items.
- "correctedExcerpt" should show a concrete improvement of a real sentence from the essay.
- Be fair, specific, and encouraging. Reference actual parts of the essay in your comments.`;
}

/**
 * Строит пользовательский промпт с текстом эссе и опциональной темой.
 */
function buildEssayFeedbackUserPrompt({ essay, taskType, topic }) {
  return `Please evaluate the following IELTS Writing essay and provide detailed feedback according to the official IELTS Writing Task 2 criteria.

Task type: ${taskType || "Task 2 (Opinion / Discussion / Problem-Solution)"}
Topic (if provided): ${topic || "Not specified"}

Essay:
"""
${essay}
"""

Return ONLY the JSON object described in the system prompt. Do not wrap it in markdown code fences.`;
}

export async function handleEssayFeedback(req) {
  try {
    const { essay, taskType, topic } = await req.json();

    if (!essay || typeof essay !== "string" || essay.trim().length < 20) {
      return jsonResponse(
        { error: "Please provide a valid essay of at least 20 characters." },
        400
      );
    }

    const content = await chatCompletion(
      [
        { role: "system", content: buildEssayFeedbackSystemPrompt() },
        {
          role: "user",
          content: buildEssayFeedbackUserPrompt({ essay, taskType, topic }),
        },
      ],
      { max_tokens: 2500, temperature: 0.4 }
    );

    const parsed = extractJson(content);

    if (
      !parsed ||
      !Array.isArray(parsed.criteria) ||
      parsed.criteria.length === 0
    ) {
      return jsonResponse(
        {
          error: "The AI response could not be parsed as valid JSON. Please try again.",
          raw: content,
        },
        502
      );
    }

    return jsonResponse({
      overallBand: parsed.overallBand ?? null,
      overallScore: parsed.overallScore ?? null,
      criteria: parsed.criteria,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      recommendations: parsed.recommendations || [],
      correctedExcerpt: parsed.correctedExcerpt || "",
    });
  } catch (error) {
    return handleError(error, "An error occurred while analyzing the essay");
  }
}

// ---------------------------------------------------------------------------
// Speech Feedback (AI-проверка речи по критериям IELTS Speaking)
// ---------------------------------------------------------------------------

/**
 * Строит системный промпт для детальной проверки речи по критериям IELTS.
 * Требует строгий JSON-ответ, чтобы клиент мог распарсить его напрямую.
 */
function buildSpeechFeedbackSystemPrompt() {
  return `You are an expert IELTS Speaking examiner. You evaluate spoken responses using the official IELTS Speaking assessment criteria and provide detailed, constructive feedback.

You MUST respond with ONLY a valid JSON object. Do not include any markdown, code fences, explanations, or text outside the JSON. The JSON must be parseable with JSON.parse().

The JSON structure must be exactly:

{
  "overallBand": 6.5,
  "overallScore": 65,
  "criteria": [
    {
      "name": "Fluency & Coherence",
      "band": 6.5,
      "score": 65,
      "comment": "detailed comment on fluency, pacing, and logical organization of ideas"
    },
    {
      "name": "Lexical Resource",
      "band": 6.5,
      "score": 65,
      "comment": "detailed comment on vocabulary range, precision, and paraphrasing"
    },
    {
      "name": "Grammatical Range & Accuracy",
      "band": 6.5,
      "score": 65,
      "comment": "detailed comment on grammatical range and accuracy"
    },
    {
      "name": "Pronunciation",
      "band": 6.5,
      "score": 65,
      "comment": "detailed comment on pronunciation, intonation, and clarity"
    }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"],
  "improvedResponse": "a short improved/rewritten version of a key part of the response that demonstrates better fluency and vocabulary"
}

Rules:
- "overallBand" is the overall IELTS band (0-9, can be half bands like 6.5).
- "overallScore" is the overall score out of 100.
- Each criterion must have a "band" (0-9, half bands allowed), a "score" (0-100), and a detailed "comment".
- "strengths", "weaknesses", and "recommendations" must each be arrays of 3-5 specific, actionable items.
- "improvedResponse" should show a concrete improved version of a real part of the response.
- Be fair, specific, and encouraging. Reference actual parts of the response in your comments.`;
}

/**
 * Строит пользовательский промпт с текстом речи и опциональным вопросом.
 */
function buildSpeechFeedbackUserPrompt({ speech, question }) {
  return `Please evaluate the following IELTS Speaking response and provide detailed feedback according to the official IELTS Speaking assessment criteria.

Speaking question (if provided): ${question || "Not specified"}

Response:
"""
${speech}
"""

Return ONLY the JSON object described in the system prompt. Do not wrap it in markdown code fences.`;
}

export async function handleSpeechFeedback(req) {
  try {
    const { speech, question } = await req.json();

    if (!speech || typeof speech !== "string" || speech.trim().length < 10) {
      return jsonResponse(
        { error: "Please provide a valid speech response of at least 10 characters." },
        400
      );
    }

    const content = await chatCompletion(
      [
        { role: "system", content: buildSpeechFeedbackSystemPrompt() },
        {
          role: "user",
          content: buildSpeechFeedbackUserPrompt({ speech, question }),
        },
      ],
      { max_tokens: 2500, temperature: 0.4 }
    );

    const parsed = extractJson(content);

    if (
      !parsed ||
      !Array.isArray(parsed.criteria) ||
      parsed.criteria.length === 0
    ) {
      return jsonResponse(
        {
          error: "The AI response could not be parsed as valid JSON. Please try again.",
          raw: content,
        },
        502
      );
    }

    return jsonResponse({
      overallBand: parsed.overallBand ?? null,
      overallScore: parsed.overallScore ?? null,
      criteria: parsed.criteria,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      recommendations: parsed.recommendations || [],
      improvedResponse: parsed.improvedResponse || "",
    });
  } catch (error) {
    return handleError(error, "An error occurred while analyzing the speech");
  }
}

// ---------------------------------------------------------------------------
// Personalized Study Plan (персональный план на основе слабых мест из истории)
// ---------------------------------------------------------------------------

/**
 * Строит системный промпт для генерации персонализированного плана обучения.
 * Требует строгий JSON-ответ, чтобы клиент мог распарсить его напрямую.
 */
function buildPersonalizedStudyPlanSystemPrompt() {
  return `You are an expert IELTS preparation coach who creates highly personalized study plans based on a student's actual test history and identified weaknesses.

You MUST respond with ONLY a valid JSON object. Do not include any markdown, code fences, explanations, or text outside the JSON. The JSON must be parseable with JSON.parse().

The JSON structure must be exactly:

{
  "summary": "A 2-3 sentence summary of the student's current level and main focus areas",
  "weaknessAnalysis": [
    {
      "section": "Listening",
      "currentBand": 6.0,
      "targetBand": 7.0,
      "analysis": "detailed explanation of why this is a weakness and what specifically needs improvement"
    }
  ],
  "weeklyPlan": [
    {
      "week": 1,
      "focus": "main focus for this week",
      "goals": ["specific goal 1", "specific goal 2", "specific goal 3"],
      "tasks": ["concrete daily/weekly task 1", "concrete daily/weekly task 2", "concrete daily/weekly task 3"]
    }
  ],
  "dailyRoutine": {
    "warmUp": "5-10 minute warm-up activity",
    "corePractice": "main practice block description",
    "weaknessDrill": "targeted drill for the weakest section",
    "review": "review and self-assessment activity"
  },
  "resources": [
    {
      "name": "resource name",
      "type": "book | website | app | practice test",
      "why": "why this resource helps with the identified weaknesses"
    }
  ],
  "milestones": [
    {
      "week": 2,
      "checkpoint": "what the student should be able to do by this week"
    }
  ],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"]
}

Rules:
- "weaknessAnalysis" must include each weak section identified from the test history, ordered from weakest to strongest.
- When section target scores are provided, compare each section's current average against its target and prioritize sections with the largest gap (target minus current). A section is a weakness if its current score is below its target.
- "weeklyPlan" must have one entry per week (up to the number of weeks requested), each with concrete, measurable goals and tasks.
- "dailyRoutine" should fit within the student's available daily minutes.
- "resources" should be real, well-known IELTS resources.
- "milestones" should be spread across the plan duration.
- Be specific, realistic, and encouraging. Reference the student's actual section scores and target scores in the analysis.`;
}

/**
 * Строит пользовательский промпт с историей тестов и параметрами плана.
 */
function buildPersonalizedStudyPlanUserPrompt({
  targetScore,
  weeks,
  dailyMinutes,
  historySummary,
  sectionAverages,
  sectionGoals,
  weakestSections,
  currentOverall,
}) {
  return `Please generate a personalized IELTS study plan based on the following information.

Target overall score: ${targetScore ?? "Not specified"}
Current overall average score: ${currentOverall ?? "Not specified"}
Number of weeks to prepare: ${weeks}
Minutes available per day: ${dailyMinutes ?? "Not specified"}

Average section scores from the student's test history:
- Listening: ${sectionAverages?.listening ?? "Not specified"}
- Reading: ${sectionAverages?.reading ?? "Not specified"}
- Speaking: ${sectionAverages?.speaking ?? "Not specified"}
- Writing: ${sectionAverages?.writing ?? "Not specified"}

Target section scores (from the student's goals):
- Listening: ${sectionGoals?.listening ?? "Not specified"}
- Reading: ${sectionGoals?.reading ?? "Not specified"}
- Speaking: ${sectionGoals?.speaking ?? "Not specified"}
- Writing: ${sectionGoals?.writing ?? "Not specified"}

Weakest sections (prioritize these, especially those below their target): ${weakestSections?.join(", ") || "Not specified"}

Test history summary:
"""
${historySummary || "No detailed history available"}
"""

Return ONLY the JSON object described in the system prompt. Do not wrap it in markdown code fences.`;
}

export async function handlePersonalizedStudyPlan(req) {
  try {
    const {
      targetScore,
      weeks = 8,
      dailyMinutes,
      sectionAverages,
      sectionGoals,
      weakestSections,
      historySummary,
      currentOverall,
    } = await req.json();

    const content = await chatCompletion(
      [
        {
          role: "system",
          content: buildPersonalizedStudyPlanSystemPrompt(),
        },
        {
          role: "user",
          content: buildPersonalizedStudyPlanUserPrompt({
            targetScore,
            weeks,
            dailyMinutes,
            sectionAverages,
            sectionGoals,
            weakestSections,
            historySummary,
            currentOverall,
          }),
        },
      ],
      { max_tokens: 3000, temperature: 0.4 }
    );

    const parsed = extractJson(content);

    if (!parsed || !Array.isArray(parsed.weeklyPlan)) {
      return jsonResponse(
        {
          error: "The AI response could not be parsed as valid JSON. Please try again.",
          raw: content,
        },
        502
      );
    }

    return jsonResponse({
      summary: parsed.summary || "",
      weaknessAnalysis: parsed.weaknessAnalysis || [],
      weeklyPlan: parsed.weeklyPlan || [],
      dailyRoutine: parsed.dailyRoutine || null,
      resources: parsed.resources || [],
      milestones: parsed.milestones || [],
      recommendations: parsed.recommendations || [],
    });
  } catch (error) {
    return handleError(
      error,
      "An error occurred while generating the personalized study plan"
    );
  }
}

// ---------------------------------------------------------------------------
// Vocabulary (AI-объяснение IELTS-лексики)
// ---------------------------------------------------------------------------

/**
 * Строит системный промпт для объяснения слова/фразы в IELTS-контексте.
 * Требует строгий JSON-ответ, чтобы клиент мог распарсить его напрямую.
 */
function buildVocabularySystemPrompt() {
  return `You are an expert IELTS vocabulary tutor. You explain words and phrases in a way that helps IELTS candidates use them accurately in Writing and Speaking.

You MUST respond with ONLY a valid JSON object. Do not include any markdown, code fences, explanations, or text outside the JSON. The JSON must be parseable with JSON.parse().

The JSON structure must be exactly:

{
  "word": "the original word or phrase",
  "definition": "clear definition in English",
  "translation": "translation into Russian",
  "partOfSpeech": "part of speech (e.g. noun, verb, adjective, phrase)",
  "pronunciation": "phonetic transcription",
  "example": "an example sentence using the word in an IELTS context (Writing or Speaking)",
  "synonyms": ["synonym 1", "synonym 2", "synonym 3"],
  "collocations": ["collocation 1", "collocation 2", "collocation 3"],
  "bandLevel": "IELTS band level, e.g. Band 7+"
}

Rules:
- "word" must exactly match the word or phrase the user provided.
- "definition" must be a clear, concise definition in English.
- "translation" must be an accurate translation into Russian.
- "example" must demonstrate natural, high-level usage in a realistic IELTS Writing or Speaking context.
- "synonyms" and "collocations" must each be arrays of 3-5 relevant items.
- "bandLevel" should indicate the approximate IELTS band level at which this word is expected (e.g. "Band 6", "Band 7+", "Band 8+").`;
}

/**
 * Строит пользовательский промпт с запрашиваемым словом/фразой.
 */
function buildVocabularyUserPrompt(word) {
  return `Please explain the following IELTS vocabulary item:

Word/Phrase: ${word}

Return ONLY the JSON object described in the system prompt. Do not wrap it in markdown code fences.`;
}

export async function handleVocabulary(req) {
  try {
    const { word } = await req.json();

    if (!word || typeof word !== "string" || word.trim().length === 0) {
      return jsonResponse(
        { error: "Please provide a word or phrase to explain." },
        400
      );
    }

    const content = await chatCompletion(
      [
        { role: "system", content: buildVocabularySystemPrompt() },
        {
          role: "user",
          content: buildVocabularyUserPrompt(word.trim()),
        },
      ],
      { max_tokens: 800, temperature: 0.4 }
    );

    const parsed = extractJson(content);

    if (!parsed || !parsed.word || !parsed.definition) {
      return jsonResponse(
        {
          error: "The AI response could not be parsed as valid JSON. Please try again.",
          raw: content,
        },
        502
      );
    }

    return jsonResponse({
      word: parsed.word || word.trim(),
      definition: parsed.definition || "",
      translation: parsed.translation || "",
      partOfSpeech: parsed.partOfSpeech || "",
      pronunciation: parsed.pronunciation || "",
      example: parsed.example || "",
      synonyms: parsed.synonyms || [],
      collocations: parsed.collocations || [],
      bandLevel: parsed.bandLevel || "",
    });
  } catch (error) {
    return handleError(error, "An error occurred while explaining the word");
  }
}

// ---------------------------------------------------------------------------
// AI Chat Assistant (IELTS)
// ---------------------------------------------------------------------------

function buildChatAssistantSystemPrompt(context) {
  let contextBlock = "";
  if (context && Object.keys(context).length > 0) {
    contextBlock = `
The user has just completed an IELTS test. Here is their result context you can reference when answering:
${JSON.stringify(context, null, 2)}
`;
  }

  return `You are "IELTS Coach", a friendly and knowledgeable IELTS assistant built into the app. You help users prepare for the IELTS exam.

Your responsibilities:
- Answer questions about all four IELTS sections: Listening, Reading, Writing and Speaking.
- Explain grammar, vocabulary, essay structure and common mistakes.
- Give practical tips, band-score advice and study strategies.
- Explain IELTS scoring rules (band 0-9, rounding to nearest 0.5).
- When the user shares a piece of writing or a speaking answer, give constructive feedback with a suggested band score.
- Keep answers clear, structured and concise. Use short paragraphs and bullet points where helpful.
- Always be encouraging and supportive.

${contextBlock}
Respond in the same language the user writes in (English, Russian, Chinese, etc.).`;
}

export async function handleChatAssistant(req) {
  try {
    const { messages, context } = await req.json();

    if (
      !messages ||
      !Array.isArray(messages) ||
      messages.length === 0 ||
      !messages[messages.length - 1]?.content
    ) {
      return jsonResponse(
        { error: "Please provide a message to send to the assistant." },
        400
      );
    }

    const history = messages
      .filter((m) => m && typeof m.content === "string")
      .slice(-20)
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

    const content = await chatCompletion(
      [
        { role: "system", content: buildChatAssistantSystemPrompt(context) },
        ...history,
      ],
      { max_tokens: 1200, temperature: 0.6 }
    );

    return jsonResponse({ result: content });
  } catch (error) {
    return handleError(error, "An error occurred while talking to the assistant");
  }
}

// ---------------------------------------------------------------------------
// Error Analysis (AI-разбор ошибок после теста)
// ---------------------------------------------------------------------------

/**
 * Строит системный промпт для детального разбора ошибок по секциям теста.
 * Требует строгий JSON-ответ, чтобы клиент мог распарсить его напрямую.
 */
function buildErrorAnalysisSystemPrompt() {
  return `You are an expert IELTS examiner and tutor. You analyze a student's answers question by question, explain every mistake, and give personalized recommendations for improvement.

You MUST respond with ONLY a valid JSON object. Do not include any markdown, code fences, explanations, or text outside the JSON. The JSON must be parseable with JSON.parse().

The JSON structure must be exactly:

{
  "summary": "A 2-3 sentence overall summary of the student's performance and the most important thing to work on",
  "sections": [
    {
      "section": "Listening",
      "score": 6.5,
      "questionAnalysis": [
        {
          "question": "the question text or a short identifier",
          "questionType": "the question type (e.g. Multiple Choice, Gap Fill, True/False/Not Given)",
          "userAnswer": "the student's answer",
          "correctAnswer": "the correct answer (or 'N/A' if not determinable)",
          "isCorrect": true,
          "explanation": "clear explanation of why the answer was right or wrong, and what the student should learn from it"
        }
      ],
      "commonMistakes": ["mistake pattern 1", "mistake pattern 2"],
      "recommendations": ["specific actionable recommendation 1", "specific actionable recommendation 2"]
    }
  ],
  "overallRecommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"]
}

Rules:
- Include one entry in "sections" for each section provided by the user.
- In "questionAnalysis", analyze each question the student answered. For each, set "isCorrect" to true only if the answer is clearly correct; otherwise false.
- For incorrect answers, give a detailed, encouraging explanation of the mistake and how to avoid it next time.
- "commonMistakes" should identify recurring patterns across the section (e.g. "confusing similar-sounding words", "misreading the question").
- "recommendations" per section and "overallRecommendations" should be specific, practical, and tailored to the student's actual errors.
- Be supportive and constructive. Use the student's actual answers and the provided feedback to ground your analysis.`;
}

/**
 * Строит пользовательский промпт с ответами, вопросами и фидбеком по секциям.
 */
function buildErrorAnalysisUserPrompt({ sections, overallScore, testType }) {
  const sectionsBlock = (sections || [])
    .map((s) => {
      return `
Section: ${s.section}
Score: ${s.score ?? "N/A"}
Questions: ${JSON.stringify(s.questions ?? [])}
Answers: ${JSON.stringify(s.answers ?? {})}
AI Feedback: ${s.feedback ?? "No feedback provided"}
`;
    })
    .join("\n");

  return `Please analyze the following IELTS test answers and provide a detailed, question-by-question error analysis.

Test type: ${testType ?? "Not specified"}
Overall score: ${overallScore ?? "Not specified"}

${sectionsBlock}

Return ONLY the JSON object described in the system prompt. Do not wrap it in markdown code fences.`;
}

export async function handleErrorAnalysis(req) {
  try {
    const { sections, overallScore, testType } = await req.json();

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return jsonResponse(
        { error: "Please provide at least one test section to analyze." },
        400
      );
    }

    const content = await chatCompletion(
      [
        { role: "system", content: buildErrorAnalysisSystemPrompt() },
        {
          role: "user",
          content: buildErrorAnalysisUserPrompt({ sections, overallScore, testType }),
        },
      ],
      { max_tokens: 3000, temperature: 0.4 }
    );

    const parsed = extractJson(content);

    if (!parsed || !Array.isArray(parsed.sections)) {
      return jsonResponse(
        {
          error: "The AI response could not be parsed as valid JSON. Please try again.",
          raw: content,
        },
        502
      );
    }

    return jsonResponse({
      summary: parsed.summary || "",
      sections: parsed.sections || [],
      overallRecommendations: parsed.overallRecommendations || [],
    });
  } catch (error) {
    return handleError(error, "An error occurred while analyzing the test errors");
  }
}

// ---------------------------------------------------------------------------
// Speaking Tutor (AI-репетитор по speaking)
// ---------------------------------------------------------------------------

/**
 * Строит системный промпт для AI-репетитора по speaking.
 * В режиме "practice" AI ведёт диалог как IELTS-экзаменатор.
 * В режиме "feedback" AI оценивает ответы по критериям IELTS.
 */
function buildSpeakingTutorSystemPrompt({ part, topic, mode }) {
  const partDesc = {
    1: "Part 1: short questions about familiar topics (work, study, home, hobbies, etc.). Ask a few simple questions one at a time and wait for the student to answer each one.",
    2: "Part 2: the student must speak for 1-2 minutes on a given topic (cue card). Give the cue card topic, then let the student speak. After they finish, ask 1-2 follow-up questions.",
    3: "Part 3: abstract discussion questions related to the Part 2 topic. Ask deeper, more analytical questions and engage in discussion.",
  }[part] || "Part 1: short questions about familiar topics.";

  if (mode === "feedback") {
    return `You are an expert IELTS Speaking examiner. Evaluate the student's speaking performance based on the conversation below.

You MUST respond with ONLY a valid JSON object. Do not include any markdown, code fences, explanations, or text outside the JSON. The JSON must be parseable with JSON.parse().

The JSON structure must be exactly:

{
  "overallBand": 6.5,
  "criteria": [
    {
      "name": "Fluency and Coherence",
      "band": 6.5,
      "comment": "detailed comment on this criterion based on the student's actual answers"
    },
    {
      "name": "Lexical Resource",
      "band": 6.0,
      "comment": "detailed comment on vocabulary use"
    },
    {
      "name": "Grammatical Range and Accuracy",
      "band": 6.0,
      "comment": "detailed comment on grammar"
    },
    {
      "name": "Pronunciation",
      "band": 6.5,
      "comment": "detailed comment on pronunciation and clarity"
    }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "recommendations": ["specific actionable recommendation 1", "specific actionable recommendation 2", "specific actionable recommendation 3"]
}

Rules:
- Base your evaluation ONLY on the student's actual answers in the conversation.
- "overallBand" should be the average of the four criteria, rounded to the nearest 0.5.
- Be specific and reference actual phrases or patterns from the student's answers.
- Be encouraging but honest.`;
  }

  return `You are an expert IELTS Speaking tutor and examiner. You conduct a realistic IELTS Speaking practice session with a student.

${partDesc}

Topic (if provided): ${topic || "Not specified"}

Rules:
- Speak ONLY as the examiner/tutor. Do not write the student's answers.
- Ask ONE question at a time and wait for the student to answer before moving on.
- Keep your responses concise (1-3 sentences for questions).
- After the student answers, give brief positive encouragement, then ask the next question.
- If the student asks for help or clarification, help them briefly.
- At the end of the session the student may request feedback, so keep the conversation natural.
- Respond in English.`;
}

export async function handleSpeakingTutor(req) {
  try {
    const { messages, part = 1, topic, mode = "practice" } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return jsonResponse(
        { error: "Please provide a conversation to continue or evaluate." },
        400
      );
    }

    const history = messages
      .filter((m) => m && typeof m.content === "string")
      .slice(-30)
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

    const content = await chatCompletion(
      [
        {
          role: "system",
          content: buildSpeakingTutorSystemPrompt({ part, topic, mode }),
        },
        ...history,
      ],
      { max_tokens: mode === "feedback" ? 1500 : 800, temperature: 0.6 }
    );

    if (mode === "feedback") {
      const parsed = extractJson(content);
      if (!parsed || !Array.isArray(parsed.criteria)) {
        return jsonResponse(
          {
            error: "The AI response could not be parsed as valid JSON. Please try again.",
            raw: content,
          },
          502
        );
      }
      return jsonResponse({
        overallBand: parsed.overallBand ?? null,
        criteria: parsed.criteria || [],
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        recommendations: parsed.recommendations || [],
      });
    }

    return jsonResponse({ reply: content });
  } catch (error) {
    return handleError(error, "An error occurred while talking to the speaking tutor");
  }
}

// ---------------------------------------------------------------------------
// Writing Tutor (AI-репетитор по writing)
// ---------------------------------------------------------------------------

/**
 * Строит системный промпт для AI-репетитора по writing.
 * В режиме "practice" AI ведёт диалог, помогая улучшить эссе шаг за шагом.
 * В режиме "feedback" AI оценивает эссе по критериям IELTS Writing.
 */
function buildWritingTutorSystemPrompt({ taskType, mode }) {
  if (mode === "feedback") {
    return `You are an expert IELTS Writing examiner. Evaluate the student's essay using the official IELTS Writing assessment criteria and provide detailed, constructive feedback.

You MUST respond with ONLY a valid JSON object. Do not include any markdown, code fences, explanations, or text outside the JSON. The JSON must be parseable with JSON.parse().

The JSON structure must be exactly:

{
  "overallBand": 6.5,
  "overallScore": 65,
  "criteria": [
    {
      "name": "Task Achievement",
      "band": 6.5,
      "score": 65,
      "comment": "detailed comment on how well the essay addresses the task and develops a position"
    },
    {
      "name": "Coherence and Cohesion",
      "band": 6.5,
      "score": 65,
      "comment": "detailed comment on paragraphing, logical organization, and linking of ideas"
    },
    {
      "name": "Lexical Resource",
      "band": 6.5,
      "score": 65,
      "comment": "detailed comment on vocabulary range, precision, and collocation"
    },
    {
      "name": "Grammatical Range and Accuracy",
      "band": 6.5,
      "score": 65,
      "comment": "detailed comment on grammatical range and accuracy"
    }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "recommendations": ["specific actionable recommendation 1", "specific actionable recommendation 2", "specific actionable recommendation 3"],
  "correctedExcerpt": "a short rewritten/improved version of a key paragraph or sentence demonstrating better writing"
}

Rules:
- "overallBand" is the overall IELTS band (0-9, half bands allowed like 6.5).
- "overallScore" is the overall score out of 100.
- Each criterion must have a "band" (0-9, half bands allowed), a "score" (0-100), and a detailed "comment".
- "strengths", "weaknesses", and "recommendations" must each be arrays of 3-5 specific, actionable items.
- "correctedExcerpt" should show a concrete improved version of a real part of the essay.
- Be fair, specific, and encouraging. Reference actual parts of the essay in your comments.`;
  }

  return `You are an expert IELTS Writing tutor and examiner. You help a student improve their IELTS Writing essays through a guided, step-by-step conversation.

Task type (if provided): ${taskType || "Not specified"}

Rules:
- Act as a supportive writing coach. Help the student improve their essay step by step.
- When the student shares an essay or a draft, give focused, actionable feedback on structure, task response, vocabulary, and grammar.
- Ask ONE guiding question at a time to help the student improve (e.g., "How could you make your thesis statement clearer?", "Can you add a topic sentence to this paragraph?").
- Praise what the student does well, then suggest one concrete improvement.
- Keep responses concise and focused (2-5 sentences).
- If the student asks for help with a specific part (introduction, conclusion, linking words, etc.), help them with that part.
- At the end the student may request a full IELTS-style evaluation, so keep the conversation natural.
- Respond in English.`;
}

export async function handleWritingTutor(req) {
  try {
    const { messages, essay, taskType, mode = "practice" } = await req.json();

    if (mode === "feedback") {
      if (!essay || typeof essay !== "string" || essay.trim().length < 20) {
        return jsonResponse(
          { error: "Please provide a valid essay of at least 20 characters." },
          400
        );
      }

      const content = await chatCompletion(
        [
          {
            role: "system",
            content: buildWritingTutorSystemPrompt({ taskType, mode }),
          },
          {
            role: "user",
            content: `Please evaluate the following IELTS Writing essay and provide detailed feedback according to the official IELTS Writing assessment criteria.\n\nTask type: ${taskType || "Not specified"}\n\nEssay:\n${essay}`,
          },
        ],
        { max_tokens: 2500, temperature: 0.4 }
      );

      const parsed = extractJson(content);
      if (
        !parsed ||
        !Array.isArray(parsed.criteria) ||
        parsed.criteria.length === 0
      ) {
        return jsonResponse(
          {
            error: "The AI response could not be parsed as valid JSON. Please try again.",
            raw: content,
          },
          502
        );
      }

      return jsonResponse({
        overallBand: parsed.overallBand ?? null,
        overallScore: parsed.overallScore ?? null,
        criteria: parsed.criteria,
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        recommendations: parsed.recommendations || [],
        correctedExcerpt: parsed.correctedExcerpt || "",
      });
    }

    // practice mode
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return jsonResponse(
        { error: "Please provide a conversation to continue." },
        400
      );
    }

    const history = messages
      .filter((m) => m && typeof m.content === "string")
      .slice(-30)
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

    const content = await chatCompletion(
      [
        {
          role: "system",
          content: buildWritingTutorSystemPrompt({ taskType, mode }),
        },
        ...history,
      ],
      { max_tokens: 800, temperature: 0.6 }
    );

    return jsonResponse({ reply: content });
  } catch (error) {
    return handleError(error, "An error occurred while talking to the writing tutor");
  }
}

// ---------------------------------------------------------------------------
// Reading & Listening Tutor (AI-репетитор по чтению и аудированию)
// ---------------------------------------------------------------------------

/**
 * Строит системный промпт для AI-репетитора по чтению и аудированию.
 * В режиме "analyze" AI разбирает вопросы по одному и объясняет ошибки.
 * В режиме "practice" AI ведёт диалог, помогая понять материал и стратегии.
 */
function buildReadingListeningSystemPrompt({ mode, skill }) {
  const skillLabel = skill === "listening" ? "IELTS Listening" : "IELTS Reading";

  if (mode === "analyze") {
    return `You are an expert ${skillLabel} tutor and examiner. You analyze the student's answers question by question, explain every mistake, and give personalized strategies for improvement.

You MUST respond with ONLY a valid JSON object. Do not include any markdown, code fences, explanations, or text outside the JSON. The JSON must be parseable with JSON.parse().

The JSON structure must be exactly:

{
  "summary": "A 2-3 sentence overall summary of the student's performance and the most important skill to work on",
  "questionAnalysis": [
    {
      "question": "the question text or a short identifier",
      "questionType": "the question type (e.g. Multiple Choice, Gap Fill, True/False/Not Given, Matching Headings)",
      "userAnswer": "the student's answer",
      "correctAnswer": "the correct answer (or 'N/A' if not determinable)",
      "isCorrect": true,
      "explanation": "clear explanation of why the answer was right or wrong, and what the student should learn from it"
    }
  ],
  "commonMistakes": ["mistake pattern 1", "mistake pattern 2"],
  "strategies": ["specific strategy 1", "specific strategy 2", "specific strategy 3"],
  "recommendations": ["specific actionable recommendation 1", "specific actionable recommendation 2"]
}

Rules:
- Analyze each question the student provided. For each, set "isCorrect" to true only if the answer is clearly correct; otherwise false.
- For incorrect answers, give a detailed, encouraging explanation of the mistake and how to avoid it next time.
- "commonMistakes" should identify recurring patterns (e.g. "confusing similar-sounding words in listening", "misreading the question", "not scanning for keywords").
- "strategies" should give practical ${skillLabel} test-taking strategies (e.g. skimming, scanning, keyword matching, predicting answers).
- "recommendations" should be specific, practical, and tailored to the student's actual errors.
- Be supportive and constructive. Use the student's actual answers to ground your analysis.`;
  }

  return `You are an expert ${skillLabel} tutor. You help a student understand ${skill === "listening" ? "listening passages and audio-based questions" : "reading passages and reading questions"} and improve their test-taking skills.

Rules:
- Act as a supportive coach. Help the student understand the passage/transcript, questions, and correct answers.
- Explain vocabulary, paraphrasing, and question types clearly.
- Give practical strategies for ${skillLabel} (skimming, scanning, keyword matching, predicting, time management).
- Answer the student's questions about specific questions or passages in detail.
- Keep responses clear and well-structured (2-6 sentences, use bullet points when helpful).
- Be encouraging and specific.
- Respond in English.`;
}

export async function handleReadingListeningTutor(req) {
  try {
    const { mode = "analyze", skill = "reading", passage, questions, messages } = await req.json();

    if (mode === "analyze") {
      if (!passage || typeof passage !== "string" || passage.trim().length < 10) {
        return jsonResponse(
          { error: "Please provide the passage or transcript to analyze." },
          400
        );
      }
      if (!questions || typeof questions !== "string" || questions.trim().length < 5) {
        return jsonResponse(
          { error: "Please provide the questions and your answers to analyze." },
          400
        );
      }

      const content = await chatCompletion(
        [
          {
            role: "system",
            content: buildReadingListeningSystemPrompt({ mode, skill }),
          },
          {
            role: "user",
            content: `Please analyze the following ${skill === "listening" ? "IELTS Listening" : "IELTS Reading"} exercise and provide a detailed, question-by-question analysis.\n\nPassage / Transcript:\n${passage}\n\nQuestions and my answers:\n${questions}`,
          },
        ],
        { max_tokens: 2500, temperature: 0.4 }
      );

      const parsed = extractJson(content);
      if (!parsed || !Array.isArray(parsed.questionAnalysis)) {
        return jsonResponse(
          {
            error: "The AI response could not be parsed as valid JSON. Please try again.",
            raw: content,
          },
          502
        );
      }

      return jsonResponse({
        summary: parsed.summary || "",
        questionAnalysis: parsed.questionAnalysis || [],
        commonMistakes: parsed.commonMistakes || [],
        strategies: parsed.strategies || [],
        recommendations: parsed.recommendations || [],
      });
    }

    // practice mode
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return jsonResponse(
        { error: "Please provide a conversation to continue." },
        400
      );
    }

    const history = messages
      .filter((m) => m && typeof m.content === "string")
      .slice(-30)
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

    const content = await chatCompletion(
      [
        {
          role: "system",
          content: buildReadingListeningSystemPrompt({ mode, skill }),
        },
        ...history,
      ],
      { max_tokens: 800, temperature: 0.6 }
    );

    return jsonResponse({ reply: content });
  } catch (error) {
    return handleError(error, "An error occurred while talking to the reading/listening tutor");
  }
}
