import { motion } from 'framer-motion';

export function Card({ className = '', children, ...props }) {
  return (
    <motion.div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ className = '', children }) {
  return <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>{children}</div>;
}

export function CardBody({ className = '', children }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ className = '', children }) {
  return <div className={`px-6 py-4 bg-gray-50 border-t border-gray-100 ${className}`}>{children}</div>;
}
