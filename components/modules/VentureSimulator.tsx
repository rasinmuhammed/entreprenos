
import React, { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, AlertTriangle, TrendingDown, TrendingUp, Shield, Skull, HeartPulse, RefreshCw, DollarSign } from 'lucide-react';
import { generateCrisisEvent, resolveCrisis } from '../../services/geminiService';
import { CrisisChoice } from '../../types';

export const VentureSimulator: React.FC = () => {
  const { 
    context, 
    simulation, 
    initSimulation, 
    setCrisisEvent, 
    applySimulationResult, 
    isSimulating, 
    setSimulating 
  } = useAppStore();

  const handleStart = () => {
    if (context) initSimulation(500000); // Start with $500k virtual cash
  };

  const handleNextTurn = async () => {
    if (!context) return;
    setSimulating(true);
    try {
      const event = await generateCrisisEvent(context, simulation.month);
      setCrisisEvent(event);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const handleChoice = async (choice: CrisisChoice) => {
    if (!context || !simulation.currentEvent) return;
    setSimulating(true);
    try {
      const result = await resolveCrisis(simulation.currentEvent, choice, context);
      applySimulationResult(result, choice);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  // Auto-start first event
  useEffect(() => {
    if (simulation.isActive && !simulation.currentEvent && simulation.history.length === 0 && !isSimulating) {
      handleNextTurn();
    }
  }, [simulation.isActive]);

  if (!simulation.isActive) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-32 h-32 rounded-full bg-tech-rose/10 flex items-center justify-center mb-8 shadow-glow relative">
           <Gamepad2 className="w-16 h-16 text-tech-rose" />
           <div className="absolute inset-0 border border-tech-rose/30 rounded-full animate-ping opacity-20" />
        </div>
        <h2 className="text-4xl font-light text-white mb-4">Venture Wargaming</h2>
        <p className="text-white/40 max-w-lg mb-8 leading-relaxed text-lg">
          Enter the flight simulator for your business. The AI will generate high-stakes "Black Swan" events. 
          Test your decision-making, manage virtual cash, and try to survive 12 months.
        </p>
        <button 
          onClick={handleStart}
          className="px-10 py-5 bg-tech-rose hover:bg-rose-600 text-white rounded-2xl font-medium tracking-wide flex items-center gap-3 transition-all hover:scale-105 shadow-2xl text-lg"
        >
          <AlertTriangle className="w-6 h-6" />
          Start Simulation
        </button>
      </div>
    );
  }

  // Game Over
  if (simulation.cashBalance <= 0 || simulation.reputationScore <= 0) {
    return (
       <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-rose-950/20">
          <Skull className="w-24 h-24 text-rose-500 mb-6" />
          <h2 className="text-5xl font-light text-white mb-2">VENTURE FAILED</h2>
          <p className="text-rose-200/60 mb-8 font-mono">You ran out of resources on Month {simulation.month}.</p>
          <button onClick={() => initSimulation(500000)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Restart
          </button>
       </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden flex gap-6 p-6">
      
      {/* LEFT: STATUS PANEL */}
      <GlassPane className="w-80 flex flex-col p-6 bg-nebula-900/40 relative overflow-hidden">
         <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
         
         <div className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-8 text-center">Flight Recorder</div>

         <div className="space-y-6">
            <div className="text-center">
               <div className="text-4xl font-light text-white font-mono mb-1">M{simulation.month}</div>
               <div className="text-xs text-white/40 uppercase">Current Month</div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
               <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-100">Capital</span>
               </div>
               <div className="text-2xl font-mono text-white">${simulation.cashBalance.toLocaleString()}</div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
               <div className="flex items-center gap-2 mb-2">
                  <HeartPulse className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-purple-100">Reputation</span>
               </div>
               <div className="w-full h-2 bg-nebula-950 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${simulation.reputationScore}%` }} />
               </div>
               <div className="text-right text-xs text-white/40">{simulation.reputationScore}%</div>
            </div>
         </div>

         {/* History Feed */}
         <div className="flex-1 mt-8 overflow-y-auto custom-scrollbar border-t border-white/5 pt-4">
             <div className="text-[10px] font-mono text-white/30 mb-4">EVENT LOG</div>
             <div className="space-y-4">
               {simulation.history.map((h, i) => (
                 <div key={i} className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                    <div className="text-rose-400 font-medium mb-1">{h.event.title}</div>
                    <div className="text-emerald-400 pl-2 border-l border-white/10">{h.result.outcomeTitle}</div>
                 </div>
               ))}
             </div>
         </div>
      </GlassPane>

      {/* RIGHT: ACTION CENTER */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto">
         <AnimatePresence mode="wait">
            
            {/* IS LOADING */}
            {isSimulating && (
               <motion.div 
                 key="loading"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="flex flex-col items-center justify-center"
               >
                 <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-6" />
                 <div className="font-mono text-rose-400 animate-pulse">CALCULATING IMPACT...</div>
               </motion.div>
            )}

            {/* EVENT VIEW */}
            {!isSimulating && simulation.currentEvent && (
               <motion.div
                 key="event"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, x: -50 }}
               >
                 <GlassPane className="p-10 border-rose-500/30 bg-rose-950/10 shadow-[0_0_50px_rgba(244,63,94,0.1)]">
                    <div className="flex items-center gap-3 mb-6">
                       <AlertTriangle className="w-8 h-8 text-rose-500 animate-pulse" />
                       <h2 className="text-3xl font-light text-white">CRITICAL ALERT</h2>
                    </div>
                    
                    <h3 className="text-2xl text-white font-medium mb-4">{simulation.currentEvent.title}</h3>
                    <p className="text-lg text-white/70 leading-relaxed mb-10">{simulation.currentEvent.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {simulation.currentEvent.choices.map((choice) => (
                         <button
                           key={choice.id}
                           onClick={() => handleChoice(choice)}
                           className="text-left p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-500/50 rounded-xl transition-all group"
                         >
                            <div className="flex justify-between items-start mb-3">
                               <span className="text-sm font-bold text-white group-hover:text-rose-400">Option {choice.id}</span>
                               <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase ${
                                 choice.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-400' :
                                 choice.riskLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                               }`}>
                                 {choice.riskLevel} Risk
                               </span>
                            </div>
                            <h4 className="text-white font-medium mb-2">{choice.title}</h4>
                            <p className="text-xs text-white/50 leading-relaxed">{choice.description}</p>
                         </button>
                       ))}
                    </div>
                 </GlassPane>
               </motion.div>
            )}

            {/* RESULT VIEW (Interim state before next turn) - In this simple version we jump to next turn or show history. 
                For better UX, we'll show a "Continue" screen if there is no current event but we are active.
            */}
            {!isSimulating && !simulation.currentEvent && simulation.history.length > 0 && (
               <motion.div
                 key="result"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="text-center"
               >
                  <div className="mb-8">
                     <div className="text-emerald-400 text-lg font-mono mb-2">REPORT INCOMING</div>
                     <h2 className="text-3xl text-white font-light">{simulation.history[0].result.outcomeTitle}</h2>
                     <p className="text-white/60 max-w-xl mx-auto mt-4">{simulation.history[0].result.outcomeDescription}</p>
                  </div>
                  
                  <div className="flex justify-center gap-8 mb-10">
                     <div className="text-center">
                        <div className="text-[10px] text-white/30 uppercase">Financial</div>
                        <div className={`text-xl font-mono ${simulation.history[0].result.financialImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                           {simulation.history[0].result.financialImpact > 0 ? '+' : ''}
                           ${simulation.history[0].result.financialImpact.toLocaleString()}
                        </div>
                     </div>
                     <div className="text-center">
                        <div className="text-[10px] text-white/30 uppercase">Reputation</div>
                        <div className={`text-xl font-mono ${simulation.history[0].result.reputationImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                           {simulation.history[0].result.reputationImpact > 0 ? '+' : ''}
                           {simulation.history[0].result.reputationImpact}
                        </div>
                     </div>
                  </div>

                  <button 
                    onClick={handleNextTurn}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
                  >
                    Proceed to Month {simulation.month + 1}
                  </button>
               </motion.div>
            )}

         </AnimatePresence>
      </div>

    </div>
  );
};
