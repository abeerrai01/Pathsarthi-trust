import { OpenAI } from "openai";

export default async function handler(req, res) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const hfToken = process.env.HF_TOKEN;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

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

  const messages = req.body.contents.map(item => ({
    role: item.role === 'model' ? 'assistant' : 'user',
    content: item.parts[0].text
  }));

  try {
    // 1. ATTEMPT GEMINI FIRST (Direct)
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
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            data.candidates[0].content.parts[0].text = processAIResponse(data.candidates[0].content.parts[0].text);
          }
          return res.status(200).json(data);
        }
        console.warn('Gemini Direct API failed, trying Hugging Face...');
      } catch (e) {
        console.warn('Gemini Direct Error:', e.message);
      }
    }

    // 2. FALLBACK TO DEEPSEEK VIA HUGGING FACE
    if (hfToken) {
      try {
        const hfOpenai = new OpenAI({
          baseURL: "https://router.huggingface.co/v1",
          apiKey: hfToken,
        });

        const chatCompletion = await hfOpenai.chat.completions.create({
          model: "deepseek-ai/DeepSeek-V3",
          messages: messages,
          max_tokens: 1000
        });

        const aiText = processAIResponse(chatCompletion.choices[0].message.content);
        return res.status(200).json({
          candidates: [{ content: { parts: [{ text: aiText }] } }]
        });
      } catch (e) {
        console.warn('Hugging Face Fallback failed, trying OpenRouter...', e.message);
      }
    }

    // 3. FALLBACK TO OPENROUTER
    if (openRouterKey) {
      try {
        const orOpenai = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: openRouterKey,
          defaultHeaders: {
            "HTTP-Referer": "https://pathsarthi.org",
            "X-Title": "Path Sarthi Trust",
          }
        });

        const chatCompletion = await orOpenai.chat.completions.create({
          model: "google/gemini-2.0-flash-001", // Using Gemini via OpenRouter as 3rd tier
          messages: messages,
          max_tokens: 1000
        });

        const aiText = processAIResponse(chatCompletion.choices[0].message.content);
        return res.status(200).json({
          candidates: [{ content: { parts: [{ text: aiText }] } }]
        });
      } catch (e) {
        console.warn('OpenRouter Fallback failed:', e.message);
      }
    }

    // 4. FINAL ERROR IF ALL FAIL
    return res.status(500).json({ 
      error: "All AI services failed.",
      details: "Please verify GEMINI_API_KEY, HF_TOKEN, and OPENROUTER_API_KEY."
    });

  } catch (error) {
    console.error('Chat API Fatal Error:', error);
    res.status(500).json({ error: "Something went wrong", details: error.message });
  }
}
