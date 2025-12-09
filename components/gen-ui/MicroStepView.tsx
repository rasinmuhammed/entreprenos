
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
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-300">
         <div className="mb-8 w-32 h-32 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center animate-pulse"><Zap className="w-16 h-16 text-white" /></div>
         <h1 className="text-5xl font-light text-white mb-6">Focus Shield Active</h1>
         <form onSubmit={handleStartTask} className="w-full max-w-2xl relative">
           <input autoFocus type="text" value={newTaskInput} onChange={e => setNewTaskInput(e.target.value)} disabled={isExploding} placeholder="Enter one massive task..." className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-3xl px-10 py-8 text-3xl text-white placeholder-zinc-700 focus:outline-none focus:border-white/50 transition-colors text-center shadow-2xl" />
           {isExploding && <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 rounded-3xl z-10 backdrop-blur-sm"><span className="font-mono text-xl animate-pulse text-white">💥 EXPLODING TASK...</span></div>}
         </form>
      </div>
    );
  }

  const currentStep = focusSession.microSteps[focusSession.currentStepIndex];
  
  // Dependency Check
  const isBlocked = currentStep && currentStep.dependencies && currentStep.dependencies.length > 0 && currentStep.dependencies.some(id => {
     // Check if dependency is complete
     const dep = focusSession.microSteps.find(s => s.id === id);
     return dep && !dep.isComplete;
  });

  // Liquid Time Horizon Logic
  const duration = (currentStep?.estMinutes || 5) * 60 * 1000;
  const elapsed = Date.now() - focusSession.lastStepChangeTime;
  const timeProgress = Math.min((elapsed / duration) * 100, 100);
  const timeColor = timeProgress < 50 ? '#06b6d4' : timeProgress < 80 ? '#8b5cf6' : '#f43f5e';

  return (
    <div className="h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute top-8 right-8 z-50"><button onClick={endFocusSession} className="text-zinc-600 hover:text-red-500 text-sm font-mono uppercase tracking-widest">ABORT MISSION</button></div>
      <div className="max-w-5xl w-full px-8 text-center relative z-10">
        <AnimatePresence mode="wait">
           {currentStep ? (
             <motion.div key={currentStep.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
               <div className="text-zinc-500 font-mono text-xl uppercase tracking-[0.2em] mb-8">Micro-Step {focusSession.currentStepIndex + 1} / {focusSession.microSteps.length}</div>
               
               {isBlocked ? (
                  <div className="bg-zinc-900/50 border border-red-500/20 p-8 rounded-3xl inline-flex flex-col items-center">
                     <Lock className="w-12 h-12 text-red-500 mb-4" />
                     <h2 className="text-3xl text-zinc-400">Blocked by Dependency</h2>
                     <p className="text-zinc-600 mt-2">Complete previous steps first.</p>
                  </div>
               ) : (
                  <>
                    <h2 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">{currentStep.title}</h2>
                    {currentStep.description && <p className="text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto">{currentStep.description}</p>}
                    
                    <div className="flex justify-center gap-4">
                       <button onClick={completeMicroStep} className="group relative inline-flex items-center justify-center px-24 py-10 bg-white text-black rounded-[2rem] text-4xl font-bold tracking-wide hover:scale-105 transition-transform"><span className="relative z-10 flex items-center gap-6">DONE <ArrowRight className="w-10 h-10" /></span></button>
                    </div>
                    {currentStep.rewardPoints > 0 && <div className="mt-8 text-yellow-500 font-mono text-sm uppercase tracking-widest">+ {currentStep.rewardPoints} XP Reward</div>}
                  </>
               )}
             </motion.div>
           ) : (
             <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
               <Trophy className="w-40 h-40 text-yellow-400 mb-8 animate-bounce" /><h2 className="text-7xl font-bold text-white mb-8">VICTORY!</h2><button onClick={endFocusSession} className="px-16 py-6 bg-zinc-800 text-white rounded-2xl text-2xl border border-zinc-700">Next Mission</button>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
      {/* Liquid Time Horizon Bar */}
      <div className="absolute bottom-0 left-0 w-full h-6 bg-zinc-900">
         <motion.div className="h-full" animate={{ width: `${timeProgress}%`, backgroundColor: timeColor }} transition={{ type: "tween", ease: "linear", duration: 1 }} />
      </div>
    </div>
  );
};
