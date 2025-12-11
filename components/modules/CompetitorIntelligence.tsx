
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

  useEffect(() => {
    if (competitors.length === 0 && !isAnalyzingCompetitors && context) {
      // Optional auto-run
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
        <div className="w-24 h-24 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-6 shadow-sm">
          <Target className="w-12 h-12 text-rose-500" />
        </div>
        <h2 className="text-3xl font-bold text-ink-950 mb-4 tracking-tight">Market Intelligence Offline</h2>
        <p className="text-ink-500 max-w-md mb-8 leading-relaxed">
          EntreprenOS has not yet scanned the competitive landscape for <span className="text-tech-purple font-semibold">{context?.businessName}</span>. 
          Initiate a deep reconnaissance mission to uncover threats.
        </p>
        <button 
          onClick={handleRunAnalysis}
          className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold tracking-wide flex items-center gap-3 transition-all hover:scale-105 shadow-xl shadow-rose-500/20"
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
          <h2 className="text-2xl font-bold text-ink-950 flex items-center gap-3">
            <Target className="w-6 h-6 text-rose-500" />
            Market Intelligence
            <span className="text-xs font-mono px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded">LIVE DATA</span>
          </h2>
          <p className="text-ink-500 text-sm mt-1 ml-9">Competitive Landscape Analysis & Wargaming</p>
        </div>
        <button 
          onClick={handleRunAnalysis}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-ink-600 hover:text-ink-900 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
        >
          <Zap className="w-3 h-3 text-tech-purple" /> Refresh Intel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Market Share Chart */}
        <GlassPane className="lg:col-span-2 p-8">
           <h3 className="text-ink-400 text-sm font-mono uppercase tracking-widest mb-6 font-bold">Market Share Distribution</h3>
           <div className="space-y-6">
             {competitors.map((comp, idx) => (
               <div key={idx} className="group">
                 <div className="flex justify-between items-end mb-2">
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-ink-900">{comp.name}</span>
                     {comp.threatLevel === 'High' && <ShieldAlert className="w-3 h-3 text-rose-500" />}
                   </div>
                   <span className="text-sm text-ink-500 font-mono font-medium">{comp.marketShare}%</span>
                 </div>
                 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${comp.marketShare}%` }}
                     transition={{ duration: 1, delay: idx * 0.1 }}
                     className={`h-full rounded-full ${
                       comp.threatLevel === 'High' ? 'bg-rose-500' : 
                       comp.threatLevel === 'Medium' ? 'bg-amber-500' : 'bg-tech-cyan'
                     }`}
                   />
                 </div>
               </div>
             ))}
           </div>
        </GlassPane>

        {/* Summary Stats */}
        <div className="space-y-6">
           <GlassPane className="p-6 bg-rose-50 border-rose-100">
              <div className="flex items-center gap-3 mb-2">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
                <span className="text-rose-700 text-sm font-bold uppercase tracking-wider">Primary Threat</span>
              </div>
              <div className="text-2xl text-ink-900 font-bold">
                {competitors.find(c => c.threatLevel === 'High')?.name || "None Detected"}
              </div>
           </GlassPane>

           <GlassPane className="p-6 bg-emerald-50 border-emerald-100">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-emerald-700 text-sm font-bold uppercase tracking-wider">Gap Opportunity</span>
              </div>
              <div className="text-sm text-ink-700 font-medium leading-relaxed">
                 {competitors[0]?.weaknesses?.[0] || "Analyze to find gaps"}
              </div>
           </GlassPane>
        </div>
      </div>

      {/* Competitor Cards */}
      <h3 className="text-ink-400 text-sm font-mono uppercase tracking-widest mb-4 font-bold">Tactical Battlecards</h3>
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
    High: "text-rose-700 border-rose-200 bg-rose-50",
    Medium: "text-amber-700 border-amber-200 bg-amber-50",
    Low: "text-emerald-700 border-emerald-200 bg-emerald-50"
  }[comp.threatLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <GlassPane className="h-full p-6 flex flex-col group hover:border-tech-purple/50 transition-colors" hoverEffect>
        <div className="flex justify-between items-start mb-4">
          <div>
             <h3 className="text-xl font-bold text-ink-900 group-hover:text-tech-purple transition-colors">{comp.name}</h3>
             <a href={comp.website} target="_blank" className="text-xs text-ink-400 hover:text-ink-600 flex items-center gap-1 mt-1 font-medium">
               <Globe className="w-3 h-3" /> Website
             </a>
          </div>
          <div className={`px-2 py-1 rounded border text-[10px] uppercase font-mono tracking-wider font-bold ${threatColor}`}>
            {comp.threatLevel}
          </div>
        </div>

        <p className="text-sm text-ink-600 mb-6 line-clamp-2 min-h-[2.5rem] font-medium leading-relaxed">{comp.description}</p>

        <div className="space-y-4 mb-6 flex-1">
          <div>
            <div className="text-[10px] text-ink-400 uppercase font-mono mb-2 flex items-center gap-1 font-bold">
              <Swords className="w-3 h-3" /> Strategic Weaknesses
            </div>
            <ul className="space-y-2">
              {comp.weaknesses?.map((w, i) => (
                <li key={i} className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 font-medium">
                  {w}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <div className="text-[10px] text-ink-400 uppercase font-mono mb-2 flex items-center gap-1 font-bold">
              <ShieldAlert className="w-3 h-3" /> Core Strengths
            </div>
            <ul className="space-y-2">
              {comp.strengths?.map((s, i) => (
                <li key={i} className="text-xs text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-100 font-medium">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
           <div>
             <div className="text-[10px] text-ink-400 uppercase font-mono mb-1 font-bold">Pricing</div>
             <div className="text-xs text-ink-900 flex items-center gap-1 font-semibold">
               <DollarSign className="w-3 h-3 text-tech-cyan" /> {comp.pricingModel}
             </div>
           </div>
           <div>
             <div className="text-[10px] text-ink-400 uppercase font-mono mb-1 font-bold">Latest Move</div>
             <div className="text-xs text-ink-900 flex items-center gap-1 font-semibold">
               <TrendingUp className="w-3 h-3 text-tech-purple" /> {comp.strategicMove}
             </div>
           </div>
        </div>
      </GlassPane>
    </motion.div>
  );
};
