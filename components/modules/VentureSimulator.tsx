
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
    if (context) initSimulation(500000); 
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

  useEffect(() => {
    if (simulation.isActive && !simulation.currentEvent && simulation.history.length === 0 && !isSimulating) {
      handleNextTurn();
    }
  }, [simulation.isActive]);

  if (!simulation.isActive) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-32 h-32 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-8 shadow-glow relative">
           <Gamepad2 className="w-16 h-16 text-rose-500" />
           <div className="absolute inset-0 border border-rose-200 rounded-full animate-ping opacity-50" />
        </div>
        <h2 className="text-4xl font-bold text-ink-900 mb-4 tracking-tight">Venture Wargaming</h2>
        <p className="text-ink-500 max-w-lg mb-8 leading-relaxed text-lg">
          Enter the flight simulator for your business. The AI will generate high-stakes "Black Swan" events. 
          Test your decision-making, manage virtual cash, and try to survive 12 months.
        </p>
        <button 
          onClick={handleStart}
          className="px-10 py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold tracking-wide flex items-center gap-3 transition-all hover:scale-105 shadow-xl shadow-rose-500/20 text-lg"
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
       <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-rose-50">
          <Skull className="w-24 h-24 text-rose-500 mb-6" />
          <h2 className="text-5xl font-bold text-ink-900 mb-2">VENTURE FAILED</h2>
          <p className="text-rose-700 mb-8 font-mono font-medium">You ran out of resources on Month {simulation.month}.</p>
          <button onClick={() => initSimulation(500000)} className="px-6 py-3 bg-white hover:bg-white/80 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2 shadow-sm font-bold">
            <RefreshCw className="w-4 h-4" /> Restart
          </button>
       </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden flex gap-6 p-6">
      
      {/* LEFT: STATUS PANEL */}
      <GlassPane className="w-80 flex flex-col p-6 bg-slate-50 border-slate-200 relative overflow-hidden">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-100 pointer-events-none" />
         
         <div className="text-[10px] font-mono uppercase tracking-widest text-ink-400 mb-8 text-center font-bold">Flight Recorder</div>

         <div className="space-y-6 relative z-10">
            <div className="text-center">
               <div className="text-4xl font-bold text-ink-900 font-mono mb-1">M{simulation.month}</div>
               <div className="text-xs text-ink-500 uppercase font-bold">Current Month</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700 uppercase">Capital</span>
               </div>
               <div className="text-2xl font-mono text-ink-900 font-medium">${simulation.cashBalance.toLocaleString()}</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                  <HeartPulse className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-bold text-purple-700 uppercase">Reputation</span>
               </div>
               <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${simulation.reputationScore}%` }} />
               </div>
               <div className="text-right text-xs text-ink-400 font-mono">{simulation.reputationScore}%</div>
            </div>
         </div>

         {/* History Feed */}
         <div className="flex-1 mt-8 overflow-y-auto custom-scrollbar border-t border-slate-200 pt-4 relative z-10">
             <div className="text-[10px] font-mono text-ink-400 mb-4 font-bold uppercase">EVENT LOG</div>
             <div className="space-y-4">
               {simulation.history.map((h, i) => (
                 <div key={i} className="text-xs opacity-80 hover:opacity-100 transition-opacity">
                    <div className="text-rose-600 font-bold mb-1">{h.event.title}</div>
                    <div className="text-emerald-600 pl-2 border-l-2 border-slate-200 font-medium">{h.result.outcomeTitle}</div>
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
                 <div className="font-mono text-rose-500 animate-pulse font-bold">CALCULATING IMPACT...</div>
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
                 <GlassPane className="p-10 border-rose-200 bg-rose-50/50 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
                    <div className="flex items-center gap-3 mb-6">
                       <AlertTriangle className="w-8 h-8 text-rose-500 animate-pulse" />
                       <h2 className="text-3xl font-bold text-ink-900">CRITICAL ALERT</h2>
                    </div>
                    
                    <h3 className="text-2xl text-ink-900 font-bold mb-4">{simulation.currentEvent.title}</h3>
                    <p className="text-lg text-ink-600 leading-relaxed mb-10 font-medium">{simulation.currentEvent.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {simulation.currentEvent.choices.map((choice) => (
                         <button
                           key={choice.id}
                           onClick={() => handleChoice(choice)}
                           className="text-left p-6 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl transition-all group shadow-sm hover:shadow-md"
                         >
                            <div className="flex justify-between items-start mb-3">
                               <span className="text-sm font-bold text-ink-900 group-hover:text-rose-600">Option {choice.id}</span>
                               <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                                 choice.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' :
                                 choice.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                               }`}>
                                 {choice.riskLevel} Risk
                               </span>
                            </div>
                            <h4 className="text-ink-900 font-bold mb-2 text-sm">{choice.title}</h4>
                            <p className="text-xs text-ink-500 leading-relaxed">{choice.description}</p>
                         </button>
                       ))}
                    </div>
                 </GlassPane>
               </motion.div>
            )}

            {/* RESULT VIEW */}
            {!isSimulating && !simulation.currentEvent && simulation.history.length > 0 && (
               <motion.div
                 key="result"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="text-center"
               >
                  <div className="mb-8 p-8 bg-white rounded-2xl border border-slate-200 shadow-crisp">
                     <div className="text-emerald-600 text-lg font-mono mb-2 font-bold uppercase tracking-wider">Report Incoming</div>
                     <h2 className="text-3xl text-ink-900 font-bold">{simulation.history[0].result.outcomeTitle}</h2>
                     <p className="text-ink-600 max-w-xl mx-auto mt-4 text-lg">{simulation.history[0].result.outcomeDescription}</p>
                  
                     <div className="flex justify-center gap-8 mt-10">
                        <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 w-32">
                           <div className="text-[10px] text-ink-400 uppercase font-bold mb-1">Financial</div>
                           <div className={`text-xl font-mono font-bold ${simulation.history[0].result.financialImpact >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {simulation.history[0].result.financialImpact > 0 ? '+' : ''}
                              ${simulation.history[0].result.financialImpact.toLocaleString()}
                           </div>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 w-32">
                           <div className="text-[10px] text-ink-400 uppercase font-bold mb-1">Reputation</div>
                           <div className={`text-xl font-mono font-bold ${simulation.history[0].result.reputationImpact >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {simulation.history[0].result.reputationImpact > 0 ? '+' : ''}
                              {simulation.history[0].result.reputationImpact}
                           </div>
                        </div>
                     </div>
                  </div>

                  <button 
                    onClick={handleNextTurn}
                    className="px-8 py-4 bg-tech-purple hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
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
