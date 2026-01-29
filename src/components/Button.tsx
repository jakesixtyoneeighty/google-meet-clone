import clsx from 'clsx';
import React, { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  rounding?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
}

const Button = ({
  children,
  onClick,
  size = 'md',
  rounding = 'md',
  variant = 'primary',
  disabled = false,
  className,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-95 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        
        // Sizes
        size === 'sm' && 'h-9 px-4 text-sm',
        size === 'md' && 'h-11 px-6 text-base',
        size === 'lg' && 'h-14 px-8 text-lg',
        
        // Rounding
        rounding === 'sm' && 'rounded-sm',
        rounding === 'md' && 'rounded-lg',
        rounding === 'lg' && 'rounded-full',
        
        // Variants
        variant === 'primary' && 'bg-nj-red text-white hover:bg-red-700 shadow-premium hover:shadow-red-glow',
        variant === 'outline' && 'bg-transparent text-white border border-nj-grey-700 hover:bg-nj-grey-800 hover:border-nj-grey-600',
        variant === 'ghost' && 'bg-transparent text-nj-grey-400 hover:text-white hover:bg-nj-grey-900',
        
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
