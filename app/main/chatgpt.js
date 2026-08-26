import { chatCompletion } from "@/lib/deepseek";

export async function fetchResults(section, data, testType) {
  if (section === "ai_assistant") {
    return await fetchAIAssistantResponse(data.message, data.context);
  }

  const convertRawScore = (rawScore, section) => {
    const listeningTable = [
      [39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6],
      [18, 5.5], [16, 5], [13, 4.5], [10, 4], [7, 3.5], [5, 3], [3, 2.5], [1, 2], [0, 1]
    ];

    const readingAcademicTable = [
      [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6],
      [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [3, 2.5], [1, 2], [0, 1]
    ];

    const readingGeneralTable = [
      [40, 9], [39, 8.5], [37, 8], [36, 7.5], [34, 7], [32, 6.5], [30, 6],
      [27, 5.5], [23, 5], [19, 4.5], [15, 4], [12, 3.5], [9, 3], [6, 2.5], [3, 2], [0, 1]
    ];

    const table = section === "listening" ? listeningTable :
                  (testType === "academic" ? readingAcademicTable : readingGeneralTable);

    for (let [threshold, score] of table) {
      if (rawScore >= threshold) return score;
    }
    return 0;
  };

  const systemMessage = `You are an IELTS test evaluator. Provide detailed, informative, and personalized feedback and a score for the ${section} section. Use this scoring system:

Scoring system:
- Listening and Reading: Raw score out of 40, then converted to band score (0-9).
- Speaking and Writing: Direct band score (0-9).
- Overall score: Average of all four sections, rounded to nearest 0.5.

Conversion table for Listening and Reading:
39-40: 9.0 | 37-38: 8.5 | 35-36: 8.0 | 32-34: 7.5 | 30-31: 7.0
26-29: 6.5 | 23-25: 6.0 | 18-22: 5.5 | 16-17: 5.0 | 13-15: 4.5
10-12: 4.0 | 8-9: 3.5 | 6-7: 3.0 | 4-5: 2.5 | 2-3: 2.0 | 1: 1.0

For Speaking and Writing, use the IELTS 9-band scale criteria.

Instructions:
1. Analyze each answer carefully, highlighting specific mistakes and areas for improvement.
2. Provide detailed, personalized recommendations based on the user's performance in this section.
3. Include specific exercises or resources that would be most beneficial for this user.
4. ALWAYS provide practical materials tailored to the user's performance level.
5. For Listening and Reading:
   a. First, provide the raw score out of 40.
   b. Then, convert this to the band score using the conversion table.
   c. Present both scores clearly: "Raw Score: X/40, Band Score: Y.Y/9"
6. For Speaking and Writing, provide the band score directly.
7. At the end of your response, clearly state the final score for this section as follows:
   - For Listening and Reading: "Final Score: [Raw Score]/40 (Band Score: [Converted Score]/9)"
   - For Speaking and Writing: "Final Score: [Band Score]/9"

${section === "listening" || section === "reading"
  ? "Remember to provide both the raw score out of 40 and the converted band score out of 9."
  : "Provide a score out of 9 (can use 0.5 increments)."}

Examples of analysis:
- **Question Analysis**: Analyze each question, providing the user's answer, the correct answer, and detailed feedback.
- **Summary of Performance**: Summarize the raw score computation and provide the final converted band score.
- **Recommendations**: Provide tailored exercises or resources based on the user's performance.

Example Feedback Structure:
1. **Q1: [Question Text]**
   - Question Type: [Type]
   - Your Answer: [User's Answer]
   - Correct Answer: [Correct Answer]
   - Feedback: [Detailed feedback]

2. **Q2: [Question Text]**
   - Question Type: [Type]
   - Your Answer: [User's Answer]
   - Correct Answer: [Correct Answer]
   - Feedback: [Detailed feedback]

#### Summary of Performance:
- Raw Score Computation:
  - Total Questions: [Total]
  - Correct Answers: [Number]
  - Attempted but Incorrect: [Number]
  - Not Attempted: [Number]

- Raw Score: [Raw Score]/40
- Band Score: [Converted Score]/9

### Recommended Resources and Exercises:
1. **[Question Type]**: [Practice suggestion]
2. **[Question Type]**: [Practice suggestion]

**Final Score: [Final Score]**
`;

  const userMessage = `
    Section: ${section}
    Test Type: ${testType}
    ${section === "speaking"
      ? `Questions: ${JSON.stringify(data.questions)}\nAnswers: ${JSON.stringify(data.answers)}`
      : `Answers: ${JSON.stringify(data.answers)}`
    }
    ${section === "reading" || section === "listening" ? `Questions: ${JSON.stringify(data.questions)}` : ""}
    ${section === "writing" ? `Topics: ${JSON.stringify(data.topics)}` : ""}
  `;

  try {
    let content = await chatCompletion(
      [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      { max_tokens: 3000 }
    );

    const rawScoreMatch = content.match(/Score: (\d+(\.\d+)?)/);
    if (rawScoreMatch) {
      const rawScore = parseFloat(rawScoreMatch[1]);
      let convertedScore;
      if (section === "listening" || section === "reading") {
        convertedScore = convertRawScore(rawScore, section);
        content = content.replace(/Score: (\d+(\.\d+)?)/, `Raw Score: ${rawScore}/40\nConverted Score: ${convertedScore}/9`);
      } else {
        convertedScore = Math.min(Math.max(rawScore, 0), 9); // Ensure score is between 0 and 9
        content = content.replace(/Score: (\d+(\.\d+)?)/, `Score: ${convertedScore}/9`);
      }
    }

    return content;
  } catch (error) {
    console.error("Error fetching results:", error);
    throw error;
  }
}

export async function fetchListeningExamples(score) {
  const systemMessage = `You are an IELTS listening expert. You MUST generate 4 short listening passages (one for each part of the IELTS listening test) with corresponding questions despite the score the user scored. Each passage should be about 30-60 seconds long when spoken. Generate practical materials even if the user has not scored a single point.`;
  const userMessage = `You MUST generate 4 listening passages with questions for IELTS practice.`;

  try {
    return await chatCompletion(
      [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      { max_tokens: 3000 }
    );
  } catch (error) {
    console.error("Error fetching listening examples:", error);
    throw error;
  }
}

export async function fetchSpeakingExamples() {
  const systemMessage = `You are an IELTS speaking expert. You MUST generate 3 sets of speaking practice materials. Each set should include:
    1. A question for Part 1 (simple personal questions)
    2. A task for Part 2 (a longer speech on a given topic)
    3. A follow-up question for Part 3 (more abstract questions related to Part 2)
    For each part, also provide a sample answer.
    Generate practical materials even if the user has not scored a single point.`;
  const userMessage = `You MUST generate IELTS speaking practice materials.`;

  try {
    return await chatCompletion(
      [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      { max_tokens: 1000 }
    );
  } catch (error) {
    console.error("Error fetching speaking examples:", error);
    return null;
  }
}

export async function fetchReadingExamples(score) {
  const systemMessage = `You are an IELTS reading expert. You MUST generate a reading passage with questions suitable for a student with an IELTS reading score of ${score}. The passage should be about 300 words long, followed by 5 questions of various types (multiple choice, true/false/not given, matching, etc.). Generate practical materials even if the user has not scored a single point.`;
  const userMessage = `You MUST generate an IELTS reading practice passage with questions for a student with a score of ${score}.`;

  try {
    return await chatCompletion(
      [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      { max_tokens: 1000 }
    );
  } catch (error) {
    console.error("Error fetching reading examples:", error);
    return null;
  }
}

export async function fetchWritingExamples(score, topic) {
  const systemMessage = `You are an IELTS writing expert. You MUST generate an example essay based on the given topic. The essay should be written at a level suitable for a student with an IELTS writing score of ${score}. It should demonstrate good structure, coherence, grammar, and vocabulary usage. Generate practical materials even if the user has not scored a single point.`;
  const userMessage = `You MUST write an example essay for the following topic: ${topic}. The essay should be suitable for a student with an IELTS writing score of ${score}.`;

  try {
    return await chatCompletion(
      [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      { max_tokens: 1000 }
    );
  } catch (error) {
    console.error("Error fetching writing examples:", error);
    return null;
  }
}

export async function fetchUniversityRecommendations(overallScore) {
  const systemMessage = `You are a university admissions expert. Provide recommendations for universities based on the given IELTS score. Include a mix of universities from different countries and explain why each university might be a good fit. Make sure to include links to the university websites.`;
  const userMessage = `Based on an overall IELTS score of ${overallScore}, recommend 5 universities that would be suitable for the student. Include the university name, location, a brief explanation of why it's recommended, and a link to the university's official website.`;

  try {
    return await chatCompletion(
      [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      { max_tokens: 1000 }
    );
  } catch (error) {
    console.error("Error fetching university recommendations:", error);
    return null;
  }
}

export async function fetchAIAssistantResponse(message, context) {
  const systemMessage = `You are an AI friendly assistant named LeadAI helping a student understand their IELTS test results. 
    The student's scores and feedback are as follows:
    ${Object.entries(context).map(([section, data]) =>
      `${section.toUpperCase()}: Score ${data.score}/9
       Feedback: ${data.feedback}`
    ).join("\n")}
    Provide helpful and encouraging advice based on their scores, specific mistakes, and questions.`;

  try {
    return await chatCompletion(
      [
        { role: "system", content: systemMessage },
        { role: "user", content: message },
      ],
      { max_tokens: 1000 }
    );
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
