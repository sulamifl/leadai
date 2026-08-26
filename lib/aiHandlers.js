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
