import React, { ReactNode } from 'react';

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const baseStyles = `
    backdrop-blur-md rounded-xl border font-medium
    transition-all duration-300 ease-in-out
    shadow-lg transform hover:scale-105 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-500/20 to-purple-500/20 
      border-blue-500/30 text-blue-100 
      hover:from-blue-500/30 hover:to-purple-500/30
      hover:border-blue-400/40 hover:shadow-blue-500/25
      focus:ring-blue-500/50
      dark:text-blue-200 dark:border-blue-400/40
    `,
    secondary: `
      bg-gradient-to-r from-purple-500/20 to-pink-500/20 
      border-purple-500/30 text-purple-100
      hover:from-purple-500/30 hover:to-pink-500/30
      hover:border-purple-400/40 hover:shadow-purple-500/25
      focus:ring-purple-500/50
      dark:text-purple-200 dark:border-purple-400/40
    `,
    accent: `
      bg-gradient-to-r from-pink-500/20 to-rose-500/20 
      border-pink-500/30 text-pink-100
      hover:from-pink-500/30 hover:to-rose-500/30
      hover:border-pink-400/40 hover:shadow-pink-500/25
      focus:ring-pink-500/50
      dark:text-pink-200 dark:border-pink-400/40
    `,
    ghost: `
      bg-white/10 border-white/20 text-gray-100
      hover:bg-white/20 hover:border-white/30
      hover:shadow-white/20
      focus:ring-white/50
      dark:text-gray-200 dark:border-gray-500/30
    `
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </button>
  );
};

export default GlassButton;
