
import React from 'react';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { motion } from 'framer-motion';
import { Users, Bot, Briefcase, Zap, Activity, Brain } from 'lucide-react';

export const TeamView: React.FC = () => {
  const { team, context } = useAppStore();

  if (team.length === 0) {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-8 text-center opacity-50 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
        <Users className="w-24 h-24 text-ink-300 mb-4" />
        <h2 className="text-2xl font-bold text-ink-900">No Team Assembled</h2>
        <p className="text-ink-500 font-medium">Complete the Genesis Interview to hire your AI workforce.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] overflow-y-auto p-8 custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-tech-purple" />
          AI Workforce
          <span className="text-xs font-mono px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 font-bold">
            {team.length} ACTIVE AGENTS
          </span>
        </h2>
        <p className="text-ink-500 mt-2 ml-11 font-medium">
          Customized staff for <span className="text-ink-900 font-bold">{context?.businessName}</span>
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
            <GlassPane className="p-6 h-full flex flex-col group hover:border-tech-purple/50 transition-colors shadow-sm hover:shadow-md" hoverEffect>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-white">
                    {agent.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink-900">{agent.name}</h3>
                    <div className="text-xs text-tech-purple font-mono uppercase tracking-wider font-bold">{agent.role}</div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-mono font-bold border ${
                   agent.status === 'WORKING' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 
                   'bg-slate-100 border-slate-200 text-slate-500'
                }`}>
                   {agent.status}
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                   <div className="text-[10px] text-ink-400 uppercase font-mono mb-1 flex items-center gap-1 font-bold">
                      <Brain className="w-3 h-3" /> Specialty
                   </div>
                   <div className="text-sm text-ink-700 font-medium">{agent.specialty}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                   <div className="text-[10px] text-ink-400 uppercase font-mono mb-1 flex items-center gap-1 font-bold">
                      <Zap className="w-3 h-3" /> Personality
                   </div>
                   <div className="text-sm text-ink-700 italic font-medium">"{agent.personality}"</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                 <div className="flex items-center gap-2 text-xs text-ink-400 font-bold uppercase tracking-wider mb-1">
                    <Activity className="w-3 h-3 text-tech-purple" />
                    <span>Current Task</span>
                 </div>
                 <div className="text-sm text-ink-900 truncate font-medium bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
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
