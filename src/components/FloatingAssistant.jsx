import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from './Chatbot';
import QueryWidget from './QueryWidget';

const FloatingAssistant = () => {
  const [activeWidget, setActiveWidget] = useState(null); // 'chat' or 'query' or null
  const [isExpanded, setIsExpanded] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    // Force video to play on mobile devices where autoplay might be blocked
    if (!activeWidget && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay prevented by browser:", error);
      });
    }
  }, [activeWidget]);

  // Handle scroll to collapse the query button into the assistant
  useEffect(() => {
    const handleScroll = () => {
      // If a widget is open, we don't auto-collapse/expand
      if (activeWidget) return;
      
      if (window.scrollY > 50) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeWidget]);

  const handleAssistantClick = () => {
    if (activeWidget) {
      setActiveWidget(null); // Close any open widget
      return;
    }

    if (!isExpanded) {
      setIsExpanded(true); // Pop out the query icon
    } else {
      setActiveWidget('chat'); // Open chat
    }
  };

  return (
    <>
      <QueryWidget 
        isOpen={activeWidget === 'query'} 
        onClose={() => setActiveWidget(null)} 
      />
      <Chatbot 
        isOpen={activeWidget === 'chat'} 
        onClose={() => setActiveWidget(null)} 
      />

      {/* Floating Buttons Container */}
      <div className="fixed bottom-6 right-6 z-[9998] flex flex-col items-center gap-4 pointer-events-none">
        
        {/* Query Floating Button */}
        <AnimatePresence>
          {isExpanded && !activeWidget && (
            <motion.button
              initial={{ opacity: 0, y: 50, scale: 0 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={() => setActiveWidget('query')}
              className="w-14 h-14 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex justify-center items-center hover:scale-105 transition-transform pointer-events-auto border-2 border-slate-100 overflow-hidden relative group p-0"
              title="Ask a Query"
            >
              <img 
                src="/Computer Icons Symbol Question Mark PNG.jpg" 
                alt="Query Icon" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main Assistant Floating Button */}
        {!activeWidget && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAssistantClick}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-2xl flex items-center justify-center transition-all overflow-hidden group shadow-indigo-200 pointer-events-auto relative"
          >
            <video 
              ref={videoRef}
              src="/assitant.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
          </motion.button>
        )}
      </div>
    </>
  );
};

export default FloatingAssistant;
