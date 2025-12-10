
import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/appStore';
import { ContextEngine } from './components/modules/ContextEngine';
import { AdaptiveRenderer } from './components/gen-ui/AdaptiveRenderer';
import { SensoryInput } from './components/sensory/SensoryInput';
import { VisionModal } from './components/ui/VisionModal';
import { Navigation } from './components/layout/Navigation';
import { LandingPage } from './components/layout/LandingPage';
import { AuthGuard } from './components/auth/AuthGuard';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, RotateCcw, Accessibility, Play, Sun, Moon, LogOut } from 'lucide-react';
import { AccessibilityMode, ThemeMode } from './types';
import { generateResumeBrief } from './services/geminiService';

const App: React.FC = () => {
  const { 
    checkSession, 
    auth, 
    logout,
    context, 
    reset, 
    accessibilityMode, 
    hasStartedOnboarding, 
    focusSession, 
    lastActiveContext, 
    setLastActiveContext, 
    themeMode, 
    setThemeMode,
    liveState,
    updateUIContext
  } = useAppStore();
  
  const [resumeBrief, setResumeBrief] = useState<string | null>(null);

  // Initial Session Check
  useEffect(() => {
    checkSession();
  }, []);

  // Device Detection Logic (The "Brain" Update)
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      updateUIContext({ device: isMobile ? 'MOBILE' : 'DESKTOP' });
    };
    
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Resume Brief Logic
  useEffect(() => {
    if (focusSession.isActive && lastActiveContext && !resumeBrief) {
       generateResumeBrief(focusSession.taskName, focusSession.currentStepIndex, focusSession.microSteps).then(setResumeBrief);
    }
  }, [focusSession.isActive, lastActiveContext]);

  // --- THEMING LOGIC ---
  // High Contrast is mandatory for SONIC_VIEW (Visually Impaired)
  const isHighContrast = accessibilityMode === AccessibilityMode.SONIC_VIEW;
  const isEarthMode = themeMode === ThemeMode.EARTH && !isHighContrast;
  const isFocusMode = accessibilityMode === AccessibilityMode.FOCUS_SHIELD && !isHighContrast;

  const bgClass = isHighContrast ? 'bg-black text-yellow-400 font-mono' :
                  isFocusMode ? 'bg-black text-zinc-300' : 
                  isEarthMode ? 'bg-stone-50 text-stone-900' : 'bg-nebula-950 text-white';

  const toggleTheme = () => {
    setThemeMode(isEarthMode ? ThemeMode.NEBULA : ThemeMode.EARTH);
  };

  return (
    <AuthGuard>
      {!hasStartedOnboarding ? (
        <LandingPage />
      ) : (
        <div className={`min-h-screen font-sans selection:bg-tech-cyan/30 overflow-hidden flex flex-col relative transition-colors duration-500 ${bgClass}`}>
          {/* BACKGROUND LAYERS - Disable for High Contrast to reduce noise */}
          {!isHighContrast && (
            <>
              <div className="fixed inset-0 z-0 bg-grid-pattern opacity-[0.15] pointer-events-none" />
              <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                 {isEarthMode ? (
                    <>
                       <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" />
                       <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-200/30 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply" />
                    </>
                 ) : (
                    <>
                       <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-tech-purple/20 rounded-full blur-[100px] animate-blob mix-blend-screen" />
                       <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-tech-cyan/10 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen" />
                    </>
                 )}
              </div>
            </>
          )}

          {/* CONTEXT RESURRECTOR OVERLAY */}
          <AnimatePresence>
            {resumeBrief && focusSession.isActive && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
                  <h1 className="text-4xl font-light text-white mb-6">Welcome Back, Founder.</h1>
                  <p className="text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed">"{resumeBrief}"</p>
                  <button onClick={() => setResumeBrief(null)} className="px-12 py-6 bg-white text-black text-2xl font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-4"><Play className="w-8 h-8 fill-current" /> RESUME SESSION</button>
               </motion.div>
            )}
          </AnimatePresence>

          <div 
             className={`flex-1 flex overflow-hidden relative z-10 transition-opacity duration-300 ${liveState.isStreaming ? 'opacity-80 scale-[0.99]' : 'opacity-100'}`}
          >
            {context && accessibilityMode === AccessibilityMode.STANDARD && <Navigation />}
            <AnimatePresence><VisionModal /></AnimatePresence>
            
            {/* MOBILE LAYOUT FIX: Apply md:ml-20 for desktop sidebar space, and mb-20 for mobile bottom bar space */}
            <div className={`flex-1 flex flex-col h-full overflow-hidden relative z-10 transition-all duration-500 ${context && accessibilityMode === AccessibilityMode.STANDARD ? 'md:ml-20 mb-20 md:mb-0' : ''}`}>
              {accessibilityMode !== AccessibilityMode.FOCUS_SHIELD && (
                <header className={`px-8 py-5 flex items-center justify-between shrink-0 border-b z-40 backdrop-blur-md ${isHighContrast ? 'bg-black border-yellow-400' : isEarthMode ? 'bg-stone-100/50 border-stone-200 text-stone-900' : 'bg-nebula-950/50 border-white/5 text-white'}`}>
                  <div className="flex items-center gap-3">
                     <div className="relative group">
                       <div className={`absolute inset-0 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isHighContrast ? 'hidden' : isEarthMode ? 'bg-amber-400/30' : 'bg-tech-cyan/20'}`} />
                       <Hexagon className={`w-6 h-6 relative z-10 ${isHighContrast ? 'text-yellow-400' : isEarthMode ? 'text-amber-600' : 'text-tech-cyan'}`} />
                     </div>
                     {!context && <div className="flex flex-col"><span className="font-semibold tracking-tight text-lg leading-none">EntreprenOS</span><span className={`text-[9px] font-mono tracking-widest uppercase ${isHighContrast ? 'text-yellow-400' : 'opacity-40'}`}>Access Edition</span></div>}
                     {context && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}><span className="font-medium text-sm tracking-wide ml-4">{context.businessName}</span></motion.div>}
                  </div>
                  <div className="flex items-center gap-4">
                     <div className={`px-3 py-1 border rounded-full text-[10px] font-mono uppercase flex items-center gap-2 ${isHighContrast ? 'border-yellow-400 text-yellow-400' : isEarthMode ? 'bg-stone-200 border-stone-300 text-stone-600' : 'bg-white/5 border-white/10 text-white/50'}`}>
                        <Accessibility className="w-3 h-3" /> Mode: {accessibilityMode}
                     </div>
                     
                     <div className={`hidden md:flex items-center gap-2 px-3 py-1 border rounded-full text-[10px] font-mono uppercase ${isHighContrast ? 'border-yellow-400 text-yellow-400' : isEarthMode ? 'bg-stone-200 border-stone-300 text-stone-600' : 'bg-white/5 border-white/10 text-white/50'}`}>
                        <span>{auth.user?.email}</span>
                     </div>

                     {context && !isHighContrast && (
                        <button 
                          onClick={toggleTheme}
                          className={`px-3 py-1 border rounded-full text-[10px] font-mono uppercase flex items-center gap-2 transition-all hover:scale-105 ${isEarthMode ? 'bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30'}`}
                        >
                           {isEarthMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                           {isEarthMode ? 'Dark' : 'Light'}
                        </button>
                     )}
                  </div>
                </header>
              )}
              
              <main className="flex-1 overflow-hidden relative"> 
                 <AdaptiveRenderer />
              </main>

              {/* SENSORY INPUT FOOTER - Hidden on mobile to save space for nav */}
              <div className="shrink-0 z-50 hidden md:block">
                 <SensoryInput />
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
};

export default App;
