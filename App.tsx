import React from 'react';
import { useAppStore } from './store/appStore';
import { ContextEngine } from './components/modules/ContextEngine';
import { GoldenGrid } from './components/layout/GoldenGrid';
import { BoardRoom } from './components/modules/BoardRoom';
import { Journal } from './components/modules/Journal';
import { CompetitorIntelligence } from './components/modules/CompetitorIntelligence';
import { LocalIntelligence } from './components/modules/LocalIntelligence';
import { Navigation } from './components/layout/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, RotateCcw, Command } from 'lucide-react';
import { View } from './types';

const App: React.FC = () => {
  const { context, widgets, currentView, reset } = useAppStore();

  return (
    <div className="min-h-screen bg-nebula-950 text-white font-sans selection:bg-tech-cyan/30 overflow-hidden flex relative">
      
      {/* --- ATMOSPHERIC BACKGROUND LAYERS --- */}
      
      {/* 1. Tech Grid Overlay */}
      <div className="fixed inset-0 z-0 bg-grid-pattern opacity-[0.15] pointer-events-none" />

      {/* 2. Gradient Leaks (Animated Orbs) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top Left - Purple Leak */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-tech-purple/20 rounded-full blur-[100px] animate-blob mix-blend-screen" />
        
        {/* Bottom Right - Cyan Leak */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-tech-cyan/10 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen" />
        
        {/* Center/Top - Emerald subtle hint */}
        <div className="absolute top-[10%] left-[30%] w-[30vw] h-[30vw] bg-tech-emerald/5 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-screen opacity-50" />
      </div>

      {/* --- APP STRUCTURE --- */}

      {context && <Navigation />}

      <div className={`flex-1 flex flex-col h-screen overflow-hidden relative z-10 transition-all duration-500 ${context ? 'ml-20' : ''}`}>
        
        {/* HEADER */}
        <header className="px-8 py-5 flex items-center justify-between shrink-0 border-b border-white/5 bg-nebula-950/50 backdrop-blur-md z-40">
          <div className="flex items-center gap-3">
             {/* Dynamic Logo */}
             <div className="relative group">
               <div className="absolute inset-0 bg-tech-cyan/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
               <Hexagon className="w-6 h-6 text-tech-cyan relative z-10" />
             </div>
             
             {!context && (
               <div className="flex flex-col">
                 <span className="font-semibold tracking-tight text-lg leading-none">EntreprenOS</span>
                 <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">Cognitive Operating System</span>
               </div>
             )}
             
             {context && (
                <div className="h-6 w-px bg-white/10 mx-2" />
             )}

             {context && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col"
                >
                  <span className="font-medium text-white text-sm tracking-wide">{context.businessName}</span>
                </motion.div>
             )}
          </div>
          
          {context && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-6"
            >
              <div className="hidden md:flex items-center gap-4 text-right">
                <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-tech-cyan uppercase tracking-wider">
                  {context.stage}
                </div>
                <div className="text-xs text-white/40 font-mono uppercase tracking-widest">{context.industry}</div>
              </div>
              
              <div className="h-4 w-px bg-white/10 hidden md:block" />

              <button 
                onClick={reset}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-white/40 hover:text-white"
                title="Reset Context"
              >
                <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                <span className="text-xs font-medium hidden sm:inline">Reset</span>
              </button>
            </motion.div>
          )}
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <AnimatePresence mode="wait">
            {!context ? (
              <motion.div
                key="onboarding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.5 }}
                className="h-full flex flex-col justify-center items-center pb-20 px-4"
              >
                <ContextEngine />
              </motion.div>
            ) : (
              // VIEW SWITCHER
              <motion.div
                key={currentView}
                initial={{ opacity: 0, scale: 0.99, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.01, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="h-full"
              >
                {currentView === View.DASHBOARD && <GoldenGrid widgets={widgets} />}
                {currentView === View.BOARDROOM && <BoardRoom />}
                {currentView === View.JOURNAL && <Journal />}
                {currentView === View.COMPETITORS && <CompetitorIntelligence />}
                {currentView === View.LOCAL_INTEL && <LocalIntelligence />}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* FOOTER / STATUS BAR */}
        <footer className="absolute bottom-0 left-0 right-0 h-6 bg-nebula-950/80 backdrop-blur border-t border-white/5 flex items-center justify-between px-4 text-[9px] font-mono text-white/30 z-50 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-tech-emerald animate-pulse" />
            NEURAL ENGINE: ONLINE
          </div>
          <div className="flex items-center gap-4">
            <span>SECURE CONNECTION</span>
            <span>V 3.0.1</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default App;