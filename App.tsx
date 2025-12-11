
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
import { Hexagon, Play, Sun, Moon, Accessibility } from 'lucide-react';
import { AccessibilityMode, ThemeMode } from './types';
import { generateResumeBrief } from './services/geminiService';

const App: React.FC = () => {
  const { 
    checkSession, 
    auth, 
    context, 
    accessibilityMode, 
    hasStartedOnboarding, 
    focusSession, 
    lastActiveContext, 
    themeMode, 
    setThemeMode,
    liveState,
    updateUIContext
  } = useAppStore();
  
  const [resumeBrief, setResumeBrief] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      updateUIContext({ device: isMobile ? 'MOBILE' : 'DESKTOP' });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (focusSession.isActive && lastActiveContext && !resumeBrief) {
       generateResumeBrief(focusSession.taskName, focusSession.currentStepIndex, focusSession.microSteps).then(setResumeBrief);
    }
  }, [focusSession.isActive, lastActiveContext]);

  // --- CALM COMPUTING THEMING ---
  const isHighContrast = accessibilityMode === AccessibilityMode.SONIC_VIEW;
  const isFocusMode = accessibilityMode === AccessibilityMode.FOCUS_SHIELD && !isHighContrast;

  // Default to Paper (Calm) unless Focus/HighContrast
  const bgClass = isHighContrast ? 'bg-black text-yellow-400 font-mono' :
                  isFocusMode ? 'bg-ink-950 text-paper-50' : 
                  'bg-paper-50 text-ink-900';

  const toggleTheme = () => {
    setThemeMode(themeMode === ThemeMode.EARTH ? ThemeMode.NEBULA : ThemeMode.EARTH);
  };

  return (
    <AuthGuard>
      {!hasStartedOnboarding ? (
        <LandingPage />
      ) : (
        <div className={`min-h-screen font-sans selection:bg-soft-primary/30 overflow-hidden flex flex-col relative transition-colors duration-700 ease-in-out ${bgClass}`}>
          
          {/* AMBIENT LAYERS - Soft/Calm Only */}
          {!isHighContrast && !isFocusMode && (
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
               <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-soft-primary/10 rounded-full blur-[120px] animate-float" />
               <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-soft-accent/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
               <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-soft-sky/10 rounded-full blur-[100px] animate-breathe" />
            </div>
          )}

          {/* CONTEXT RESURRECTOR */}
          <AnimatePresence>
            {resumeBrief && focusSession.isActive && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
                  <h1 className="text-4xl font-light text-ink-900 mb-6">Welcome back.</h1>
                  <p className="text-xl text-ink-500 max-w-2xl mb-12 leading-relaxed">"{resumeBrief}"</p>
                  <button onClick={() => setResumeBrief(null)} className="px-12 py-6 bg-ink-900 text-white text-2xl font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-4 shadow-soft">
                    <Play className="w-8 h-8 fill-current" /> Resume
                  </button>
               </motion.div>
            )}
          </AnimatePresence>

          <div className={`flex-1 flex overflow-hidden relative z-10 transition-opacity duration-300 ${liveState.isStreaming ? 'opacity-90' : 'opacity-100'}`}>
            {context && accessibilityMode === AccessibilityMode.STANDARD && <Navigation />}
            <AnimatePresence><VisionModal /></AnimatePresence>
            
            <div className={`flex-1 flex flex-col h-full overflow-hidden relative z-10 transition-all duration-500 ${context && accessibilityMode === AccessibilityMode.STANDARD ? 'md:ml-20 mb-20 md:mb-0' : ''}`}>
              
              {/* HEADER */}
              {accessibilityMode !== AccessibilityMode.FOCUS_SHIELD && (
                <header className={`px-8 py-6 flex items-center justify-between shrink-0 z-40 ${isHighContrast ? 'bg-black border-b border-yellow-400' : 'bg-transparent'}`}>
                  <div className="flex items-center gap-3">
                     <div className="relative group">
                       <div className={`absolute inset-0 blur-lg rounded-full opacity-50 bg-soft-primary/30 transition-opacity group-hover:opacity-100`} />
                       <Hexagon className={`w-8 h-8 relative z-10 ${isHighContrast ? 'text-yellow-400' : 'text-soft-primary'}`} />
                     </div>
                     {!context && <span className={`font-semibold tracking-tight text-xl ${isHighContrast ? 'text-yellow-400' : 'text-ink-900'}`}>EntreprenOS</span>}
                     {context && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}><span className={`font-medium text-lg tracking-tight ml-2 ${isHighContrast ? 'text-yellow-400' : 'text-ink-900'}`}>{context.businessName}</span></motion.div>}
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isHighContrast ? 'border border-yellow-400 text-yellow-400' : 'bg-white border border-white shadow-sm text-ink-500'}`}>
                        <Accessibility className="w-3 h-3" /> {accessibilityMode}
                     </div>
                     <div className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium ${isHighContrast ? 'border border-yellow-400 text-yellow-400' : 'bg-white border border-white shadow-sm text-ink-500'}`}>
                        <span>{auth.user?.email}</span>
                     </div>
                  </div>
                </header>
              )}
              
              <main className="flex-1 overflow-hidden relative"> 
                 <AdaptiveRenderer />
              </main>

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
