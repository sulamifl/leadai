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

      Recommend 5 universities that would be suitable for this student. Include the university name, location (city and country), a detailed explanation of why it's recommended, the percentage chance of admission, a link to the university's official website, and ratings for various criteria (academic reputation, employer reputation, faculty/student ratio, citations per faculty, international faculty ratio, international student ratio). Provide the response in ${userData.native_language || 'English'}.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from OpenAI API');
    }

    const responseData = await response.json();
    return new Response(JSON.stringify({ recommendations: responseData.choices[0].message.content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while getting recommendations' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}