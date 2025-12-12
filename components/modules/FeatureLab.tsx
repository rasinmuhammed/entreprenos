
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Sparkles, ChevronRight, BarChart3, Rocket, Activity, CheckCircle2, AlertTriangle, Layers, Zap, RefreshCw } from 'lucide-react';
import { researchStrategicFeatures } from '../../services/geminiService';
import { SearchVisualizer } from '../ui/SearchVisualizer';
import { FeatureProposal } from '../../types';

export const FeatureLab: React.FC = () => {
  const { 
    context, 
    featureProposals, 
    setFeatureProposals, 
    isResearchingFeatures, 
    setResearchingFeatures 
  } = useAppStore();

  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  const handleDeepScan = async () => {
    if (!context) return;
    setResearchingFeatures(true);
    try {
      const proposals = await researchStrategicFeatures(context);
      const proposalsWithIds = proposals.map((p, i) => ({ ...p, id: Math.random().toString() }));
      setFeatureProposals(proposalsWithIds);
      if (proposalsWithIds.length > 0) setSelectedProposalId(proposalsWithIds[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setResearchingFeatures(false);
    }
  };

  useEffect(() => {
    if (featureProposals.length === 0 && !isResearchingFeatures && context) {
      handleDeepScan();
    }
  }, []);

  if (isResearchingFeatures) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <SearchVisualizer 
          query={`Researching Features for: ${context?.businessName}`} 
          steps={[
            "Analyzing market gaps...",
            "Reviewing customer feedback...",
            "Scoring feasibility...",
            "Drafting implementation plans...",
            "Calculating ROI..."
          ]} 
        />
      </div>
    );
  }

  const activeProposal = featureProposals.find(p => p.id === selectedProposalId) || featureProposals[0];

  if (!activeProposal) {
     return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
           <div className="w-24 h-24 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 shadow-sm relative">
             <FlaskConical className="w-12 h-12 text-tech-purple" />
           </div>
           <h2 className="text-3xl font-bold text-ink-900 mb-4 tracking-tight">Feature Research Lab</h2>
           <p className="text-ink-500 max-w-md mb-8 leading-relaxed font-medium">
             Generate high-impact feature ideas based on your business context. 
             We analyze feasibility, impact, and effort for every suggestion.
           </p>
           <button 
             onClick={handleDeepScan}
             className="px-8 py-4 bg-tech-purple hover:bg-indigo-600 text-white rounded-xl font-bold tracking-wide flex items-center gap-3 transition-all hover:scale-105 shadow-xl shadow-indigo-500/20"
           >
             <Sparkles className="w-5 h-5" />
             Start Research
           </button>
        </div>
     );
  }

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden flex gap-6 p-6">
       
       {/* LEFT: PROPOSAL LIST */}
       <GlassPane className="w-96 flex flex-col p-6 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-2 mb-6">
             <div className="p-2 bg-indigo-100 rounded-lg">
                <FlaskConical className="w-5 h-5 text-tech-purple" />
             </div>
             <h2 className="font-bold tracking-wide text-ink-900">Feature Ideas</h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
             {featureProposals.map(proposal => (
                <button
                  key={proposal.id}
                  onClick={() => setSelectedProposalId(proposal.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all relative group overflow-hidden ${
                    activeProposal.id === proposal.id 
                    ? 'bg-white border-tech-purple shadow-md' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                   {activeProposal.id === proposal.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-tech-purple" />
                   )}
                   <div className="flex justify-between items-start mb-1">
                      <span className={`font-bold truncate pr-2 ${activeProposal.id === proposal.id ? 'text-ink-900' : 'text-ink-600'}`}>{proposal.title}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                         proposal.riceScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                         proposal.riceScore >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                         Score: {proposal.riceScore}
                      </span>
                   </div>
                   <div className="text-xs text-ink-400 truncate font-medium">{proposal.tagline}</div>
                </button>
             ))}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200">
             <button 
               onClick={handleDeepScan}
               className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs text-ink-500 hover:text-ink-900 transition-colors flex items-center justify-center gap-2 font-bold"
             >
                <RefreshCw className="w-3 h-3" /> Refresh Research
             </button>
          </div>
       </GlassPane>

       {/* RIGHT: DEEP DIVE */}
       <div className="flex-1 flex flex-col overflow-hidden">
          <GlassPane className="h-full p-0 relative overflow-hidden flex flex-col bg-white shadow-crisp">
             {/* Header */}
             <div className="p-8 pb-0 shrink-0 bg-slate-50/50">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h1 className="text-3xl font-bold text-ink-900 mb-2 tracking-tight">{activeProposal.title}</h1>
                      <p className="text-xl text-ink-500 font-light">{activeProposal.tagline}</p>
                   </div>
                   <div className="flex flex-col items-end">
                      <div className="text-5xl font-mono font-bold text-ink-900 tracking-tighter">
                         {activeProposal.riceScore}
                      </div>
                      <div className="text-[10px] text-ink-400 uppercase font-mono tracking-widest mt-1 font-bold">Priority Score</div>
                   </div>
                </div>

                {/* Score Breakdown Bar */}
                <div className="flex gap-1 h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-8">
                   <div className="flex-1 bg-emerald-500" />
                   <div className="flex-1 bg-blue-500" />
                   <div className="flex-1 bg-purple-500" />
                   <div className="flex-1 bg-rose-500" />
                </div>
             </div>

             {/* Scrollable Content */}
             <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0">
                <div className="grid grid-cols-3 gap-6 mb-8 mt-8">
                   <StatCard label="Feasibility" value={activeProposal.feasibility} icon={<Activity className="w-4 h-4 text-emerald-500" />} />
                   <StatCard label="Market Context" value={activeProposal.competitorAdoption} icon={<Layers className="w-4 h-4 text-blue-500" />} />
                   <StatCard label="Expected ROI" value={activeProposal.expectedROI} icon={<BarChart3 className="w-4 h-4 text-purple-500" />} />
                </div>

                <div className="space-y-8">
                   <section>
                      <h3 className="text-sm font-bold text-ink-400 uppercase tracking-widest mb-4">Description</h3>
                      <p className="text-ink-800 leading-relaxed text-lg font-medium">
                         {activeProposal.description}
                      </p>
                   </section>

                   <section>
                      <h3 className="text-sm font-bold text-ink-400 uppercase tracking-widest mb-4">Implementation Steps</h3>
                      <div className="space-y-3">
                         {activeProposal.implementationSteps && activeProposal.implementationSteps.length > 0 ? (
                            activeProposal.implementationSteps.map((step, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                   <div className="w-6 h-6 rounded-full bg-tech-purple text-white flex items-center justify-center text-xs font-bold shrink-0">
                                      {i + 1}
                                   </div>
                                   <div className="text-ink-700 font-medium">{step}</div>
                                </div>
                            ))
                         ) : (
                            <div className="text-ink-400 italic">No implementation steps generated.</div>
                         )}
                      </div>
                   </section>
                </div>
             </div>

             {/* Footer Actions */}
             <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-4 shrink-0">
                <button className="px-6 py-3 rounded-xl border border-slate-200 hover:bg-white text-ink-500 hover:text-ink-900 transition-colors font-bold text-sm bg-white shadow-sm">
                   Save Draft
                </button>
                <button className="px-8 py-3 bg-tech-purple hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 text-sm">
                   <Rocket className="w-4 h-4" /> Start Project
                </button>
             </div>
          </GlassPane>
       </div>

    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, icon: React.ReactNode }> = ({ label, value, icon }) => (
   <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-2 opacity-70">
         {icon}
         <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-ink-500">{label}</span>
      </div>
      <div className="text-lg font-bold text-ink-900">{value}</div>
   </div>
);
