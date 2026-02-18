import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const SplashScreen = ({ finishLoading }) => {
  useEffect(() => {
    // Total duration for the animation sequence
    const timer = setTimeout(() => {
      finishLoading();
    }, 4000); // 3s spin + 0.5s zoom + buffer

    return () => clearTimeout(timer);
  }, [finishLoading]);

  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="relative flex flex-col items-center">
        <motion.img
          src="/PathSarthi logo.png"
          alt="PathSarthi Trust Logo"
          className="w-48 h-48 md:w-80 md:h-80 object-contain"
          initial={{ rotate: 0, scale: 0.1, opacity: 0 }}
          animate={{ 
            rotate: 360 * 6, 
            scale: [0.1, 1, 1, 0],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ 
            rotate: { duration: 3, ease: "easeInOut" },
            scale: { 
              duration: 3.8, 
              times: [0, 0.2, 0.8, 1],
              ease: "easeInOut"
            },
            opacity: {
              duration: 3.8,
              times: [0, 0.1, 0.9, 1],
              ease: "linear"
            }
          }}
        />
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
           transition={{ 
             duration: 3.8, 
             times: [0, 0.2, 0.8, 1],
             ease: "easeInOut" 
           }}
           className="mt-8 text-center"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Path Sarthi Trust
          </h1>
          <p className="text-indigo-600 font-medium italic mt-2 text-lg">
            Hope • Heal • Humanity
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
