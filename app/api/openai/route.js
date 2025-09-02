import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const { prompt, task } = await req.json();

  try {
    let response;
    if (task === 'analyze') {
      response = await analyzeEssay(prompt);
    } else if (task === 'generate') {
      response = await generateTopic();
    } else {
      return new Response(JSON.stringify({ error: 'Invalid task' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ result: response }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return new Response(JSON.stringify({ error: 'Error processing your request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function analyzeEssay(essay) {
  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: "You are a helpful assistant that analyzes essays. Provide your analysis in a structured format with a score out of 100, detailed feedback, and recommendations for improvement." },
      { role: "user", content: `Please analyze the following essay and provide a score out of 100, detailed feedback, and recommendations for improvement:\n\n${essay}` }
    ],
  });
  return completion.choices[0].message.content;
}

async function generateTopic() {
  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: "You are a helpful assistant that generates essay topics." },
      { role: "user", content: "Generate an interesting and challenging essay topic." }
    ],
  });
  return completion.choices[0].message.content;
}