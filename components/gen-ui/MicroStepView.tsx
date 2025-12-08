
import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Zap, ArrowRight, Trophy, Flame } from 'lucide-react';
import { explodeTask } from '../../services/geminiService';

export const MicroStepView: React.FC = () => {
  const { focusSession, startFocusSession, completeMicroStep, endFocusSession } = useAppStore();
  const [newTaskInput, setNewTaskInput] = useState('');
  const [isExploding, setIsExploding] = useState(false);

  const handleStartTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setIsExploding(true);
    try {
      const steps = await explodeTask(newTaskInput);
      startFocusSession(newTaskInput, steps);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExploding(false);
      setNewTaskInput('');
    }
  };

  // --- IDLE STATE: ENTER TASK ---
  if (!focusSession.isActive) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-300">
         <div className="mb-8 w-32 h-32 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center animate-pulse">
            <Zap className="w-16 h-16 text-white" />
         </div>
         <h1 className="text-5xl font-light text-white mb-6">Focus Shield Active</h1>
         <p className="text-zinc-500 mb-12 text-2xl max-w-xl mx-auto">Enter one massive task. We will explode it into tiny, easy wins.</p>
         
         <form onSubmit={handleStartTask} className="w-full max-w-2xl relative">
           <input 
             type="text" 
             value={newTaskInput}
             onChange={e => setNewTaskInput(e.target.value)}
             disabled={isExploding}
             placeholder="e.g. 'File Taxes'"
             className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-3xl px-10 py-8 text-3xl text-white placeholder-zinc-700 focus:outline-none focus:border-white/50 transition-colors text-center shadow-2xl"
             autoFocus
           />
           {isExploding && (
             <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 rounded-3xl z-10 backdrop-blur-sm">
               <span className="font-mono text-xl animate-pulse text-white">💥 EXPLODING TASK...</span>
             </div>
           )}
         </form>
      </div>
    );
  }

  // --- ACTIVE STATE: FOCUS MODE ---
  const currentStep = focusSession.microSteps[focusSession.currentStepIndex];
  const progress = (focusSession.currentStepIndex / focusSession.microSteps.length) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
      
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-4 bg-zinc-900">
        <motion.div 
          className="h-full bg-white box-shadow-[0_0_20px_white]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        />
      </div>

      <div className="absolute top-8 right-8 z-50">
        <button onClick={endFocusSession} className="text-zinc-600 hover:text-red-500 text-sm font-mono uppercase tracking-widest transition-colors">
           ABORT MISSION
        </button>
      </div>

      <div className="max-w-5xl w-full px-8 text-center relative z-10">
        <AnimatePresence mode="wait">
           {currentStep ? (
             <motion.div
               key={currentStep.id}
               initial={{ opacity: 0, scale: 0.8, rotateX: 90 }}
               animate={{ opacity: 1, scale: 1, rotateX: 0 }}
               exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
               transition={{ type: "spring", stiffness: 100 }}
             >
               <div className="text-zinc-500 font-mono text-xl uppercase tracking-[0.2em] mb-8">
                 Micro-Step {focusSession.currentStepIndex + 1} / {focusSession.microSteps.length}
               </div>
               
               <h2 className="text-6xl md:text-8xl font-bold text-white mb-20 leading-tight">
                 {currentStep.text}
               </h2>

               <div className="flex justify-center">
                 <button 
                   onClick={completeMicroStep}
                   className="group relative inline-flex items-center justify-center px-24 py-10 bg-white text-black rounded-[2rem] text-4xl font-bold tracking-wide hover:scale-105 transition-transform active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.5)]"
                 >
                   <span className="relative z-10 flex items-center gap-6">
                     DONE <ArrowRight className="w-10 h-10" />
                   </span>
                 </button>
               </div>
               
               {currentStep.durationMinutes && (
                 <div className="mt-8 text-zinc-600 font-mono">
                   ESTIMATED TIME: {currentStep.durationMinutes} MIN
                 </div>
               )}
             </motion.div>
           ) : (
             <motion.div
               key="complete"
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center"
             >
               <Trophy className="w-40 h-40 text-yellow-400 mb-8 animate-bounce" />
               <h2 className="text-7xl font-bold text-white mb-8">VICTORY!</h2>
               <p className="text-zinc-400 text-3xl mb-16">Task "{focusSession.taskName}" has been obliterated.</p>
               <button 
                 onClick={endFocusSession}
                 className="px-16 py-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-2xl font-medium transition-colors border border-zinc-700"
               >
                 Start Next Mission
               </button>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </div>
  );
};
