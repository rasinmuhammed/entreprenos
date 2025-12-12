
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIEmployee } from '../../types';
import { Sparkles } from 'lucide-react';

interface SystemBuilderProps {
  team: AIEmployee[];
}

export const SystemBuilder: React.FC<SystemBuilderProps> = ({ team }) => {
  const [visibleAgents, setVisibleAgents] = useState<AIEmployee[]>([]);

  // Safe access to team array
  const safeTeam = Array.isArray(team) ? team : [];

  useEffect(() => {
    if (safeTeam && safeTeam.length > 0) {
      safeTeam.forEach((agent, index) => {
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
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden rounded-[3rem] bg-white border border-slate-200 shadow-glass">
      
      {/* 1. Organic Background (Executive Blobs) */}
      <div className="absolute inset-0 z-0 opacity-30">
         <motion.div 
           animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
           transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-tech-purple/20 rounded-full blur-[80px]" 
         />
         <motion.div 
           animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 0] }}
           transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
           className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-tech-cyan/20 rounded-full blur-[80px]" 
         />
      </div>

      <div className="flex flex-col items-center w-full z-10 p-8 h-full overflow-y-auto custom-scrollbar">
        
        {/* Status Text */}
        <div className="mb-8 text-center h-20 flex flex-col items-center justify-center shrink-0">
           <AnimatePresence mode="wait">
             {visibleAgents.length < safeTeam.length && safeTeam.length > 0 ? (
                <motion.div 
                  key="assembling"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-3"
                >
                   <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-tech-purple animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-tech-purple animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-tech-purple animate-bounce delay-200" />
                   </div>
                   <div className="text-ink-600 font-medium text-xl">Recruiting AI Specialists...</div>
                </motion.div>
             ) : safeTeam.length > 0 ? (
                <motion.div 
                  key="ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                   <div className="text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">System Ready</div>
                   <div className="text-ink-950 text-3xl font-bold font-display">Workforce Assembled</div>
                </motion.div>
             ) : (
                <motion.div className="text-ink-400 font-medium text-lg">Analyzing organizational needs...</motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Agent Grid - Consistent Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl">
          <AnimatePresence>
            {safeTeam.length === 0 ? (
               // SKELETON LOADING
               [1,2,3,4].map(i => (
                  <motion.div 
                    key={`skel-${i}`} 
                    exit={{ opacity: 0, scale: 0.8 }} 
                    className="h-64 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm animate-pulse"
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
                   className="relative group h-full"
                 >
                   {/* Agent Card */}
                   <div className="h-64 p-6 bg-white border border-slate-200 rounded-3xl flex flex-col items-center text-center shadow-glass hover:shadow-xl hover:border-tech-purple/30 hover:-translate-y-1 transition-all duration-500">
                      
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 mb-4 flex items-center justify-center text-tech-purple font-bold text-xl relative overflow-hidden group-hover:scale-110 transition-transform shrink-0">
                         {agent.name ? agent.name[0] : '?'}
                      </div>
                      
                      <div className="text-ink-900 font-bold text-sm mb-1 line-clamp-1">{agent.role}</div>
                      <div className="text-ink-500 text-xs mb-3 line-clamp-1">{agent.name}</div>
                      
                      <div className="w-full pt-3 mt-auto border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-tech-purple font-bold uppercase tracking-wide">
                         <Sparkles className="w-3 h-3 fill-current" />
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
