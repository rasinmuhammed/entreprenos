
import React from 'react';
import { useAppStore } from './store/appStore';
import { ContextEngine } from './components/modules/ContextEngine';
import { AdaptiveRenderer } from './components/gen-ui/AdaptiveRenderer';
import { SensoryInput } from './components/sensory/SensoryInput';
import { VisionModal } from './components/ui/VisionModal';
import { Navigation } from './components/layout/Navigation';
import { LandingPage } from './components/layout/LandingPage';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, RotateCcw, Accessibility } from 'lucide-react';
import { View, AccessibilityMode } from './types';

const App: React.FC = () => {
  const { context, currentView, reset, accessibilityMode, hasStartedOnboarding } = useAppStore();

  if (!hasStartedOnboarding) {
    return <LandingPage />;
  }

  return (
    <div className={`min-h-screen font-sans selection:bg-tech-cyan/30 overflow-hidden flex flex-col relative
      ${accessibilityMode === AccessibilityMode.FOCUS_SHIELD ? 'bg-black text-zinc-300' : 'bg-nebula-950 text-white'}
    `}>
      
      {/* --- ATMOSPHERIC BACKGROUND LAYERS (Standard Only) --- */}
      {accessibilityMode === AccessibilityMode.STANDARD && (
        <>
          <div className="fixed inset-0 z-0 bg-grid-pattern opacity-[0.15] pointer-events-none" />
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-tech-purple/20 rounded-full blur-[100px] animate-blob mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-tech-cyan/10 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen" />
          </div>
        </>
      )}

      {/* --- APP STRUCTURE --- */}

      <div className="flex-1 flex overflow-hidden relative z-10">
        {context && accessibilityMode === AccessibilityMode.STANDARD && <Navigation />}

        {/* GLOBAL MODALS */}
        <AnimatePresence>
           <VisionModal />
        </AnimatePresence>

        <div className={`flex-1 flex flex-col h-full overflow-hidden relative z-10 transition-all duration-500 ${context && accessibilityMode === AccessibilityMode.STANDARD ? 'ml-20' : ''}`}>
          
          {/* HEADER */}
          {accessibilityMode !== AccessibilityMode.FOCUS_SHIELD && (
            <header className="px-8 py-5 flex items-center justify-between shrink-0 border-b border-white/5 bg-nebula-950/50 backdrop-blur-md z-40">
              <div className="flex items-center gap-3">
                 <div className="relative group">
                   <div className="absolute inset-0 bg-tech-cyan/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Hexagon className="w-6 h-6 text-tech-cyan relative z-10" />
                 </div>
                 
                 {!context && (
                   <div className="flex flex-col">
                     <span className="font-semibold tracking-tight text-lg leading-none">EntreprenOS</span>
                     <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Access Edition</span>
                   </div>
                 )}

                 {context && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                      <span className="font-medium text-white text-sm tracking-wide ml-4">{context.businessName}</span>
                    </motion.div>
                 )}
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono uppercase text-white/50 flex items-center gap-2">
                    <Accessibility className="w-3 h-3" />
                    Mode: {accessibilityMode}
                 </div>
                 {context && (
                    <button onClick={reset} className="text-white/40 hover:text-white transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                 )}
              </div>
            </header>
          )}

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {!context ? (
                <motion.div
                  key="onboarding"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                  className="h-full flex flex-col justify-center items-center pb-20 px-4"
                >
                  <ContextEngine />
                </motion.div>
              ) : (
                <AdaptiveRenderer />
              )}
            </AnimatePresence>
          </main>

        </div>
      </div>

      {/* SENSORY INPUT (Footer) */}
      <SensoryInput />

    </div>
  );
};

export default App;
