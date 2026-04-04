import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick, 
  type = 'button',
  icon: Icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-heading font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "border-2 border-foreground bg-white hover:bg-muted px-8 py-3 rounded-full",
    ghost: "text-foreground hover:bg-muted/50 px-6 py-2 rounded-full",
  };

  const buttonContent = (
    <>
      {children}
      {Icon && (
        <span className="ml-2 bg-white rounded-full p-1 border border-foreground inline-flex items-center justify-center">
          <Icon className="w-4 h-4 text-foreground" strokeWidth={3} />
        </span>
      )}
    </>
  );

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {buttonContent}
    </motion.button>
  );
};

export default Button;
