import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SARTHI_SYSTEM_PROMPT = `
You are Sarthi, the official AI assistant for Path Sarthi Trust. 
Your goal is to help visitors understand the trust's mission, projects, and how they can contribute.

Key Information about Path Sarthi Trust:
- Based in: Moradabad, Uttar Pradesh, India.
- Established: 2022.
- Motto: 'Hope • Heal • Humanity'.
- Main Mission: To enhance the quality of life in education and health through collaboration with individuals and communities.
- Impact: 1000+ lives impacted, 70+ active donors, 52+ volunteers.
- Core Initiatives:
  1. Education that Empowers: Notebooks, school bags, and enrollment support for children in slums/villages.
  2. Health with Dignity: Medical aid drives, corrective surgeries, and mobility aids (wheelchairs, crutches).
  3. Caring for the Forgotten: monthly ration kits and meals for seniors.
  4. Empowering Communities: Skill-building and awareness campaigns.
- Registry: Registered with Niti Aayog Darpan (ID: UP/2022/0317438), Registration No. 68/2022 (Indian Trust Act 1882).
- Key Campaign: 'एक किताब, एक भविष्य' (One Book, One Future) - providing books to children in slums.
- Board Members: Shri Ravi Prakash Rai (President), Shri Rupesh Kumar Chauhan (VP), Shri Om Prakash Rai (Treasurer), Shri Arun Kumar Singh (Secretary), Shri Satya Prakash Rai (Financial Advisor), Shri Priyansh Rai (Vice Secretary), Shri Abeer Rai (Board Member).

Your Tone:
- Helpful, polite, and compassionate.
- Energetic about social change.
- Concise but informative.
- Use 'Namaste' as a greeting occasionally.

Instructions:
- If asked about donations, guide them to the 'Donate' page.
- If asked about joining, mention the 'Join Us' or 'Internship' pages.
- Always identify as Sarthi.
- If you don't know an answer, politely ask them to use the 'Contact Us' information in the footer.
`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Namaste! I am Sarthi. How can I help you today with Path Sarthi Trust?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: SARTHI_SYSTEM_PROMPT }] },
            ...messages.map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })),
            { role: 'user', parts: [{ text: input }] }
          ]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'API Error');
      }

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = 'I apologize, but I am having trouble connecting. Please try again in a moment.';
      
      if (error.message.includes('API_KEY_INVALID')) {
        errorMessage = 'I am currently undergoing maintenance (API Key Issue). Please contact the administrator.';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-indigo-100"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md relative overflow-hidden">
              {/* Gold/Yellow accent bar at bottom of header */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400"></div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-xl text-indigo-600 shadow-inner">
                  S
                </div>
                <div>
                  <h3 className="font-bold text-white tracking-wide">SARTHI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-[10px] text-indigo-100 uppercase font-semibold">Online</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
              style={{ backgroundImage: 'radial-gradient(circle at center, #f8fafc 0%, #f1f5f9 100%)' }}
            >
              {/* Mascot Animation */}
              <div className="flex justify-center mb-2 overflow-hidden rounded-xl">
                <div className="scale-75 origin-top">
                  <iframe 
                    src="https://assets.pinterest.com/ext/embed.html?id=703756188059993" 
                    height="295" 
                    width="345" 
                    frameBorder="0" 
                    scrolling="no"
                    title="Sarthi Mascot"
                    className="rounded-xl shadow-inner bg-white"
                  ></iframe>
                </div>
              </div>

              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-indigo-100 rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl text-sm shadow-sm border border-indigo-50 flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Sarthi anything..."
                  className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all border border-gray-100"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100 active:scale-95"
                >
                  <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3 font-medium">
                Sarthi is an AI assistant. Please verify important details.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-indigo-200 border-4 border-white overflow-hidden group"
      >
        {isOpen ? (
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <div className="relative flex flex-col items-center">
             <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-[8px] font-bold mt-0.5 uppercase tracking-tighter">SARTHI</span>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-500 border-2 border-white"></span>
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default Chatbot;
