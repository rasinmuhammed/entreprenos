
import React, { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ShieldAlert, Swords, TrendingUp, DollarSign, Globe, Zap, Search, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { analyzeCompetitors } from '../../services/geminiService';
import { SearchVisualizer } from '../ui/SearchVisualizer';
import { CompetitorEntity } from '../../types';

export const CompetitorIntelligence: React.FC = () => {
  const { 
    context, 
    competitors, 
    setCompetitors, 
    isAnalyzingCompetitors, 
    setAnalyzingCompetitors 
  } = useAppStore();

  const handleRunAnalysis = async () => {
    if (!context) return;
    setAnalyzingCompetitors(true);
    try {
      const result = await analyzeCompetitors(context);
      if (result.competitors) {
        setCompetitors(result.competitors);
      }
    } catch (e) {
      console.error("Competitor analysis failed", e);
    } finally {
      setAnalyzingCompetitors(false);
    }
  };

  // Auto-run if empty
  useEffect(() => {
    if (competitors.length === 0 && !isAnalyzingCompetitors && context) {
      // Optional: Auto-run or wait for user. Let's wait for user for better UX control
    }
  }, []);

  if (isAnalyzingCompetitors) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <SearchVisualizer 
          query={`Sector Scan: ${context?.industry}`} 
          steps={[
            "Identifying top market players...",
            "Scraping pricing models...",
            "Analyzing SWOT vectors...",
            "Detecting strategic threats...",
            "Compiling tactical battlecards..."
          ]} 
        />
      </div>
    );
  }

  if (competitors.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 shadow-glow">
          <Target className="w-12 h-12 text-rose-400" />
        </div>
        <h2 className="text-3xl font-light text-white mb-4">Market Intelligence Offline</h2>
        <p className="text-white/40 max-w-md mb-8 leading-relaxed">
          EntreprenOS has not yet scanned the competitive landscape for <span className="text-cyan-400">{context?.businessName}</span>. 
          Initiate a deep reconnaissance mission to uncover threats and opportunities.
        </p>
        <button 
          onClick={handleRunAnalysis}
          className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium tracking-wide flex items-center gap-3 transition-all hover:scale-105 shadow-xl"
        >
          <Search className="w-5 h-5" />
          Initialize Sector Scan
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] overflow-y-auto p-8 custom-scrollbar">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-white flex items-center gap-3">
            <Target className="w-6 h-6 text-rose-500" />
            Market Intelligence
            <span className="text-xs font-mono px-2 py-1 bg-white/5 rounded text-white/40">LIVE DATA</span>
          </h2>
          <p className="text-white/40 text-sm mt-1 ml-9">Competitive Landscape Analysis & Wargaming</p>
        </div>
        <button 
          onClick={handleRunAnalysis}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors"
        >
          <Zap className="w-3 h-3" /> Refresh Intel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Market Share Chart */}
        <GlassPane className="lg:col-span-2 p-8">
           <h3 className="text-white/60 text-sm font-mono uppercase tracking-widest mb-6">Market Share Distribution</h3>
           <div className="space-y-6">
             {/* Add user's business contextually if we had share data, for now just competitors */}
             {competitors.map((comp, idx) => (
               <div key={idx} className="group">
                 <div className="flex justify-between items-end mb-2">
                   <div className="flex items-center gap-2">
                     <span className="font-medium text-white">{comp.name}</span>
                     {comp.threatLevel === 'High' && <ShieldAlert className="w-3 h-3 text-rose-500" />}
                   </div>
                   <span className="text-sm text-white/40 font-mono">{comp.marketShare}%</span>
                 </div>
                 <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${comp.marketShare}%` }}
                     transition={{ duration: 1, delay: idx * 0.1 }}
                     className={`h-full rounded-full ${
                       comp.threatLevel === 'High' ? 'bg-rose-500' : 
                       comp.threatLevel === 'Medium' ? 'bg-orange-500' : 'bg-cyan-500'
                     }`}
                   />
                 </div>
               </div>
             ))}
           </div>
        </GlassPane>

        {/* Summary Stats */}
        <div className="space-y-6">
           <GlassPane className="p-6 bg-rose-500/5 border-rose-500/10">
              <div className="flex items-center gap-3 mb-2">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                <span className="text-rose-200 text-sm font-medium">Primary Threat</span>
              </div>
              <div className="text-2xl text-white font-light">
                {competitors.find(c => c.threatLevel === 'High')?.name || "None Detected"}
              </div>
           </GlassPane>

           <GlassPane className="p-6 bg-emerald-500/5 border-emerald-500/10">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-200 text-sm font-medium">Gap Opportunity</span>
              </div>
              <div className="text-sm text-white/80 leading-relaxed">
                 {competitors[0]?.weaknesses?.[0] || "Analyze to find gaps"}
              </div>
           </GlassPane>
        </div>
      </div>

      {/* Competitor Cards */}
      <h3 className="text-white/60 text-sm font-mono uppercase tracking-widest mb-4">Tactical Battlecards</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitors.map((comp, idx) => (
          <CompetitorCard key={idx} comp={comp} index={idx} />
        ))}
      </div>
    </div>
  );
};

const CompetitorCard: React.FC<{ comp: CompetitorEntity, index: number }> = ({ comp, index }) => {
  const threatColor = {
    High: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    Medium: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    Low: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
  }[comp.threatLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <GlassPane className="h-full p-6 flex flex-col group hover:border-white/20 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div>
             <h3 className="text-xl font-light text-white group-hover:text-cyan-400 transition-colors">{comp.name}</h3>
             <a href={comp.website} target="_blank" className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 mt-1">
               <Globe className="w-3 h-3" /> Website
             </a>
          </div>
          <div className={`px-2 py-1 rounded border text-[10px] uppercase font-mono tracking-wider ${threatColor}`}>
            {comp.threatLevel}
          </div>
        </div>

        <p className="text-sm text-white/60 mb-6 line-clamp-2 min-h-[2.5rem]">{comp.description}</p>

        <div className="space-y-4 mb-6 flex-1">
          <div>
            <div className="text-[10px] text-white/30 uppercase font-mono mb-1 flex items-center gap-1">
              <Swords className="w-3 h-3" /> Strategic Weaknesses
            </div>
            <ul className="space-y-1">
              {comp.weaknesses?.map((w, i) => (
                <li key={i} className="text-xs text-emerald-200/80 flex items-start gap-2">
                  <span className="mt-1 w-1 h-1 rounded-full bg-emerald-500" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <div className="text-[10px] text-white/30 uppercase font-mono mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Core Strengths
            </div>
            <ul className="space-y-1">
              {comp.strengths?.map((s, i) => (
                <li key={i} className="text-xs text-rose-200/80 flex items-start gap-2">
                  <span className="mt-1 w-1 h-1 rounded-full bg-rose-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
           <div>
             <div className="text-[10px] text-white/30 uppercase font-mono mb-1">Pricing Model</div>
             <div className="text-xs text-white flex items-center gap-1">
               <DollarSign className="w-3 h-3 text-cyan-500" /> {comp.pricingModel}
             </div>
           </div>
           <div>
             <div className="text-[10px] text-white/30 uppercase font-mono mb-1">Latest Move</div>
             <div className="text-xs text-white flex items-center gap-1">
               <TrendingUp className="w-3 h-3 text-purple-500" /> {comp.strategicMove}
             </div>
           </div>
        </div>
      </GlassPane>
    </motion.div>
  );
};
