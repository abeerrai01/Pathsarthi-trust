import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  animate = true,
  icon: Icon,
  ...props 
}) => {
  const baseStyles = "bg-white border-2 border-foreground rounded-xl shadow-pop flex flex-col p-6";
  
  const variants = {
    default: "shadow-pop",
    featured: "shadow-pop-pink border-accent",
    ghost: "bg-transparent border-dashed border-mutedForeground shadow-none",
    flat: "shadow-none hover:shadow-pop transition-all",
  };

  const cardContent = (
    <>
      {Icon && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 mb-4 bg-tertiary border-2 border-foreground rounded-full p-4 shadow-pop animate-float">
          <Icon className="w-6 h-6 text-foreground" strokeWidth={3} />
        </div>
      )}
      {children}
    </>
  );

  if (!animate) {
    return (
      <div className={`${baseStyles} ${variants[variant]} ${className} relative`} {...props}>
        {cardContent}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, rotate: -1 }}
      className={`${baseStyles} ${variants[variant]} ${className} relative cursor-default`}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {cardContent}
    </motion.div>
  );
};

export default Card;
