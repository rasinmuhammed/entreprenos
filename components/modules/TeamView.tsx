
import React from 'react';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { motion } from 'framer-motion';
import { Users, Bot, Briefcase, Zap, Activity, Brain } from 'lucide-react';

export const TeamView: React.FC = () => {
  const { team, context } = useAppStore();

  if (team.length === 0) {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-8 text-center opacity-50">
        <Users className="w-24 h-24 text-white/20 mb-4" />
        <h2 className="text-2xl font-light text-white">No Team Assembled</h2>
        <p className="text-white/40">Complete the Genesis Interview to hire your AI workforce.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] overflow-y-auto p-8 custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-3xl font-light text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-400" />
          AI Workforce
          <span className="text-xs font-mono px-3 py-1 bg-white/5 rounded-full text-white/40">
            {team.length} ACTIVE AGENTS
          </span>
        </h2>
        <p className="text-white/40 mt-2 ml-11">
          Customized staff for <span className="text-white">{context?.businessName}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((agent, idx) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassPane className="p-6 h-full flex flex-col group hover:border-indigo-500/30 transition-colors" hoverEffect>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {agent.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{agent.name}</h3>
                    <div className="text-xs text-indigo-300 font-mono uppercase tracking-wider">{agent.role}</div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-mono border ${
                   agent.status === 'WORKING' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                   'bg-white/5 border-white/10 text-white/30'
                }`}>
                   {agent.status}
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                   <div className="text-[10px] text-white/30 uppercase font-mono mb-1 flex items-center gap-1">
                      <Brain className="w-3 h-3" /> Specialty
                   </div>
                   <div className="text-sm text-white/80">{agent.specialty}</div>
                </div>

                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                   <div className="text-[10px] text-white/30 uppercase font-mono mb-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Personality
                   </div>
                   <div className="text-sm text-white/80 italic">"{agent.personality}"</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                 <div className="flex items-center gap-2 text-xs text-white/50">
                    <Activity className="w-3 h-3 text-indigo-400" />
                    <span>Current Task:</span>
                 </div>
                 <div className="mt-1 text-sm text-white truncate">
                    {agent.activeTask || "Standing by for assignment..."}
                 </div>
              </div>
            </GlassPane>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
