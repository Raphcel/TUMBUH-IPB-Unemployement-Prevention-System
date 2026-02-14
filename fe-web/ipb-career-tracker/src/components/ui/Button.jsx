import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const variants = {
  primary: "bg-primary text-white hover:opacity-90 shadow-sm",
  secondary: "bg-gray-100 text-primary hover:bg-gray-200",
  outline: "border border-gray-300 text-primary hover:bg-highlight/50",
  ghost: "text-secondary hover:bg-highlight/30 hover:text-primary",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg",
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  href,
  to,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;

  const combinedClassName = `${baseStyles} ${variantStyles} ${sizeStyles} ${className}`;

  // Framer Motion props for hover effect
  const motionProps = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  };

  if (to) {
    // Wrap React Router Link with motion
    const MotionLink = motion.create(Link);
    return (
      <MotionLink to={to} className={combinedClassName} {...motionProps} {...props}>
        {children}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a href={href} className={combinedClassName} {...motionProps} {...props}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button className={combinedClassName} {...motionProps} {...props}>
      {children}
    </motion.button>
  );
}
