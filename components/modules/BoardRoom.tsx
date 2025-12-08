import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { runBoardroomDebate } from '../../services/geminiService';
import { AgentPersona, LogType, WidgetType } from '../../types';
import { GlassPane } from '../ui/GlassPane';
import { BrainCircuit, Briefcase, TrendingUp, Users, Send, Sparkles, BookPlus, AlertTriangle, GitBranch } from 'lucide-react';
import { DynamicWidget } from './DynamicWidget';

export const BoardRoom: React.FC = () => {
  const { 
    boardRoom, 
    context, 
    widgets,
    addBoardRoomMessage, 
    clearBoardRoomMessages,
    setBoardRoomThinking, 
    setBoardRoomConsensus,
    addLogEntry
  } = useAppStore();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Filter critical widgets for the side panel
  const criticalWidgets = widgets.filter(w => 
    w.type === WidgetType.ALERT_PANEL || 
    w.type === WidgetType.ROADMAP_STRATEGY
  );

  useEffect(() => {
    if (context && !hasInitialized) {
      setHasInitialized(true);
      if (boardRoom.messages.length === 0 && boardRoom.topic) {
        runDebateSequence(boardRoom.topic);
      }
    }
  }, [boardRoom.topic, context]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [boardRoom.messages, boardRoom.isThinking]);

  const runDebateSequence = async (topic: string) => {
    if (!context) return;

    clearBoardRoomMessages();
    setBoardRoomThinking(true);
    
    try {
      const result = await runBoardroomDebate(topic, context.description);
      
      setBoardRoomThinking(false);
      
      for (const msg of result.dialogue) {
        await new Promise(r => setTimeout(r, 1200)); 
        addBoardRoomMessage({
          id: Math.random().toString(),
          sender: msg.sender || msg.speaker as AgentPersona,
          text: msg.text,
          timestamp: Date.now()
        });
      }

      await new Promise(r => setTimeout(r, 1000));
      setBoardRoomConsensus(result.consensus);

    } catch (e) {
      console.error(e);
      setBoardRoomThinking(false);
      addBoardRoomMessage({
        id: "error",
        sender: 'system',
        text: "Connection interrupted. Debate halted.",
        timestamp: Date.now()
      });
    }
  };

  const handleNewTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || boardRoom.isThinking) return;
    runDebateSequence(input);
    setInput('');
  };

  const handleLogConsensus = () => {
    if (!boardRoom.consensus) return;
    addLogEntry({
      id: Math.random().toString(),
      type: LogType.DECISION,
      content: boardRoom.consensus,
      timestamp: Date.now(),
      tags: ["BoardRoom", "Consensus"]
    });
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
              <h2 className="text-2xl font-light tracking-wide text-white">BoardRoom <span className="text-white/40 font-mono text-sm">Active Session</span></h2>
              <div className="text-[10px] text-white/40 font-mono tracking-wider uppercase flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                 Neural Agents Online
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 relative" ref={scrollRef}>
           {/* Thinking Overlay */}
           <AnimatePresence>
            {boardRoom.isThinking && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-nebula-950/50 backdrop-blur-sm pointer-events-none"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <span className="text-xs font-mono text-cyan-300 tracking-widest">DELIBERATING...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

           {boardRoom.messages.length === 0 && !boardRoom.isThinking && (
             <div className="text-center text-white/20 py-20">
               <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
               <p>Initiate a session to start the debate.</p>
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
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}

            {boardRoom.consensus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="my-8 p-8 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border border-cyan-500/30 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
                <div className="flex justify-between items-start mb-4">
                   <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Final Consensus
                  </h3>
                  <button 
                    onClick={handleLogConsensus}
                    className="text-xs flex items-center gap-1 bg-white/10 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <BookPlus className="w-3 h-3" /> Log Decision
                  </button>
                </div>
                <p className="text-white text-lg font-light leading-relaxed">{boardRoom.consensus}</p>
              </motion.div>
            )}
            
            <div className="h-4" />
        </div>

        {/* Input */}
        <div className="p-6 bg-nebula-950/50 border-t border-white/10">
          <form onSubmit={handleNewTopic} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center bg-nebula-900/90 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                 <input
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   disabled={boardRoom.isThinking}
                   placeholder={boardRoom.messages.length > 0 ? "Ask a follow-up..." : "Start a new debate topic..."}
                   className="flex-1 bg-transparent border-none text-white placeholder-white/30 px-6 py-4 focus:outline-none focus:ring-0 text-base"
                 />
                 <button 
                   type="submit" 
                   disabled={!input.trim() || boardRoom.isThinking}
                   className="p-4 text-cyan-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                   <Send className="w-5 h-5" />
                 </button>
              </div>
            </form>
        </div>
      </GlassPane>

      {/* RIGHT: CONTEXT SIDEBAR */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
         <div className="flex items-center gap-2 text-white/50 mb-2 px-2">
           <AlertTriangle className="w-4 h-4" />
           <span className="text-xs font-mono uppercase tracking-widest">Critical Requirements</span>
         </div>
         
         {criticalWidgets.length > 0 ? (
           criticalWidgets.map(widget => (
             <motion.div 
               key={widget.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
             >
               <DynamicWidget widget={widget} />
             </motion.div>
           ))
         ) : (
           <div className="p-8 border border-white/5 rounded-2xl text-center text-white/20">
             <div className="mb-2">No critical alerts or roadmap items found.</div>
             <div className="text-xs">Context is clear.</div>
           </div>
         )}

         {/* Mini Context Summary */}
         <GlassPane className="p-6 mt-auto bg-indigo-900/10">
            <h4 className="text-indigo-300 text-xs font-mono uppercase mb-4">Strategic Context</h4>
            <div className="space-y-4">
               <div>
                 <div className="text-white/40 text-[10px] uppercase">Industry</div>
                 <div className="text-white text-sm">{context?.industry}</div>
               </div>
               <div>
                 <div className="text-white/40 text-[10px] uppercase">Stage</div>
                 <div className="text-white text-sm">{context?.stage}</div>
               </div>
               <div>
                 <div className="text-white/40 text-[10px] uppercase">Focus</div>
                 <div className="text-white text-sm line-clamp-3">{context?.description}</div>
               </div>
            </div>
         </GlassPane>
      </div>

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