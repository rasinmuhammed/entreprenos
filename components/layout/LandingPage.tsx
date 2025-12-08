
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { AccessibilityMode } from '../../types';
import { Hexagon, ArrowRight, User, Users, Volume2, Focus, Eye, Cpu, Heart, Sparkles, MessageSquare } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { startOnboarding, setUserRole, setAccessibilityMode } = useAppStore();
  const [step, setStep] = useState(0); 

  const handleRoleSelect = (role: 'FOUNDER' | 'ALLY') => {
    setUserRole(role);
    setStep(2);
  };

  const handleModeSelect = (mode: AccessibilityMode) => {
    setAccessibilityMode(mode);
    startOnboarding(); 
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // --- GUIDE COMPONENT ---
  const GuideBubble: React.FC<{ title: string, text: string }> = ({ title, text }) => (
    <div className="absolute -right-64 top-0 w-60 p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md hidden lg:block animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="flex items-center gap-2 mb-2 text-tech-cyan">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-mono uppercase tracking-widest">{title}</span>
      </div>
      <p className="text-sm text-white/70 leading-relaxed font-light">{text}</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden text-center bg-nebula-950">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <AnimatePresence mode="wait">
        
        {/* STEP 0: HERO INTRO */}
        {step === 0 && (
          <motion.div
            key="intro"
            initial="hidden" animate="visible" exit="exit" variants={variants}
            className="max-w-4xl z-10 relative"
          >
            <div className="flex justify-center mb-8">
              <div className="relative group cursor-default">
                <div className="absolute inset-0 bg-tech-cyan/20 blur-3xl rounded-full opacity-60 animate-pulse" />
                <Hexagon className="w-24 h-24 text-white relative z-10" strokeWidth={0.5} />
                <Cpu className="w-10 h-10 text-tech-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-light text-white tracking-tighter mb-6">
              Entrepren<span className="text-tech-cyan font-normal">OS</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/60 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
              Your business, amplified. An adaptive operating system that 
              <span className="text-white"> harmonizes with your unique workstyle</span>.
            </p>

            <button 
              onClick={() => setStep(1)}
              className="group relative px-12 py-5 bg-white hover:bg-tech-cyan text-nebula-950 rounded-2xl font-medium text-lg tracking-wide hover:scale-105 transition-all shadow-glow-cyan"
            >
              <span className="flex items-center gap-3">
                Launch Your Empire <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <p className="mt-8 text-white/30 text-sm font-light">
              Powered by Google Gemini • Integrated with Maps & Search
            </p>
          </motion.div>
        )}

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 && (
          <motion.div
            key="role"
            initial="hidden" animate="visible" exit="exit" variants={variants}
            className="max-w-4xl w-full z-10"
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-2">Welcome, Visionary.</h2>
            <p className="text-white/40 mb-12 text-lg">Who is configuring the command center today?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto relative">
              
              <button 
                onClick={() => handleRoleSelect('FOUNDER')}
                className="group relative p-8 bg-nebula-900/50 hover:bg-tech-cyan/5 border border-white/10 hover:border-tech-cyan/50 rounded-2xl transition-all text-left"
              >
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-tech-cyan/20 transition-colors">
                  <User className="w-8 h-8 text-white group-hover:text-tech-cyan" />
                </div>
                <h3 className="text-2xl text-white font-medium mb-2">I am the Founder</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  "I'm ready to build. Tailor the interface to my personal strengths and preferences."
                </p>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-6 h-6 text-tech-cyan" />
                </div>
              </button>

              <button 
                onClick={() => handleRoleSelect('ALLY')}
                className="group relative p-8 bg-nebula-900/50 hover:bg-tech-purple/5 border border-white/10 hover:border-tech-purple/50 rounded-2xl transition-all text-left"
              >
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-tech-purple/20 transition-colors">
                  <Heart className="w-8 h-8 text-white group-hover:text-tech-purple" />
                </div>
                <h3 className="text-2xl text-white font-medium mb-2">I am a Trusted Ally</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  "I'm setting this up for a brilliant mind. Help me configure the perfect supportive environment."
                </p>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-6 h-6 text-tech-purple" />
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: INTERFACE HARMONY */}
        {step === 2 && (
          <motion.div
            key="calibration"
            initial="hidden" animate="visible" exit="exit" variants={variants}
            className="max-w-6xl w-full z-10"
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-2">Interface Harmony</h2>
            <p className="text-white/40 mb-12 text-lg">Choose the workflow that makes you feel most powerful.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  mode: AccessibilityMode.STANDARD, 
                  icon: <Cpu className="w-8 h-8" />, 
                  label: "Visual Command", 
                  desc: "A data-rich, high-density dashboard for those who want to see everything at once.",
                  color: "text-white",
                  borderColor: "hover:border-white/50",
                  bgHover: "hover:bg-white/5"
                },
                { 
                  mode: AccessibilityMode.SONIC_VIEW, 
                  icon: <Volume2 className="w-8 h-8" />, 
                  label: "Audio-First Flow", 
                  desc: "A linear, high-fidelity audio experience. Perfect for those who process information faster through listening.",
                  color: "text-yellow-400",
                  borderColor: "hover:border-yellow-400/50",
                  bgHover: "hover:bg-yellow-400/10"
                },
                { 
                  mode: AccessibilityMode.FOCUS_SHIELD, 
                  icon: <Focus className="w-8 h-8" />, 
                  label: "Deep Work Mode", 
                  desc: "A distraction-free, single-task interface. Designed to protect your flow state and reduce noise.",
                  color: "text-emerald-400",
                  borderColor: "hover:border-emerald-400/50",
                  bgHover: "hover:bg-emerald-400/10"
                },
                { 
                  mode: AccessibilityMode.SENTIMENT_HUD, 
                  icon: <Eye className="w-8 h-8" />, 
                  label: "Visual Signal Mode", 
                  desc: "Enhanced visual cues and captions. Ideal for those who prefer visual confirmation of tone and audio.",
                  color: "text-cyan-400",
                  borderColor: "hover:border-cyan-400/50",
                  bgHover: "hover:bg-cyan-400/10"
                }
              ].map((opt) => (
                <button
                  key={opt.mode}
                  onClick={() => handleModeSelect(opt.mode)}
                  className={`relative flex flex-col items-center p-8 bg-nebula-900/40 border border-white/10 rounded-2xl transition-all group text-center h-full ${opt.borderColor} ${opt.bgHover}`}
                >
                  <div className={`w-16 h-16 rounded-full bg-black/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${opt.color} shadow-lg`}>
                    {opt.icon}
                  </div>
                  <h3 className={`text-xl font-medium mb-3 ${opt.color}`}>{opt.label}</h3>
                  <p className="text-sm text-white/50 leading-relaxed font-light">{opt.desc}</p>
                  
                  <div className="mt-auto pt-8 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className={`py-2 rounded-lg bg-white/5 border border-white/5 text-xs uppercase font-mono tracking-widest ${opt.color}`}>
                        Select Mode
                     </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-12 text-white/20 text-sm">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Not sure? You can switch modes instantly at any time.
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
