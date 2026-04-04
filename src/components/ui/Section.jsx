import React from 'react';
import { motion } from 'framer-motion';

const Section = ({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  variant = 'default',
  pattern = true,
  theme = 'light'
}) => {
  const themes = {
    light: "bg-background",
    accent: "bg-accent text-white",
    tertiary: "bg-tertiary",
    muted: "bg-muted",
  };

  return (
    <section className={`relative py-24 overflow-hidden ${themes[variant]} ${className}`}>
      {/* Decorative Patterns */}
      {pattern && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Large Circle */}
          <motion.div 
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full border-2 border-foreground opacity-5 z-0"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          
          {/* Scattered Circles */}
          <div className="absolute top-1/4 right-0 w-64 h-64 rounded-full bg-secondary/10 -mr-32 blur-3xl z-0" />
          <div className="absolute bottom-1/4 left-0 w-48 h-48 rounded-full bg-tertiary/10 -ml-24 blur-2xl z-0" />
          
          {/* Dotted Grid Overlay */}
          <div className="absolute inset-0 bg-dots opacity-20 z-0" />
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-16 space-y-4">
            {subtitle && (
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-1 bg-tertiary border-2 border-foreground rounded-full text-sm font-bold uppercase tracking-wider text-foreground"
              >
                {subtitle}
              </motion.span>
            )}
            {title && (
              <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-foreground"
              >
                <span className="squiggle-underline">{title}</span>
              </motion.h2>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
