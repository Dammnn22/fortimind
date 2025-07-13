import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  hover = false,
  onClick
}) => {
  const baseStyles = `
    backdrop-blur-md rounded-2xl border
    transition-all duration-300 ease-in-out
    shadow-lg
  `;

  const variants = {
    primary: `
      bg-white/10 border-white/20 
      dark:bg-gray-900/20 dark:border-gray-700/30
      shadow-white/10 dark:shadow-gray-900/20
    `,
    secondary: `
      bg-gradient-to-br from-blue-500/10 to-purple-500/10 
      border-blue-500/20 dark:border-purple-500/30
      shadow-blue-500/10 dark:shadow-purple-500/20
    `,
    accent: `
      bg-gradient-to-br from-purple-500/10 to-pink-500/10 
      border-purple-500/20 dark:border-pink-500/30
      shadow-purple-500/10 dark:shadow-pink-500/20
    `
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverStyles = hover ? `
    hover:scale-105 hover:bg-white/20 
    hover:shadow-xl hover:shadow-white/20
    dark:hover:bg-gray-900/30 dark:hover:shadow-gray-900/30
    cursor-pointer
  ` : '';

  return (
    <div
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${hoverStyles}
        ${className}
      `}
      onClick={onClick}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
