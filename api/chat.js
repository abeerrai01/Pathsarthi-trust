import { OpenAI } from "openai";

export default async function handler(req, res) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const hfToken = process.env.HF_TOKEN;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Helper to strip <think> tags but preserve [NAVIGATE] commands
  const processAIResponse = (text) => {
    if (!text) return "";
    
    // 1. Extract any [NAVIGATE] tag from the entire text (including thinking blocks)
    const navMatch = text.match(/\[NAVIGATE:\s*([^\]]+)\]/i);
    const navCommand = navMatch ? navMatch[0] : null;
    
    // 2. Remove the thinking blocks
    let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    
    // 3. Ensure the [NAVIGATE] command is in the final output if it was found anywhere
    if (navCommand && !cleaned.includes(navCommand)) {
      cleaned = `${navCommand}\n\n${cleaned}`;
    }
    
    return cleaned;
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
          // Clean/process Gemini response
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            data.candidates[0].content.parts[0].text = processAIResponse(data.candidates[0].content.parts[0].text);
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

      const messages = req.body.contents.map(item => ({
        role: item.role === 'model' ? 'assistant' : 'user',
        content: item.parts[0].text
      }));

      const chatCompletion = await openai.chat.completions.create({
        model: "deepseek-ai/DeepSeek-V3", // Switched to V3 for much lower latency
        messages: messages,
        max_tokens: 1000
      });

      // Process response to handle navigate tags and thinking blocks
      const aiText = processAIResponse(chatCompletion.choices[0].message.content);

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
