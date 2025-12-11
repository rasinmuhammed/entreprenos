
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIEmployee } from '../../types';
import { Sparkles, Zap, Brain, CheckCircle2 } from 'lucide-react';

interface SystemBuilderProps {
  team: AIEmployee[];
}

export const SystemBuilder: React.FC<SystemBuilderProps> = ({ team }) => {
  const [visibleAgents, setVisibleAgents] = useState<AIEmployee[]>([]);

  useEffect(() => {
    if (team.length > 0) {
      team.forEach((agent, index) => {
        setTimeout(() => {
          setVisibleAgents(prev => {
            if (prev.find(a => a.id === agent.id)) return prev;
            return [...prev, agent];
          });
        }, index * 800 + 500);
      });
    }
  }, [team]);

  return (
    <div className="relative w-full max-w-5xl h-[600px] flex items-center justify-center overflow-hidden rounded-[3rem] bg-white/60 border border-white/60 backdrop-blur-xl shadow-soft">
      
      {/* 1. Organic Background (Calm blobs) */}
      <div className="absolute inset-0 z-0 opacity-40">
         <motion.div 
           animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
           transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-soft-primary/20 rounded-full blur-[80px]" 
         />
         <motion.div 
           animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 0] }}
           transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
           className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-soft-accent/20 rounded-full blur-[80px]" 
         />
      </div>

      <div className="flex flex-col items-center w-full z-10 p-8">
        
        {/* Status Text (Warm Tone) */}
        <div className="mb-12 text-center h-20 flex flex-col items-center justify-center">
           <AnimatePresence mode="wait">
             {visibleAgents.length < team.length && team.length > 0 ? (
                <motion.div 
                  key="assembling"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-3"
                >
                   <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-soft-primary animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-soft-primary animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-soft-primary animate-bounce delay-200" />
                   </div>
                   <div className="text-ink-500 font-medium text-xl">Connecting you with specialized partners...</div>
                </motion.div>
             ) : team.length > 0 ? (
                <motion.div 
                  key="ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                   <div className="text-soft-success font-bold text-sm uppercase tracking-widest bg-soft-success/10 px-3 py-1 rounded-full">Ready</div>
                   <div className="text-ink-900 text-3xl font-bold">Your Workspace is Prepared</div>
                </motion.div>
             ) : (
                <motion.div className="text-ink-400 font-medium text-lg">Understanding your needs...</motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Agent Orbs */}
        <div className="flex flex-wrap justify-center gap-8 w-full max-w-4xl">
          <AnimatePresence>
            {team.length === 0 ? (
               // SKELETON (Soft Pulse)
               [1,2,3].map(i => (
                  <motion.div 
                    key={`skel-${i}`} 
                    exit={{ opacity: 0, scale: 0.8 }} 
                    className="w-32 h-32 rounded-full bg-white border border-white/50 shadow-sm animate-pulse"
                  />
               ))
            ) : (
               visibleAgents.map((agent, i) => (
                 <motion.div
                   key={agent.id}
                   layout
                   initial={{ opacity: 0, scale: 0.5, y: 50 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   transition={{ type: "spring", stiffness: 100, damping: 20, delay: i * 0.1 }}
                   className="relative group"
                 >
                   {/* Agent Card */}
                   <div className="w-48 p-6 bg-white/80 border border-white/60 rounded-3xl backdrop-blur-md flex flex-col items-center text-center shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                      
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-soft-primary/20 to-soft-accent/20 mb-4 flex items-center justify-center text-ink-900 font-bold text-2xl relative overflow-hidden">
                         {agent.name[0]}
                         <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <div className="text-ink-900 font-bold text-sm mb-1">{agent.role}</div>
                      <div className="text-ink-500 text-xs mb-3">{agent.name}</div>
                      
                      <div className="w-full pt-3 border-t border-ink-100 flex items-center justify-center gap-1.5 text-[10px] text-ink-400 font-medium uppercase tracking-wide">
                         <Sparkles className="w-3 h-3 text-soft-accent" />
                         Active
                      </div>
                   </div>
                 </motion.div>
               ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
