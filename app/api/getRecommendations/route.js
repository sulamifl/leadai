import { chatCompletion } from "@/lib/deepseek";

export async function POST(req) {
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

    return new Response(JSON.stringify({ recommendations }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while getting recommendations" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
