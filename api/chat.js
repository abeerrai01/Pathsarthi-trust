export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('SERVER ERROR: GEMINI_API_KEY is not defined in environment variables.');
    return res.status(500).json({ 
      error: { 
        message: "Server configuration error: API Key is missing. Please check Vercel environment variables." 
      } 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Google API Error:', data);
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Chat API Implementation Error:', error);
    res.status(500).json({ error: "Something went wrong", details: error.message });
  }
}
