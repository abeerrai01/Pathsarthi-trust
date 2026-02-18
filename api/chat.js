import { OpenAI } from "openai";

export default async function handler(req, res) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const hfToken = process.env.HF_TOKEN;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Helper to map Gemini parts to OpenAI messages
  const mapGeminiToOpenAI = (contents) => {
    return contents.map(item => ({
      role: item.role === 'model' ? 'assistant' : 'user',
      content: item.parts[0].text
    }));
  };

  // Helper to strip <think> tags from AI responses
  const cleanAIResponse = (text) => {
    if (!text) return "";
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  };

  try {
    // 1. ATTEMPT GEMINI FIRST
    if (geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Clean thinking blocks from Gemini as well (if any)
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            data.candidates[0].content.parts[0].text = cleanAIResponse(data.candidates[0].content.parts[0].text);
          }
          return res.status(200).json(data);
        }
        
        console.warn('Gemini API returned error, attempting fallback...');
      } catch (geminiError) {
        console.warn('Gemini Fetch Error, attempting fallback:', geminiError.message);
      }
    }

    // 2. FALLBACK TO DEEPSEEK VIA HUGGING FACE
    if (hfToken) {
      const openai = new OpenAI({
        baseURL: "https://router.huggingface.co/v1",
        apiKey: hfToken,
      });

      const messages = mapGeminiToOpenAI(req.body.contents);

      const chatCompletion = await openai.chat.completions.create({
        model: "deepseek-ai/DeepSeek-R1:together",
        messages: messages,
      });

      // Clean thinking blocks from DeepSeek-R1
      const aiText = cleanAIResponse(chatCompletion.choices[0].message.content);

      // Transform OpenAI response back to Gemini format for frontend compatibility
      return res.status(200).json({
        candidates: [
          {
            content: {
              parts: [{ text: aiText }]
            }
          }
        ]
      });
    }

    // 3. ERROR IF BOTH FAIL
    return res.status(500).json({ 
      error: "All AI services failed or are not configured properly.",
      details: "Check GEMINI_API_KEY and HF_TOKEN environment variables."
    });

  } catch (error) {
    console.error('Chat API Fatal Error:', error);
    res.status(500).json({ error: "Something went wrong", details: error.message });
  }
}
