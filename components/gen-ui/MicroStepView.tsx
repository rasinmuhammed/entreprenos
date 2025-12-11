
import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Zap, ArrowRight, Trophy, Lock } from 'lucide-react';
import { generateMicroTaskPlan } from '../../services/geminiService';

export const MicroStepView: React.FC = () => {
  const { focusSession, startFocusSession, completeMicroStep, endFocusSession, context } = useAppStore();
  const [newTaskInput, setNewTaskInput] = useState('');
  const [isExploding, setIsExploding] = useState(false);

  const handleStartTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim() || !context) return;
    setIsExploding(true);
    try {
      const plan = await generateMicroTaskPlan(newTaskInput, context.industry);
      startFocusSession(plan.title, plan.microTasks);
    } catch (err) { console.error(err); } finally { setIsExploding(false); setNewTaskInput(''); }
  };

  if (!focusSession.isActive) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-ink-950">
         <div className="mb-8 w-32 h-32 rounded-full bg-ink-900 border border-ink-800 flex items-center justify-center animate-pulse shadow-glow">
            <Zap className="w-16 h-16 text-white" />
         </div>
         <h1 className="text-5xl font-light text-white mb-6 tracking-tight">Focus Shield Active</h1>
         <form onSubmit={handleStartTask} className="w-full max-w-2xl relative">
           <input 
             autoFocus 
             type="text" 
             value={newTaskInput} 
             onChange={e => setNewTaskInput(e.target.value)} 
             disabled={isExploding} 
             placeholder="Enter one massive task..." 
             className="w-full bg-ink-900 border-2 border-ink-800 rounded-3xl px-10 py-8 text-3xl text-white placeholder-slate-600 focus:outline-none focus:border-tech-purple/50 transition-colors text-center shadow-2xl" 
           />
           {isExploding && (
             <div className="absolute inset-0 flex items-center justify-center bg-ink-950/90 rounded-3xl z-10 backdrop-blur-sm">
                <span className="font-mono text-xl animate-pulse text-white flex items-center gap-3">
                   <Zap className="w-5 h-5 text-tech-purple" /> EXPLODING TASK...
                </span>
             </div>
           )}
         </form>
      </div>
    );
  }

  const currentStep = focusSession.microSteps[focusSession.currentStepIndex];
  
  // Dependency Check
  const isBlocked = currentStep && currentStep.dependencies && currentStep.dependencies.length > 0 && currentStep.dependencies.some(id => {
     const dep = focusSession.microSteps.find(s => s.id === id);
     return dep && !dep.isComplete;
  });

  // Liquid Time Horizon Logic
  const duration = (currentStep?.estMinutes || 5) * 60 * 1000;
  const elapsed = Date.now() - focusSession.lastStepChangeTime;
  const timeProgress = Math.min((elapsed / duration) * 100, 100);
  const timeColor = timeProgress < 50 ? '#06b6d4' : timeProgress < 80 ? '#8b5cf6' : '#f43f5e';

  return (
    <div className="h-full flex flex-col items-center justify-center bg-ink-950 relative overflow-hidden text-slate-50">
      
      <div className="absolute top-8 right-8 z-50">
         <button onClick={endFocusSession} className="text-slate-500 hover:text-rose-400 text-xs font-mono uppercase tracking-widest font-bold transition-colors">
            ABORT MISSION
         </button>
      </div>

      <div className="max-w-5xl w-full px-8 text-center relative z-10">
        <AnimatePresence mode="wait">
           {currentStep ? (
             <motion.div key={currentStep.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
               <div className="text-slate-500 font-mono text-xl uppercase tracking-[0.2em] mb-8 font-bold">
                  Micro-Step {focusSession.currentStepIndex + 1} / {focusSession.microSteps.length}
               </div>
               
               {isBlocked ? (
                  <div className="bg-ink-900 border border-rose-900/50 p-12 rounded-[3rem] inline-flex flex-col items-center">
                     <Lock className="w-16 h-16 text-rose-500 mb-6" />
                     <h2 className="text-4xl font-bold text-white mb-2">Blocked by Dependency</h2>
                     <p className="text-slate-400 text-lg">Complete previous steps first to unlock this.</p>
                  </div>
               ) : (
                  <>
                    <h2 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight tracking-tight">{currentStep.title}</h2>
                    {currentStep.description && <p className="text-2xl text-slate-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">{currentStep.description}</p>}
                    
                    <div className="flex justify-center gap-4">
                       <button 
                         onClick={completeMicroStep} 
                         className="group relative inline-flex items-center justify-center px-24 py-10 bg-white text-ink-950 rounded-[2rem] text-4xl font-bold tracking-wide hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)]"
                       >
                          <span className="relative z-10 flex items-center gap-6">
                             DONE <ArrowRight className="w-12 h-12" />
                          </span>
                       </button>
                    </div>
                    {currentStep.rewardPoints > 0 && (
                       <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-400 font-mono text-sm uppercase tracking-widest font-bold border border-yellow-500/20">
                          <Trophy className="w-4 h-4" /> + {currentStep.rewardPoints} XP Reward
                       </div>
                    )}
                  </>
               )}
             </motion.div>
           ) : (
             <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
               <div className="w-40 h-40 rounded-full bg-yellow-500/20 flex items-center justify-center mb-8 border border-yellow-500/50 shadow-[0_0_100px_rgba(234,179,8,0.2)]">
                  <Trophy className="w-20 h-20 text-yellow-400 animate-bounce" />
               </div>
               <h2 className="text-7xl font-bold text-white mb-8 tracking-tighter">VICTORY!</h2>
               <button onClick={endFocusSession} className="px-16 py-6 bg-ink-900 hover:bg-ink-800 text-white rounded-2xl text-2xl font-bold border border-ink-800 transition-colors">
                  Return to Base
               </button>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
      
      {/* Liquid Time Horizon Bar */}
      <div className="absolute bottom-0 left-0 w-full h-3 bg-ink-900">
         <motion.div 
           className="h-full shadow-[0_0_20px_currentColor]" 
           animate={{ width: `${timeProgress}%`, backgroundColor: timeColor, color: timeColor }} 
           transition={{ type: "tween", ease: "linear", duration: 1 }} 
         />
      </div>
    </div>
  );
};
