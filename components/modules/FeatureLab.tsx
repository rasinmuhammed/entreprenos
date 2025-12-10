
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
      // Ensure unique IDs
      const proposalsWithIds = proposals.map((p, i) => ({ ...p, id: Math.random().toString() }));
      setFeatureProposals(proposalsWithIds);
      if (proposalsWithIds.length > 0) setSelectedProposalId(proposalsWithIds[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setResearchingFeatures(false);
    }
  };

  // Auto-trigger if empty
  useEffect(() => {
    if (featureProposals.length === 0 && !isResearchingFeatures && context) {
      handleDeepScan();
    }
  }, []);

  if (isResearchingFeatures) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <SearchVisualizer 
          query={`R&D Lab: ${context?.businessName}`} 
          steps={[
            "Scanning competitive landscape for feature gaps...",
            "Analyzing customer friction points...",
            "Applying RICE scoring framework...",
            "Simulating implementation pathways...",
            "Calculating potential ROI..."
          ]} 
        />
      </div>
    );
  }

  const activeProposal = featureProposals.find(p => p.id === selectedProposalId) || featureProposals[0];

  if (!activeProposal) {
     return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
           <div className="w-24 h-24 rounded-full bg-tech-purple/10 flex items-center justify-center mb-6 shadow-glow relative">
             <FlaskConical className="w-12 h-12 text-tech-purple" />
             <div className="absolute inset-0 border border-tech-purple/30 rounded-full animate-pulse opacity-50" />
           </div>
           <h2 className="text-3xl font-light text-white mb-4">Innovation Lab</h2>
           <p className="text-white/40 max-w-md mb-8 leading-relaxed">
             Initiate a rigorous R&D protocol to uncover high-impact features. 
             We use the RICE framework (Reach, Impact, Confidence, Effort) to score every idea.
           </p>
           <button 
             onClick={handleDeepScan}
             className="px-8 py-4 bg-tech-purple hover:bg-purple-500 text-white rounded-xl font-medium tracking-wide flex items-center gap-3 transition-all hover:scale-105 shadow-xl"
           >
             <Sparkles className="w-5 h-5" />
             Begin Feature Discovery
           </button>
        </div>
     );
  }

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden flex gap-6 p-6">
       
       {/* LEFT: PROPOSAL LIST */}
       <GlassPane className="w-96 flex flex-col p-6 bg-nebula-900/40">
          <div className="flex items-center gap-2 mb-6 text-tech-purple">
             <FlaskConical className="w-5 h-5" />
             <h2 className="font-light tracking-wide text-white">R&D Pipeline</h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
             {featureProposals.map(proposal => (
                <button
                  key={proposal.id}
                  onClick={() => setSelectedProposalId(proposal.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all relative group overflow-hidden ${
                    activeProposal.id === proposal.id 
                    ? 'bg-white/10 border-tech-purple/50 text-white' 
                    : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                   {activeProposal.id === proposal.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-tech-purple" />
                   )}
                   <div className="flex justify-between items-start mb-1">
                      <span className="font-medium truncate pr-2">{proposal.title}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                         proposal.riceScore >= 80 ? 'bg-emerald-500/20 text-emerald-300' :
                         proposal.riceScore >= 60 ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white/40'
                      }`}>
                         RICE: {proposal.riceScore}
                      </span>
                   </div>
                   <div className="text-xs opacity-60 truncate">{proposal.tagline}</div>
                </button>
             ))}
          </div>

          <div className="pt-4 mt-4 border-t border-white/5">
             <button 
               onClick={handleDeepScan}
               className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2"
             >
                <RefreshCw className="w-3 h-3" /> Re-Scan Market
             </button>
          </div>
       </GlassPane>

       {/* RIGHT: DEEP DIVE */}
       <div className="flex-1 flex flex-col overflow-hidden">
          <GlassPane className="h-full p-0 relative overflow-hidden flex flex-col">
             {/* Header */}
             <div className="p-8 pb-0 shrink-0">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h1 className="text-3xl font-light text-white mb-2">{activeProposal.title}</h1>
                      <p className="text-xl text-tech-cyan/80 font-light">{activeProposal.tagline}</p>
                   </div>
                   <div className="flex flex-col items-end">
                      <div className="text-5xl font-mono font-bold text-white tracking-tighter text-glow">
                         {activeProposal.riceScore}
                      </div>
                      <div className="text-[10px] text-white/30 uppercase font-mono tracking-widest mt-1">RICE Score</div>
                   </div>
                </div>

                {/* Score Breakdown Bar */}
                <div className="flex gap-1 h-1 w-full bg-white/5 rounded-full overflow-hidden mb-8">
                   <div className="flex-1 bg-emerald-500/50" />
                   <div className="flex-1 bg-blue-500/50" />
                   <div className="flex-1 bg-purple-500/50" />
                   <div className="flex-1 bg-rose-500/50" />
                </div>
             </div>

             {/* Scrollable Content */}
             <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0">
                <div className="grid grid-cols-3 gap-6 mb-8">
                   <StatCard label="Feasibility" value={activeProposal.feasibility} icon={<Activity className="w-4 h-4 text-emerald-400" />} />
                   <StatCard label="Market Context" value={activeProposal.competitorAdoption} icon={<Layers className="w-4 h-4 text-blue-400" />} />
                   <StatCard label="Expected ROI" value={activeProposal.expectedROI} icon={<BarChart3 className="w-4 h-4 text-purple-400" />} />
                </div>

                <div className="space-y-8">
                   <section>
                      <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Strategic Rationale</h3>
                      <p className="text-white/80 leading-relaxed text-lg font-light">
                         {activeProposal.description}
                      </p>
                   </section>

                   <section>
                      <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Implementation Protocol</h3>
                      <div className="space-y-3">
                         {activeProposal.implementationSteps.map((step, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                               <div className="w-6 h-6 rounded-full bg-tech-purple/20 flex items-center justify-center text-tech-purple text-xs font-bold shrink-0">
                                  {i + 1}
                               </div>
                               <div className="text-white/80">{step}</div>
                            </div>
                         ))}
                      </div>
                   </section>
                </div>
             </div>

             {/* Footer Actions */}
             <div className="p-6 border-t border-white/5 bg-nebula-950/30 flex justify-end gap-4 shrink-0">
                <button className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition-colors">
                   Save for Later
                </button>
                <button className="px-8 py-3 bg-tech-purple hover:bg-purple-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-glow">
                   <Rocket className="w-4 h-4" /> Launch Project
                </button>
             </div>
          </GlassPane>
       </div>

    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, icon: React.ReactNode }> = ({ label, value, icon }) => (
   <div className="p-4 bg-white/5 rounded-xl border border-white/5">
      <div className="flex items-center gap-2 mb-2 opacity-50">
         {icon}
         <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-lg font-medium text-white">{value}</div>
   </div>
);
