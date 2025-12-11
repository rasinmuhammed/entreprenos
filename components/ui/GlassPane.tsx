
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
  
  // "Digital Clay" Aesthetic
  // Soft white/translucent background, diffused shadow, rounded corners
  const baseStyles = "bg-white/80 backdrop-blur-xl border border-white/60 shadow-soft text-ink-900 rounded-3xl";

  const hoverStyles = "hover:-translate-y-1 hover:shadow-lg transition-all duration-500 ease-out";

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden group",
        baseStyles,
        "after:absolute after:inset-0 after:rounded-3xl after:pointer-events-none after:shadow-inner-white", // Top-light highlight
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
