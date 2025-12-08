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
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
      whileHover={hoverEffect ? { y: -2, borderColor: "rgba(255,255,255,0.15)" } : {}}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Custom easing for premium feel
      className={cn(
        "relative overflow-hidden rounded-xl border border-glass-border bg-glass-surface shadow-lg backdrop-blur-xl group",
        // Inner lighting effect
        "after:absolute after:inset-0 after:rounded-xl after:shadow-inner-light after:pointer-events-none",
        hoverEffect && "cursor-pointer hover:shadow-glow transition-all duration-300",
        className
      )}
    >
      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Ambient Top Light Gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};