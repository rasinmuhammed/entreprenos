
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { AccessibilityMode } from '../../types';
import { GlassPane } from '../ui/GlassPane';
import { Hexagon, ArrowRight, User, Users, Volume2, Focus, Eye, Cpu, Check } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { startOnboarding, setUserRole, setAccessibilityMode } = useAppStore();
  const [step, setStep] = useState(0); // 0: Intro, 1: Role, 2: Calibration

  const handleRoleSelect = (role: 'FOUNDER' | 'ALLY') => {
    setUserRole(role);
    setStep(2);
  };

  const handleModeSelect = (mode: AccessibilityMode) => {
    setAccessibilityMode(mode);
    startOnboarding(); // Completes landing phase
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <AnimatePresence mode="wait">
        
        {/* STEP 0: HERO INTRO */}
        {step === 0 && (
          <motion.div
            key="intro"
            initial="hidden" animate="visible" exit="exit" variants={variants}
            className="max-w-4xl z-10"
          >
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-tech-cyan/30 blur-2xl rounded-full opacity-50 animate-pulse" />
                <Hexagon className="w-24 h-24 text-white relative z-10" strokeWidth={1} />
                <Cpu className="w-12 h-12 text-tech-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-light text-white tracking-tighter mb-6">
              Entrepren<span className="text-tech-cyan font-normal">OS</span>
            </h1>
            <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono uppercase tracking-[0.2em] text-white/60 mb-8">
              Access Edition
            </div>

            <p className="text-xl md:text-2xl text-white/60 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
              The Agentic Operating System that <span className="text-white">adapts to your senses</span>.
              <br />
              <span className="text-base text-white/40 mt-4 block">
                Integrated with Google Business Profile, Maps, and Search to empower every entrepreneur, regardless of ability.
              </span>
            </p>

            <button 
              onClick={() => setStep(1)}
              className="group relative px-10 py-5 bg-white text-nebula-950 rounded-2xl font-medium text-lg tracking-wide hover:scale-105 transition-transform"
            >
              <span className="flex items-center gap-3">
                Initialize System <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </motion.div>
        )}

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 && (
          <motion.div
            key="role"
            initial="hidden" animate="visible" exit="exit" variants={variants}
            className="max-w-4xl w-full z-10"
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">Identify User Persona</h2>
            <p className="text-white/40 mb-12">Who is setting up this workspace?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <button 
                onClick={() => handleRoleSelect('FOUNDER')}
                className="group relative p-8 bg-nebula-900/50 hover:bg-tech-cyan/10 border border-white/10 hover:border-tech-cyan/50 rounded-2xl transition-all text-left"
              >
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-tech-cyan/20 transition-colors">
                  <User className="w-8 h-8 text-white group-hover:text-tech-cyan" />
                </div>
                <h3 className="text-2xl text-white font-medium mb-2">I am the Founder</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  I am setting up EntreprenOS for my own business. Adapt the interface to my needs.
                </p>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-6 h-6 text-tech-cyan" />
                </div>
              </button>

              <button 
                onClick={() => handleRoleSelect('ALLY')}
                className="group relative p-8 bg-nebula-900/50 hover:bg-tech-purple/10 border border-white/10 hover:border-tech-purple/50 rounded-2xl transition-all text-left"
              >
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-tech-purple/20 transition-colors">
                  <Users className="w-8 h-8 text-white group-hover:text-tech-purple" />
                </div>
                <h3 className="text-2xl text-white font-medium mb-2">I am an Ally / Assistant</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  I am helping a founder set up their environment. I will input data on their behalf.
                </p>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-6 h-6 text-tech-purple" />
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: SENSORY CALIBRATION */}
        {step === 2 && (
          <motion.div
            key="calibration"
            initial="hidden" animate="visible" exit="exit" variants={variants}
            className="max-w-5xl w-full z-10"
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">Sensory Calibration</h2>
            <p className="text-white/40 mb-12">How should EntreprenOS present information?</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  mode: AccessibilityMode.STANDARD, 
                  icon: <Cpu className="w-6 h-6" />, 
                  label: "Standard", 
                  desc: "Rich visual interface with complex dashboards.",
                  color: "text-white"
                },
                { 
                  mode: AccessibilityMode.SONIC_VIEW, 
                  icon: <Volume2 className="w-6 h-6" />, 
                  label: "Sonic View", 
                  desc: "Linear, screen-reader optimized layout. High contrast.",
                  color: "text-yellow-400"
                },
                { 
                  mode: AccessibilityMode.FOCUS_SHIELD, 
                  icon: <Focus className="w-6 h-6" />, 
                  label: "Focus Shield", 
                  desc: "Minimalist, distraction-free. Single task view.",
                  color: "text-emerald-400"
                },
                { 
                  mode: AccessibilityMode.SENTIMENT_HUD, 
                  icon: <Eye className="w-6 h-6" />, 
                  label: "Sentiment HUD", 
                  desc: "Visual emotional cues and captions for audio context.",
                  color: "text-cyan-400"
                }
              ].map((opt) => (
                <button
                  key={opt.mode}
                  onClick={() => handleModeSelect(opt.mode)}
                  className="flex flex-col items-center p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl transition-all group text-center"
                >
                  <div className={`w-12 h-12 rounded-full bg-black/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${opt.color}`}>
                    {opt.icon}
                  </div>
                  <h3 className={`text-lg font-medium mb-2 ${opt.color}`}>{opt.label}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{opt.desc}</p>
                  <div className="mt-6 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Select
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
