
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

    updateBoardRoomState({ transcript: [], recommendation: undefined, risks: [], alternatives: [] });
    startBoardRoomSession(input);
    
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
    <div className="h-[calc(100vh-6rem)] flex gap-6 p-6 bg-slate-50/50">
      
      {/* LEFT: DEBATE ARENA */}
      <GlassPane className="flex-[2] flex flex-col overflow-hidden bg-white shadow-crisp border-slate-200 relative">
         <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-50 rounded-lg">
                  <Users className="w-5 h-5 text-indigo-600" />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-ink-950 tracking-tight">Board of Directors</h2>
                  <p className="text-xs text-ink-500">AI Advisory Council</p>
               </div>
            </div>
            <div className="flex gap-2">
               {['CEO', 'CFO', 'REALIST'].map((role) => (
                  <div key={role} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                     <div className={`w-2 h-2 rounded-full ${role === 'CEO' ? 'bg-indigo-500' : role === 'CFO' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                     <span className="text-[10px] font-bold text-ink-600 tracking-wide">{role}</span>
                  </div>
               ))}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30" ref={scrollRef}>
            {boardRoom.messages.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full text-ink-300">
                  <BrainCircuit className="w-16 h-16 mb-4 opacity-30" />
                  <p className="font-medium">Ask a strategic question to initiate debate.</p>
               </div>
            )}
            
            {boardRoom.messages.map((msg) => (
               <motion.div 
                 key={msg.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
               >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                     msg.sender === 'user' ? 'bg-white border-slate-200' : 
                     msg.sender === 'CEO' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                     msg.sender === 'CFO' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                     msg.sender === 'REALIST' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                     {msg.sender === 'user' ? <Users className="w-5 h-5 text-ink-600" /> : 
                      msg.sender === 'CEO' ? <Sparkles className="w-5 h-5" /> :
                      msg.sender === 'CFO' ? <TrendingUp className="w-5 h-5" /> :
                      msg.sender === 'REALIST' ? <ShieldAlert className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />
                     }
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                     msg.sender === 'user' ? 'bg-tech-purple text-white rounded-tr-none' : 
                     'bg-white border border-slate-200 text-ink-800 rounded-tl-none'
                  }`}>
                     <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${msg.sender === 'user' ? 'text-white/60' : 'text-ink-400'}`}>{msg.sender}</div>
                     {msg.text}
                  </div>
               </motion.div>
            ))}
            
            {boardRoom.isThinking && (
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center animate-pulse shadow-sm">
                     <BrainCircuit className="w-5 h-5 text-ink-300" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center shadow-sm">
                     <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" />
                     <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce delay-100" />
                     <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce delay-200" />
                  </div>
               </div>
            )}
         </div>

         {/* COMPOSER */}
         <div className="p-6 bg-white border-t border-slate-200">
            <div className="flex gap-2 mb-4">
               <span className="text-[10px] text-ink-400 font-bold uppercase py-1 tracking-wider">Optimize For:</span>
               {(['CASH_FLOW', 'GROWTH', 'RISK_REDUCTION'] as const).map(p => (
                  <button 
                    key={p}
                    onClick={() => togglePriority(p)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all ${
                       priorities.includes(p) 
                       ? 'bg-indigo-50 border-tech-purple text-tech-purple shadow-sm' 
                       : 'bg-white border-slate-200 text-ink-500 hover:text-ink-900 hover:border-slate-300'
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
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-14 py-4 text-ink-900 focus:outline-none focus:border-tech-purple focus:ring-1 focus:ring-tech-purple/20 transition-all placeholder-ink-400 shadow-inner"
               />
               <button 
                 type="submit" 
                 disabled={!input.trim() || boardRoom.isThinking}
                 className="absolute right-2 top-2 bottom-2 aspect-square bg-tech-purple hover:bg-indigo-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
               >
                  <Send className="w-5 h-5" />
               </button>
            </form>
         </div>
      </GlassPane>

      {/* RIGHT: CONSENSUS PANEL */}
      <div className="flex-1 flex flex-col gap-6">
         <GlassPane className="flex-1 p-8 bg-white border-slate-200 relative overflow-hidden shadow-crisp">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-emerald-50 rounded-lg">
                  <Target className="w-6 h-6 text-emerald-600" />
               </div>
               <h3 className="text-lg font-bold text-ink-900 tracking-tight">Recommendation</h3>
            </div>
            
            {boardRoom.recommendation ? (
               <div className="space-y-6 flex flex-col h-full">
                  <p className="text-lg text-ink-800 font-medium leading-relaxed">
                     {boardRoom.recommendation}
                  </p>
                  
                  {boardRoom.risks && boardRoom.risks.length > 0 && (
                     <div className="p-5 bg-rose-50 border border-rose-100 rounded-xl">
                        <div className="text-xs text-rose-600 font-bold uppercase mb-3 flex items-center gap-2 tracking-wide">
                           <AlertTriangle className="w-3.5 h-3.5" /> Key Risks
                        </div>
                        <ul className="space-y-2">
                           {boardRoom.risks.map((risk, i) => (
                              <li key={i} className="text-sm text-rose-700 flex items-start gap-2">
                                 <span className="mt-1.5 w-1 h-1 bg-rose-400 rounded-full" />
                                 {risk}
                              </li>
                           ))}
                        </ul>
                     </div>
                  )}

                  <button 
                    onClick={handleCreateActionPlan}
                    className="w-full py-4 bg-tech-purple text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors shadow-lg hover:shadow-xl mt-auto"
                  >
                     <Zap className="w-5 h-5 fill-white/20" />
                     Turn into Action Plan
                  </button>
               </div>
            ) : (
               <div className="h-full flex items-center justify-center text-ink-300 text-center text-sm font-medium">
                  Debate in progress...<br/>Recommendation pending.
               </div>
            )}
         </GlassPane>
         
         <GlassPane className="h-1/3 p-6 bg-slate-50 border-slate-200 shadow-crisp">
            <div className="flex items-center gap-2 mb-4">
               <GitBranch className="w-4 h-4 text-ink-400" />
               <h3 className="text-sm font-bold text-ink-700 uppercase tracking-wide">Alternatives</h3>
            </div>
            {boardRoom.alternatives && boardRoom.alternatives.length > 0 ? (
               <ul className="space-y-3">
                  {boardRoom.alternatives.map((alt, i) => (
                     <li key={i} className="text-sm text-ink-600 flex gap-2 leading-snug">
                        <span className="text-ink-300 font-bold">•</span> {alt}
                     </li>
                  ))}
               </ul>
            ) : (
               <p className="text-ink-300 text-xs italic">No alternatives generated yet.</p>
            )}
         </GlassPane>
      </div>

    </div>
  );
};
    