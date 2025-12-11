
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { AccessibilityMode } from '../../types';
import { Volume2, Focus, Eye, Cpu, User, Heart, ArrowRight } from 'lucide-react';
import { ContextEngine } from '../modules/ContextEngine';

export const LandingPage: React.FC = () => {
  const { setUserRole, setAccessibilityMode } = useAppStore();
  const [step, setStep] = useState(0); 

  const handleRoleSelect = (role: 'FOUNDER' | 'ALLY') => {
    setUserRole(role);
    setStep(1);
  };

  const handleModeSelect = (mode: AccessibilityMode) => {
    setAccessibilityMode(mode);
    setStep(2);
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden text-center bg-slate-50 text-ink-950">
      {/* Executive Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.05)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-100 pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="role" initial="hidden" animate="visible" exit="exit" variants={variants} className="max-w-4xl w-full z-10">
            <div className="mb-12">
               <h1 className="text-6xl md:text-7xl font-bold font-display tracking-tighter mb-6 text-ink-950">
                  Entrepren<span className="text-tech-purple">OS</span>
               </h1>
               <p className="text-ink-500 text-xl font-light max-w-2xl mx-auto">
                  The world's first adaptive operating system for founders. 
                  <br />Configures itself to your neurology.
               </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <button 
                onClick={() => handleRoleSelect('FOUNDER')} 
                className="p-8 bg-white border border-slate-200 hover:border-tech-purple/50 rounded-2xl transition-all text-left hover:shadow-xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                   <User className="w-7 h-7 text-tech-purple" />
                </div>
                <h3 className="text-2xl font-bold text-ink-950 mb-2 relative z-10">I am the Founder</h3>
                <p className="text-ink-500 text-sm relative z-10">"Tailor the interface to my personal strengths and cognition."</p>
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                   <ArrowRight className="w-6 h-6 text-tech-purple" />
                </div>
              </button>

              <button 
                onClick={() => handleRoleSelect('ALLY')} 
                className="p-8 bg-white border border-slate-200 hover:border-tech-cyan/50 rounded-2xl transition-all text-left hover:shadow-xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 bg-cyan-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                   <Heart className="w-7 h-7 text-tech-cyan" />
                </div>
                <h3 className="text-2xl font-bold text-ink-950 mb-2 relative z-10">I am a Trusted Ally</h3>
                <p className="text-ink-500 text-sm relative z-10">"I'm setting this up to support a founder I care about."</p>
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="calibration" initial="hidden" animate="visible" exit="exit" variants={variants} className="max-w-6xl w-full z-10">
            <h2 className="text-4xl md:text-5xl font-bold font-display text-ink-950 mb-4 tracking-tight">Interface Calibration</h2>
            <p className="text-ink-500 mb-12 text-lg">How do you prefer to interact with complex information?</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { mode: AccessibilityMode.SONIC_VIEW, icon: <Volume2 className="w-8 h-8" />, label: "Sonic View", desc: "Audio-first. I navigate by sound and conversation.", color: "text-amber-500", bg: "bg-amber-50", border: "hover:border-amber-300" },
                { mode: AccessibilityMode.FOCUS_SHIELD, icon: <Focus className="w-8 h-8" />, label: "Focus Shield", desc: "One task at a time. No distractions. Gamified flow.", color: "text-emerald-600", bg: "bg-emerald-50", border: "hover:border-emerald-300" },
                { mode: AccessibilityMode.SENTIMENT_HUD, icon: <Eye className="w-8 h-8" />, label: "Sentiment HUD", desc: "Visual subtext. I need help reading emotional cues.", color: "text-tech-cyan", bg: "bg-cyan-50", border: "hover:border-cyan-300" },
                { mode: AccessibilityMode.STANDARD, icon: <Cpu className="w-8 h-8" />, label: "Command Center", desc: "High density. I want to see everything at once.", color: "text-tech-purple", bg: "bg-indigo-50", border: "hover:border-indigo-300" }
              ].map((opt) => (
                <button 
                  key={opt.mode} 
                  onClick={() => handleModeSelect(opt.mode)} 
                  className={`flex flex-col items-center p-8 bg-white border border-slate-200 rounded-2xl transition-all group hover:shadow-xl ${opt.border}`}
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${opt.bg} ${opt.color}`}>
                     {opt.icon}
                  </div>
                  <h3 className="text-xl font-bold text-ink-900 mb-2">{opt.label}</h3>
                  <p className="text-sm text-ink-500">{opt.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
           <motion.div key="voice-input" initial="hidden" animate="visible" exit="exit" variants={variants} className="w-full h-full">
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                 <ContextEngine />
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
