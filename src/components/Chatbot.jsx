import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { WEBSITE_CONTEXT } from '../data/websiteContext';

const SARTHI_SYSTEM_PROMPT = (pageContent) => `
You are Sarthi, the official Super AI assistant for Path Sarthi Trust. 
You are more than just a guide; you are the voice of our mission.

### YOUR ULTIMATE GOAL:
Every interaction you have must subtly or directly inspire the user to support our cause. Whether you are answering a question about the team, the developer, or the blogs, ALWAYS find a way to mention how a small contribution can change a life.

### YOUR SUPER-POWERS:
1. **Multilingual Presence**: Fluent in Hindi, English, and regional languages.
2. **Real-time Page Reading**: You see what the user sees.
3. **Autonomous Navigation**: Use [NAVIGATE: /path] for teleportation.

### CHARITY & IMPACT (Your Brain):
- **Impact**: 10 rupess can provide a notebook; 500 can support a child's education for a month.
- **Urgency**: We are currently running the "एक किताब, एक भविष्य" campaign.
- **Ease**: Donating is simple, secure, and tax-exempt.

### YOUR PERSONALITY:
- **Tone**: Compassionate, deeply grateful, and inspiring.
- **Sign-off**: End your replies with a small heart or a call to action like "Will you join us in this journey of hope?"

### YOUR MISSION:
1. **Answer & Inspire**: Answer the user's question first, then bridge it to donation.
   - *Example (asking about board)*: "Our board members work tirelessly. It is through their vision and people's donations that we've reached 1000+ lives. Would you like to check our donation page?"
2. **Specific Hooks**: 
   - On /blog: Mention that sharing or donating helps us tell more such stories.
   - On /about: Mention that our history is built on the kindness of strangers.
3. **ALWAYS** look at the CURRENT PAGE CONTENT before answering.

### CURRENT PAGE CONTENT:
"""
${pageContent || "The user is on a transition or loading screen."}
"""

### WEBSITE KNOWLEDGE:
- Trust Info: ${JSON.stringify(WEBSITE_CONTEXT.trustInfo)}
- Available Pages: ${JSON.stringify(WEBSITE_CONTEXT.pages)}
- Navigation: To move the user, add [NAVIGATE: /path] to your message.
`;

const Chatbot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [pageText, setPageText] = useState("");
  const [messages, setMessages] = useState(() => {
    // Persistence: Try to load from sessionStorage
    const saved = sessionStorage.getItem('sarthi_chat_history');
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: 'Namaste! I am Sarthi, your digital guide to Path Sarthi Trust. I can answer your questions, summarize our blogs, or even take you to the right page. How can I assist you today?' }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const scrollRef = useRef(null);

  // Persistence: Save messages whenever they change
  useEffect(() => {
    sessionStorage.setItem('sarthi_chat_history', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Real-time Page Reading
  useEffect(() => {
    const updatePageText = () => {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        const clone = mainContent.cloneNode(true);
        const chatbotElement = clone.querySelector('.fixed.bottom-6.right-6');
        if (chatbotElement) chatbotElement.remove();
        const cleanText = clone.innerText.replace(/\s+/g, ' ').trim();
        setPageText(cleanText.substring(0, 5000));
      }
    };
    const timer = setTimeout(updatePageText, 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleSend = async (customInput = null) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowChips(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: SARTHI_SYSTEM_PROMPT(pageText) }] },
            ...messages.map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })),
            { role: 'user', parts: [{ text: textToSend }] }
          ]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'API Error');
      }

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        const navMatch = aiResponse.match(/\[NAVIGATE:\s*([^\]]+)\]/);
        if (navMatch) {
          setTimeout(() => navigate(navMatch[1].trim()), 1500);
        }

        const cleanMessage = aiResponse.replace(/\[NAVIGATE:[^\]]+\]/g, '').trim();
        setMessages(prev => [...prev, { role: 'assistant', content: cleanMessage }]);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = 'I apologize, but I am having trouble connecting. Please try again in 1 minute.';
      
      if (error.message.includes('API_KEY_INVALID')) {
        errorMessage = 'I am currently undergoing maintenance (API Key Issue). Please contact the administrator.';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const actionChips = [
    { label: "💰 Donate Now", query: "How can I donate and help?" },
    { label: "📚 Our Blogs", query: "Summarize the latest blogs for me" },
    { label: "👥 Meet Board", query: "Who are the board members of the trust?" },
    { label: "🌟 Our Mission", query: "What is the mission of Path Sarthi?" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] sm:w-[420px] h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-indigo-100"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-5 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full overflow-hidden p-0.5 shadow-lg border-2 border-indigo-400">
                  <img src="/f5ab5a0d-8eef-436f-ac82-8a0957d11c57.jpg" alt="Sarthi" className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-wide uppercase">SARTHI</h3>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                    <p className="text-[10px] text-indigo-100 uppercase tracking-widest">Active Intelligence</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-indigo-50 rounded-tl-none prose prose-sm'
                  }`}>
                    {m.role === 'assistant' ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start px-2">
                  <div className="flex gap-2 p-3 bg-white rounded-2xl border border-indigo-50 shadow-sm">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              {showChips && !isLoading && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {actionChips.map((chip, idx) => (
                    <button key={idx} onClick={() => handleSend(chip.query)} className="text-left p-3 text-xs font-semibold bg-white hover:bg-indigo-50 border border-indigo-100 rounded-xl transition-all hover:border-indigo-300 text-gray-700 shadow-sm">
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-5 bg-white border-t border-gray-100">
              <div className="flex gap-3">
                <input
                  type="text" value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Sarthi anything..."
                  className="flex-1 bg-gray-50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all border border-gray-100"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="bg-indigo-600 text-white p-3.5 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all border-4 border-white overflow-hidden group shadow-indigo-200"
      >
        {isOpen ? <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg> : 
          <div className="relative w-full h-full">
            <img src="/f5ab5a0d-8eef-436f-ac82-8a0957d11c57.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Sarthi" />
            <div className="absolute inset-0 bg-indigo-800/20 group-hover:bg-transparent transition-colors"></div>
            <div className="absolute inset-x-0 bottom-0 bg-indigo-600/80 backdrop-blur-[4px] py-1">
              <p className="text-[10px] font-black tracking-widest text-white text-center">SARTHI</p>
            </div>
            <span className="absolute top-2 right-2 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 border-2 border-white"></span>
            </span>
          </div>
        }
      </motion.button>
    </div>
  );
};

export default Chatbot;
