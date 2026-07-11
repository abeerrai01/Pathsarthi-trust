import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { X, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QueryWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    // Automatically open the widget once per session
    const hasOpened = sessionStorage.getItem('queryWidgetOpened');
    if (!hasOpened) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('queryWidgetOpened', 'true');
      }, 3000); // Pops up after 3 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message) {
      alert("Please fill all required fields");
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, "queries"), {
        ...form,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setIsSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error submitting query:", error);
      alert("Failed to submit query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Query Popup Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl mb-4 w-[340px] max-w-[calc(100vw-3rem)] overflow-hidden pointer-events-auto border border-slate-100 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-4 text-white flex justify-between items-center shadow-md z-10 relative">
              <div className="flex items-center gap-2">
                <img src="/Computer Icons Symbol Question Mark PNG.jpg" alt="Query" className="w-8 h-8 rounded-full object-cover border-2 border-white/30" />
                <div>
                  <h3 className="font-bold text-lg leading-tight">Have a Query?</h3>
                  <p className="text-xs text-indigo-100">We usually reply within 24 hours</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors flex items-center justify-center"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50 relative">
              {isSubmitted ? (
                <div className="text-center py-8 px-2 flex flex-col items-center animate-in zoom-in duration-300">
                  <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4">
                    <CheckCircle size={40} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">Thank You!</h4>
                  <p className="text-sm text-slate-600">
                    Your query has been successfully submitted. Our team will get back to you shortly!
                  </p>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      setTimeout(() => setIsSubmitted(false), 300);
                    }}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your Name *" className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white" />
                    </div>
                    <div>
                      <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Email Address *" className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white" />
                    </div>
                    <div>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone Number *" className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white" />
                    </div>
                    <div>
                      <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white" />
                    </div>
                    <div>
                      <textarea name="message" value={form.message} onChange={handleChange} required placeholder="Type your query here... *" rows="3" className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white resize-none" />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Submit Query</span>
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex justify-center items-center hover:scale-105 transition-transform pointer-events-auto border-2 border-slate-100 overflow-hidden relative group p-0"
        title="Ask a Query"
      >
        <img 
          src="/Computer Icons Symbol Question Mark PNG.jpg" 
          alt="Query Icon" 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Unread dot indicator (optional purely visual) */}
        {!isOpen && !isSubmitted && !sessionStorage.getItem('queryWidgetOpened') && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        )}
      </button>
    </div>
  );
};

export default QueryWidget; 
