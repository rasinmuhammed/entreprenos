import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAppStore } from '../../store/appStore';
import { ThemeMode } from '../../types';

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
  const { themeMode } = useAppStore();
  const isEarth = themeMode === ThemeMode.EARTH;

  const baseStyles = isEarth 
    ? "bg-white/60 border-stone-200/50 shadow-lg backdrop-blur-xl text-stone-900"
    : "bg-glass-surface border-glass-border shadow-lg backdrop-blur-xl text-white";

  const hoverStyles = isEarth
    ? "hover:shadow-xl hover:border-amber-400/30"
    : "hover:shadow-glow";

  const noiseOpacity = isEarth ? "opacity-[0.05]" : "opacity-[0.03]";

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
      whileHover={hoverEffect ? { y: -2, borderColor: isEarth ? "rgba(245, 158, 11, 0.3)" : "rgba(255,255,255,0.15)" } : {}}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-xl border group transition-colors duration-300",
        baseStyles,
        "after:absolute after:inset-0 after:rounded-xl after:pointer-events-none",
        isEarth ? "after:shadow-none" : "after:shadow-inner-light",
        hoverEffect && `cursor-pointer ${hoverStyles} transition-all duration-300`,
        className
      )}
    >
      <div className={`absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${noiseOpacity} mix-blend-overlay`} />
      {!isEarth && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};
