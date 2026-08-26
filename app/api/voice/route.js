import { chatCompletion } from "@/lib/deepseek";

export async function POST(req) {
  const { text, task } = await req.json();
  try {
    let response;
    if (task === "analyze") {
      response = await analyzeSpeech(text);
    } else if (task === "generate") {
      response = await generateTopic();
    } else {
      return new Response(JSON.stringify({ error: "Invalid task" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ result: response }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("DeepSeek API error:", error);
    return new Response(JSON.stringify({ error: "Error processing your request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

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
  const cleanedContent = content.replace(/(?:Overall|Score):\s*\d+(?:\s*\/\s*100)?/gi, "").trim();
  const paragraphs = cleanedContent.split("\n\n");

  // Reconstruct the response with clear paragraph breaks and a distinct score line
  return [`Score: ${score} out of 100`, ...paragraphs.map((p) => p.trim())].join("\n\n");
}

async function generateTopic() {
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
