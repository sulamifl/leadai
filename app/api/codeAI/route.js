import { chatCompletion } from "@/lib/deepseek";

export async function POST(req) {
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

    return new Response(
      JSON.stringify({ content, nextDay, nextModule, isTest, isInterview }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching response:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while getting a response" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
