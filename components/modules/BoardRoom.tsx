
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { AgentOrchestrator } from '../../services/agentOrchestrator';
import { AgentPersona, LogType, WidgetType, BoardRole } from '../../types';
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

  const handleStartDebate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !context) return;

    startBoardRoomSession(input);
    updateBoardRoomState({ transcript: [], recommendation: undefined, risks: [], alternatives: [] });

    try {
      const result = await AgentOrchestrator.runBoardRoomDebate({
        id: Math.random().toString(),
        userId: 'user',
        question: input,
        priorities: priorities,
        contextDocs: [`Industry: ${context.industry}`, `Description: ${context.description}`]
      });
      
      updateBoardRoomState({
        recommendation: result.finalRecommendation,
        risks: result.risks,
        alternatives: result.alternatives
      });

    } catch (e) {
      console.error(e);
      setBoardRoomThinking(false);
    }
    setInput('');
  };

  const handleConvertToPlan = async () => {
    if (!boardRoom.recommendation || !context) return;
    try {
      const plan = await generateMicroTaskPlan("Execute Strategy: " + boardRoom.recommendation.slice(0, 30) + "...", context.industry);
      startFocusSession(plan.title, plan.microTasks);
    } catch (e) {
      console.error("Failed to convert to plan", e);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 p-6 overflow-hidden">
      
      {/* LEFT: DEBATE ARENA */}
      <GlassPane className="flex-[2] flex flex-col border-white/10 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-cyan-400 w-6 h-6 animate-pulse" />
            <div>
              <h2 className="text-2xl font-light tracking-wide text-white">BoardRoom <span className="text-white/40 font-mono text-sm">Strategy Engine</span></h2>
              <div className="text-[10px] text-white/40 font-mono tracking-wider uppercase flex items-center gap-2">
                 <span className={`w-1.5 h-1.5 rounded-full ${boardRoom.isThinking ? 'bg-purple-500 animate-ping' : 'bg-emerald-500'} `}></span>
                 {boardRoom.isThinking ? "AGENTS DELIBERATING..." : "BOARD IS SEATED"}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 relative" ref={scrollRef}>
           {boardRoom.messages.length === 0 && !boardRoom.isThinking && (
             <div className="text-center text-white/20 py-20">
               <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
               <p>Ask a strategic question to convene the board.</p>
             </div>
           )}

            {boardRoom.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.sender === AgentPersona.CEO ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-4 ${msg.sender === AgentPersona.CEO ? 'flex-row-reverse' : ''}`}
              >
                <Avatar persona={msg.sender} />
                <div className={`max-w-[80%] p-6 rounded-2xl border backdrop-blur-md shadow-lg ${getBubbleStyle(msg.sender)}`}>
                  <div className="flex items-center gap-2 mb-2 opacity-60">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">{msg.sender}</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </motion.div>
            ))}
            <div className="h-4" />
        </div>

        {/* Question Composer */}
        <div className="p-6 bg-nebula-950/50 border-t border-white/10">
          <div className="flex gap-2 mb-4">
             {['CASH_FLOW', 'GROWTH', 'RISK_REDUCTION'].map(p => (
                <button 
                  key={p} 
                  onClick={() => togglePriority(p as any)}
                  className={`text-[10px] px-3 py-1 rounded-full border transition-all uppercase tracking-wider ${priorities.includes(p as any) ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
                >
                  {p.replace('_', ' ')}
                </button>
             ))}
          </div>
          <form onSubmit={handleStartDebate} className="relative group">
              <div className="relative flex items-center bg-nebula-900/90 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                 <input
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   disabled={boardRoom.isThinking}
                   placeholder="What strategic decision are you facing?"
                   className="flex-1 bg-transparent border-none text-white placeholder-white/30 px-6 py-4 focus:outline-none text-base"
                 />
                 <button 
                   type="submit" 
                   disabled={!input.trim() || boardRoom.isThinking}
                   className="p-4 text-cyan-400 hover:text-white transition-colors disabled:opacity-30"
                 >
                   <Send className="w-5 h-5" />
                 </button>
              </div>
            </form>
        </div>
      </GlassPane>

      {/* RIGHT: DECISION SUMMARY */}
      <GlassPane className="flex-1 flex flex-col p-6 bg-nebula-900/40 border-white/5">
         <div className="flex items-center gap-2 mb-6">
           <Zap className="w-5 h-5 text-yellow-400" />
           <h3 className="text-lg font-light text-white">Decision Memorandum</h3>
         </div>

         {boardRoom.recommendation ? (
           <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                 <div className="text-emerald-400 text-xs font-mono uppercase mb-2">Final Recommendation</div>
                 <p className="text-white leading-relaxed">{boardRoom.recommendation}</p>
              </div>

              <div>
                 <div className="text-rose-400 text-xs font-mono uppercase mb-2 flex items-center gap-2"><ShieldAlert className="w-3 h-3"/> Identified Risks</div>
                 <ul className="space-y-2">
                    {boardRoom.risks?.map((risk, i) => (
                       <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                          <span className="text-rose-500 mt-1">•</span> {risk}
                       </li>
                    ))}
                 </ul>
              </div>

              <div>
                 <div className="text-cyan-400 text-xs font-mono uppercase mb-2 flex items-center gap-2"><GitBranch className="w-3 h-3"/> Alternatives</div>
                 <ul className="space-y-2">
                    {boardRoom.alternatives?.map((alt, i) => (
                       <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                          <span className="text-cyan-500 mt-1">•</span> {alt}
                       </li>
                    ))}
                 </ul>
              </div>

              <button 
                onClick={handleConvertToPlan}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 shadow-lg mt-auto"
              >
                 <Target className="w-4 h-4" /> Turn into Action Plan
              </button>
           </div>
         ) : (
           <div className="flex-1 flex items-center justify-center text-center opacity-30">
              <div>
                 <Briefcase className="w-12 h-12 mx-auto mb-4" />
                 <p>Awaiting Board Consensus</p>
              </div>
           </div>
         )}
      </GlassPane>

    </div>
  );
};

const Avatar: React.FC<{ persona: string }> = ({ persona }) => {
  const icon = {
    [AgentPersona.CEO]: <TrendingUp className="w-5 h-5 text-purple-200" />,
    [AgentPersona.CFO]: <Briefcase className="w-5 h-5 text-emerald-200" />,
    [AgentPersona.REALIST]: <Users className="w-5 h-5 text-orange-200" />,
    'system': <BrainCircuit className="w-5 h-5 text-gray-400" />
  }[persona];

  const color = {
    [AgentPersona.CEO]: "bg-gradient-to-br from-purple-600 to-purple-800",
    [AgentPersona.CFO]: "bg-gradient-to-br from-emerald-600 to-emerald-800",
    [AgentPersona.REALIST]: "bg-gradient-to-br from-orange-600 to-orange-800",
    'system': "bg-gray-700"
  }[persona];

  return (
    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-lg border border-white/10 ${color}`}>
      {icon}
    </div>
  );
};

const getBubbleStyle = (persona: string) => {
  switch (persona) {
    case AgentPersona.CEO: return "bg-purple-900/10 border-purple-500/20 text-purple-50";
    case AgentPersona.CFO: return "bg-emerald-900/10 border-emerald-500/20 text-emerald-50";
    case AgentPersona.REALIST: return "bg-orange-900/10 border-orange-500/20 text-orange-50";
    default: return "bg-gray-800 border-gray-700 text-gray-300";
  }
};
