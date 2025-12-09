
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { AccessibilityMode } from '../../types';
import { Volume2, Focus, Eye, Cpu, User, Heart } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden text-center bg-nebula-950">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="role" initial="hidden" animate="visible" exit="exit" variants={variants} className="max-w-4xl w-full z-10">
            <h1 className="text-5xl md:text-6xl font-light text-white tracking-tighter mb-4">Entrepren<span className="text-tech-cyan font-normal">OS</span></h1>
            <p className="text-white/40 mb-12 text-lg">Who is configuring the system?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <button onClick={() => handleRoleSelect('FOUNDER')} className="p-8 bg-nebula-900/50 border border-white/10 hover:border-tech-cyan/50 rounded-2xl transition-all text-left hover:bg-tech-cyan/5 group">
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-tech-cyan/20"><User className="w-8 h-8 text-white group-hover:text-tech-cyan" /></div>
                <h3 className="text-2xl text-white font-medium mb-2">I am the Founder</h3>
                <p className="text-white/50 text-sm">"Tailor the interface to my personal strengths."</p>
              </button>
              <button onClick={() => handleRoleSelect('ALLY')} className="p-8 bg-nebula-900/50 border border-white/10 hover:border-tech-purple/50 rounded-2xl transition-all text-left hover:bg-tech-purple/5 group">
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-tech-purple/20"><Heart className="w-8 h-8 text-white group-hover:text-tech-purple" /></div>
                <h3 className="text-2xl text-white font-medium mb-2">I am a Trusted Ally</h3>
                <p className="text-white/50 text-sm">"I'm setting this up for someone else."</p>
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="calibration" initial="hidden" animate="visible" exit="exit" variants={variants} className="max-w-6xl w-full z-10">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-2">Interface Harmony</h2>
            <p className="text-white/40 mb-12 text-lg">What is your primary way of interacting?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { mode: AccessibilityMode.SONIC_VIEW, icon: <Volume2 className="w-8 h-8" />, label: "I navigate by sound", desc: "Audio-first. Spatial cues.", color: "text-yellow-400" },
                { mode: AccessibilityMode.FOCUS_SHIELD, icon: <Focus className="w-8 h-8" />, label: "I think in bursts", desc: "Distraction-free. Gamified.", color: "text-emerald-400" },
                { mode: AccessibilityMode.SENTIMENT_HUD, icon: <Eye className="w-8 h-8" />, label: "I read visually", desc: "Subtext captions. Visual alerts.", color: "text-cyan-400" },
                { mode: AccessibilityMode.STANDARD, icon: <Cpu className="w-8 h-8" />, label: "Fully operational", desc: "High-density dashboard.", color: "text-white" }
              ].map((opt) => (
                <button key={opt.mode} onClick={() => handleModeSelect(opt.mode)} className={`flex flex-col items-center p-8 bg-nebula-900/40 border border-white/10 rounded-2xl transition-all group hover:bg-white/5 hover:border-white/30`}>
                  <div className={`w-16 h-16 rounded-full bg-black/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${opt.color}`}>{opt.icon}</div>
                  <h3 className={`text-xl font-medium mb-3 ${opt.color}`}>{opt.label}</h3>
                  <p className="text-sm text-white/50">{opt.desc}</p>
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
