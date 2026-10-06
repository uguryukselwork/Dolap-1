import React from 'react';
import { Loader2 } from 'lucide-react';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const PillButton: React.FC<PillButtonProps> = ({
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs font-semibold rounded-full',
    md: 'px-6 py-3 text-sm font-semibold rounded-full',
    lg: 'w-full py-4 px-8 text-base font-semibold rounded-full tracking-wide',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#7B8CC8] to-[#8E9BD4] text-white shadow-lg shadow-[#7B8CC8]/25 hover:shadow-xl hover:shadow-[#7B8CC8]/35 active:scale-[0.98] border border-white/20',
    secondary:
      'bg-[#F3F2F9] text-[#5263A8] hover:bg-[#EAE8F5] active:scale-[0.98]',
    outline:
      'border-2 border-[#7B8CC8]/30 text-[#5263A8] bg-white/60 hover:bg-white active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-500 hover:text-slate-800 active:scale-[0.98]',
    success:
      'bg-gradient-to-r from-[#5BB85D] to-[#6CC86E] text-white shadow-lg shadow-[#6CC86E]/25 hover:shadow-xl active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      <span>{children}</span>
    </button>
  );
};
