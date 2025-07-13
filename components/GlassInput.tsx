import React, { ReactNode } from 'react';

interface GlassInputProps {
  children: ReactNode;
  label?: string;
  error?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

const GlassInput: React.FC<GlassInputProps> = ({
  children,
  label,
  error,
  className = '',
  variant = 'primary'
}) => {
  const variants = {
    primary: 'focus-within:ring-blue-500/50 focus-within:border-blue-500/50',
    secondary: 'focus-within:ring-purple-500/50 focus-within:border-purple-500/50',
    accent: 'focus-within:ring-pink-500/50 focus-within:border-pink-500/50'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className={`
        relative bg-white/10 border border-white/20 rounded-xl 
        backdrop-blur-md transition-all duration-200
        ${variants[variant]}
        ${error ? 'border-red-500/50 ring-1 ring-red-500/50' : ''}
      `}>
        {children}
      </div>
      
      {error && (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

export default GlassInput;
