
import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassPaneProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassPane: React.FC<GlassPaneProps> = ({ children, className, onClick, hoverEffect = false }) => {
  
  // "Executive SaaS" Aesthetic
  // Crisp White, Thin Slate Border, Subtle Shadow
  const baseStyles = "bg-white border border-slate-200 shadow-glass rounded-2xl";

  const hoverStyles = "hover:border-tech-purple/30 hover:shadow-glass-hover transition-all duration-300 ease-out";

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden group",
        baseStyles,
        hoverEffect && `cursor-pointer ${hoverStyles}`,
        className
      )}
    >
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};
    