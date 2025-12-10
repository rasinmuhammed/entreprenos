
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIEmployee } from '../../types';
import { User, Zap, Shield, TrendingUp, Brain, CheckCircle2, Cpu } from 'lucide-react';

interface SystemBuilderProps {
  team: AIEmployee[];
}

export const SystemBuilder: React.FC<SystemBuilderProps> = ({ team }) => {
  // Local state to stagger the reveal even if data is instant
  const [visibleAgents, setVisibleAgents] = useState<AIEmployee[]>([]);

  useEffect(() => {
    if (team.length > 0) {
      team.forEach((agent, index) => {
        setTimeout(() => {
          setVisibleAgents(prev => {
            if (prev.find(a => a.id === agent.id)) return prev;
            return [...prev, agent];
          });
        }, index * 800 + 500); // 800ms staggered delay
      });
    }
  }, [team]);

  return (
    <div className="relative w-full max-w-5xl h-[600px] flex items-center justify-center overflow-hidden rounded-3xl bg-nebula-950/80 border border-white/5 backdrop-blur-md shadow-2xl">
      
      {/* 1. The Grid Blueprint Background (Wireframe Mode) */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 animate-[pulse_4s_ease-in-out_infinite] [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none" />
      
      {/* 2. Central Core Logic */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
         <div className="w-[500px] h-[500px] border border-tech-cyan/10 rounded-full animate-[spin_20s_linear_infinite]" />
         <div className="w-[300px] h-[300px] border border-tech-purple/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
      </div>

      <div className="flex flex-col items-center w-full z-10 p-8">
        
        {/* Status Text */}
        <div className="mb-12 text-center h-16">
           <AnimatePresence mode="wait">
             {visibleAgents.length < team.length && team.length > 0 ? (
                <motion.div 
                  key="hiring"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-2"
                >
                   <div className="text-tech-cyan font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Recruiting AI Talent...</div>
                   <div className="text-white text-2xl font-light">Assembling your Executive Team</div>
                </motion.div>
             ) : team.length > 0 ? (
                <motion.div 
                  key="ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                   <div className="text-emerald-400 font-mono text-xs uppercase tracking-[0.3em]">System Online</div>
                   <div className="text-white text-3xl font-bold text-glow">EntreprenOS Initialized</div>
                </motion.div>
             ) : (
                <motion.div className="text-white/30 font-mono text-sm">Synthesizing Business Architecture...</motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <AnimatePresence>
            {team.length === 0 ? (
               // SKELETON LOADING STATE
               [1,2,3,4].map(i => (
                  <motion.div key={`skel-${i}`} exit={{ opacity: 0 }} className="p-6 bg-nebula-900/50 border border-white/5 rounded-2xl flex flex-col items-center animate-pulse">
                     <div className="w-16 h-16 rounded-full bg-white/5 mb-4" />
                     <div className="h-3 w-24 bg-white/5 rounded mb-2" />
                     <div className="h-2 w-16 bg-white/5 rounded" />
                  </motion.div>
               ))
            ) : (
               visibleAgents.map((agent, i) => (
                 <motion.div
                   key={agent.id}
                   layout
                   initial={{ opacity: 0, scale: 0.5, y: 50, filter: 'blur(10px)' }}
                   animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                   transition={{ type: "spring", stiffness: 120, damping: 15 }}
                   className="relative group"
                 >
                   {/* Connecting Line */}
                   <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: '40px' }} 
                      transition={{ delay: 0.3 }}
                      className="absolute bottom-full left-1/2 w-px bg-gradient-to-t from-tech-cyan/50 to-transparent -z-10" 
                   />

                   <div className="p-6 bg-nebula-900/90 border border-white/10 rounded-2xl backdrop-blur-xl flex flex-col items-center text-center hover:border-tech-cyan/50 transition-colors shadow-[0_0_30px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                      {/* Hiring Flash Effect */}
                      <motion.div 
                         initial={{ opacity: 1 }}
                         animate={{ opacity: 0 }}
                         transition={{ duration: 0.8 }}
                         className="absolute inset-0 bg-white rounded-2xl z-20 pointer-events-none"
                      />
                      
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 mb-4 flex items-center justify-center text-white font-bold text-2xl shadow-inner border border-white/5 relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-0" />
                         <span className="relative z-10">{agent.name[0]}</span>
                         {/* Scanning Effect on Avatar */}
                         <div className="absolute inset-0 bg-white/20 h-1 w-full top-0 animate-[scanline_2s_linear_infinite]" />
                      </div>
                      
                      <div className="text-[9px] font-mono text-tech-cyan uppercase tracking-widest mb-2 flex items-center gap-1.5 bg-tech-cyan/10 px-2 py-1 rounded-full border border-tech-cyan/20">
                         <Zap className="w-3 h-3" /> HIRED
                      </div>
                      <div className="text-sm font-bold text-white mb-1 tracking-wide">{agent.role}</div>
                      <div className="text-xs text-white/40 mb-3">{agent.name}</div>
                      
                      <div className="w-full pt-3 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-white/50 font-mono">
                         <Cpu className="w-3 h-3 text-tech-purple" />
                         {agent.specialty.split(' ').slice(0, 2).join(' ')}
                      </div>
                   </div>
                 </motion.div>
               ))
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Progress Bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
         <motion.div 
            className="h-full bg-gradient-to-r from-tech-cyan to-tech-purple"
            initial={{ width: "0%" }}
            animate={{ width: visibleAgents.length === team.length && team.length > 0 ? "100%" : `${(visibleAgents.length / 4) * 100}%` }}
            transition={{ duration: 0.5 }}
         />
      </div>
    </div>
  );
};
