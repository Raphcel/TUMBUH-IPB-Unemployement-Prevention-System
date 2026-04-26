import React from 'react';

const variants = {
  success: "bg-green-50 text-green-700 border border-green-200",
  warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  error: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-highlight/50 text-primary border border-highlight/50",
  neutral: "bg-gray-50 text-secondary border border-gray-200",
  primary: "bg-primary/10 text-primary border border-primary/20",
};

export function Badge({ variant = 'neutral', className = '', children }) {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium";
  const variantStyles = variants[variant] || variants.neutral;
  
  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  );
}
