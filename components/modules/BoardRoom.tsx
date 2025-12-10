
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { AgentOrchestrator } from '../../services/agentOrchestrator';
import { BoardRole } from '../../types';
import { GlassPane } from '../ui/GlassPane';
import { BrainCircuit, Briefcase, TrendingUp, Users, Send, Sparkles, BookPlus, AlertTriangle, GitBranch, Target, ShieldAlert, Zap } from 'lucide-react';
import { generateMicroTaskPlan } from '../../services/geminiService';

export const BoardRoom: React.FC = () => {
  const { 
    boardRoom, 
    context, 
    startBoardRoomSession,
    setBoardRoomThinking, 
    setBoardRoomConsensus,
    addLogEntry,
    updateBoardRoomState,
    startFocusSession
  } = useAppStore();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [priorities, setPriorities] = useState<('CASH_FLOW' | 'GROWTH' | 'RISK_REDUCTION')[]>(['GROWTH']);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [boardRoom.messages, boardRoom.isThinking]);

  const togglePriority = (p: 'CASH_FLOW' | 'GROWTH' | 'RISK_REDUCTION') => {
    setPriorities(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !context) return;

    // Reset previous state
    updateBoardRoomState({ transcript: [], recommendation: undefined, risks: [], alternatives: [] });
    startBoardRoomSession(input);
    
    // Trigger orchestration
    try {
      const result = await AgentOrchestrator.runBoardRoomDebate({
        id: Math.random().toString(),
        userId: 'user',
        question: input,
        priorities: priorities,
        contextDocs: [context.industry, context.description]
      });
      
      updateBoardRoomState({
        recommendation: result.finalRecommendation,
        risks: result.risks,
        alternatives: result.alternatives
      });
    } catch (err) {
      console.error(err);
      setBoardRoomThinking(false);
    }
    
    setInput('');
  };

  const handleCreateActionPlan = async () => {
    if (!boardRoom.recommendation || !context) return;
    try {
      const plan = await generateMicroTaskPlan(boardRoom.recommendation, context.industry);
      startFocusSession(plan.title, plan.microTasks);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6 p-6">
      
      {/* LEFT: DEBATE ARENA */}
      <GlassPane className="flex-[2] flex flex-col overflow-hidden bg-nebula-900/40 relative">
         <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
               <Users className="w-6 h-6 text-white" />
               <h2 className="text-xl font-light text-white">Board of Directors</h2>
            </div>
            <div className="flex gap-2">
               {['CEO', 'CFO', 'REALIST'].map((role) => (
                  <div key={role} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                     <div className={`w-2 h-2 rounded-full ${role === 'CEO' ? 'bg-indigo-400' : role === 'CFO' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                     <span className="text-[10px] font-mono text-white/50">{role}</span>
                  </div>
               ))}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
            {boardRoom.messages.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full text-white/20">
                  <BrainCircuit className="w-16 h-16 mb-4" />
                  <p>Ask a strategic question to initiate debate.</p>
               </div>
            )}
            
            {boardRoom.messages.map((msg) => (
               <motion.div 
                 key={msg.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
               >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/10 ${
                     msg.sender === 'user' ? 'bg-white/10' : 
                     msg.sender === 'CEO' ? 'bg-indigo-500/20 text-indigo-400' :
                     msg.sender === 'CFO' ? 'bg-emerald-500/20 text-emerald-400' :
                     msg.sender === 'REALIST' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-white/40'
                  }`}>
                     {msg.sender === 'user' ? <Users className="w-5 h-5" /> : 
                      msg.sender === 'CEO' ? <Sparkles className="w-5 h-5" /> :
                      msg.sender === 'CFO' ? <TrendingUp className="w-5 h-5" /> :
                      msg.sender === 'REALIST' ? <ShieldAlert className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />
                     }
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                     msg.sender === 'user' ? 'bg-white text-nebula-950 rounded-tr-none' : 
                     'bg-white/5 border border-white/5 text-white/90 rounded-tl-none'
                  }`}>
                     <div className="text-[10px] font-mono opacity-50 mb-1 uppercase">{msg.sender}</div>
                     {msg.text}
                  </div>
               </motion.div>
            ))}
            
            {boardRoom.isThinking && (
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                     <BrainCircuit className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center">
                     <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                     <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-100" />
                     <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-200" />
                  </div>
               </div>
            )}
         </div>

         {/* COMPOSER */}
         <div className="p-6 bg-nebula-950/50 border-t border-white/10">
            <div className="flex gap-2 mb-4">
               <span className="text-[10px] text-white/40 font-mono uppercase py-1">Optimize For:</span>
               {(['CASH_FLOW', 'GROWTH', 'RISK_REDUCTION'] as const).map(p => (
                  <button 
                    key={p}
                    onClick={() => togglePriority(p)}
                    className={`px-3 py-1 rounded text-[10px] font-mono border transition-all ${
                       priorities.includes(p) 
                       ? 'bg-tech-cyan/20 border-tech-cyan text-tech-cyan' 
                       : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                    }`}
                  >
                     {p.replace('_', ' ')}
                  </button>
               ))}
            </div>
            <form onSubmit={handleSendMessage} className="relative">
               <input 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder="What strategic decision are you stuck on?"
                 className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white focus:outline-none focus:border-tech-cyan/50 transition-colors"
               />
               <button 
                 type="submit" 
                 disabled={!input.trim() || boardRoom.isThinking}
                 className="absolute right-2 top-2 bottom-2 aspect-square bg-tech-cyan hover:bg-cyan-400 text-nebula-950 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                  <Send className="w-5 h-5" />
               </button>
            </form>
         </div>
      </GlassPane>

      {/* RIGHT: CONSENSUS PANEL */}
      <div className="flex-1 flex flex-col gap-6">
         <GlassPane className="flex-1 p-8 bg-gradient-to-b from-emerald-900/20 to-nebula-900/40">
            <div className="flex items-center gap-3 mb-6">
               <Target className="w-6 h-6 text-emerald-400" />
               <h3 className="text-lg font-medium text-white">Board Recommendation</h3>
            </div>
            
            {boardRoom.recommendation ? (
               <div className="space-y-6">
                  <p className="text-xl text-white font-light leading-relaxed">
                     {boardRoom.recommendation}
                  </p>
                  
                  {boardRoom.risks && boardRoom.risks.length > 0 && (
                     <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <div className="text-xs text-rose-400 font-bold uppercase mb-2 flex items-center gap-2">
                           <AlertTriangle className="w-3 h-3" /> Key Risks
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                           {boardRoom.risks.map((risk, i) => (
                              <li key={i} className="text-sm text-rose-200/80">{risk}</li>
                           ))}
                        </ul>
                     </div>
                  )}

                  <button 
                    onClick={handleCreateActionPlan}
                    className="w-full py-4 bg-white text-nebula-950 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-glow"
                  >
                     <Zap className="w-5 h-5 text-tech-purple" />
                     Turn into Action Plan
                  </button>
               </div>
            ) : (
               <div className="h-full flex items-center justify-center text-white/20 text-center text-sm">
                  Debate in progress...<br/>Recommendation will appear here.
               </div>
            )}
         </GlassPane>
         
         <GlassPane className="h-1/3 p-6">
            <div className="flex items-center gap-2 mb-4">
               <GitBranch className="w-4 h-4 text-tech-purple" />
               <h3 className="text-sm font-medium text-white">Alternatives Considered</h3>
            </div>
            {boardRoom.alternatives && boardRoom.alternatives.length > 0 ? (
               <ul className="space-y-3">
                  {boardRoom.alternatives.map((alt, i) => (
                     <li key={i} className="text-sm text-white/60 flex gap-2">
                        <span className="text-white/20">•</span> {alt}
                     </li>
                  ))}
               </ul>
            ) : (
               <p className="text-white/20 text-xs">No alternatives generated yet.</p>
            )}
         </GlassPane>
      </div>

    </div>
  );
};
