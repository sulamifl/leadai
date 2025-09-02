import fetch from 'node-fetch';

export async function POST(req) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not defined' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const userData = await req.json();
    const systemMessage = `You are an expert programming instructor. Provide detailed learning plans, theory, practical tasks, and answer questions about programming topics. Tailor your responses to the user's selected programming topic and learning duration. When appropriate, provide tests and conduct mini-interviews to assess the user's progress. Always remember the context of the conversation and the user's progress. If the user submits code or answers, evaluate them and provide feedback.

Current learning state:
Topic: ${userData.selectedTopic}
Duration: ${userData.selectedDuration ? `${userData.selectedDuration.name} (${userData.selectedDuration.time})` : 'Not specified'}
Current Day: ${userData.currentDay || 'Not started'}
Current Module: ${userData.currentModule || 'Not started'}

Provide appropriate response based on this context.`;

    const userMessage = userData.userMessage;

    // Создаем массив сообщений для отправки в API
    const apiMessages = [
      { role: 'system', content: systemMessage },
      ...userData.messages, // Добавляем всю историю сообщений
      { role: 'user', content: userMessage }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: apiMessages,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from OpenAI API');
    }

    const responseData = await response.json();
    const content = responseData.choices[0].message.content;

    // Логика для определения следующих шагов
    const nextDay = content.toLowerCase().includes('переходим к следующему дню');
    const nextModule = content.toLowerCase().includes('переходим к следующему модулю');
    const isTest = content.toLowerCase().includes('тест:');
    const isInterview = content.toLowerCase().includes('интервью:');

    return new Response(JSON.stringify({ 
      content, 
      nextDay, 
      nextModule, 
      isTest, 
      isInterview 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching response:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while getting a response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}