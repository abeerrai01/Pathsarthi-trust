import React from 'react';
import { motion } from 'framer-motion';

const Marquee = ({ items, speed = 20, className = '' }) => {
  return (
    <div className={`flex overflow-hidden select-none gap-8 ${className}`}>
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: speed, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex shrink-0 items-center gap-8 min-w-full"
      >
        {items.map((item, idx) => (
          <div key={idx} className="flex-shrink-0">
            {item}
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {items.map((item, idx) => (
          <div key={`duplicate-${idx}`} className="flex-shrink-0">
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;
