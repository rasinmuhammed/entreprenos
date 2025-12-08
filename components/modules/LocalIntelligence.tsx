import React, { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { motion } from 'framer-motion';
import { Map, Navigation, MapPin, Building2, Footprints, Lightbulb, Radar, Scan, Zap } from 'lucide-react';
import { analyzeLocationLeverage } from '../../services/geminiService';
import { SearchVisualizer } from '../ui/SearchVisualizer';

export const LocalIntelligence: React.FC = () => {
  const { 
    context, 
    locationAnalysis, 
    setLocationAnalysis, 
    isAnalyzingLocation, 
    setAnalyzingLocation 
  } = useAppStore();

  const handleRunAnalysis = async () => {
    if (!context || !context.location) return;
    setAnalyzingLocation(true);
    try {
      const result = await analyzeLocationLeverage(context);
      setLocationAnalysis(result);
    } catch (e) {
      console.error("Location analysis failed", e);
    } finally {
      setAnalyzingLocation(false);
    }
  };

  if (!context?.location || context.location === 'Global') {
     return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
           <Map className="w-16 h-16 text-white/20 mb-6" />
           <h2 className="text-2xl font-light text-white mb-2">Location Data Unavailable</h2>
           <p className="text-white/40 max-w-md">This module requires a specific physical address or city to perform geospatial leverage analysis.</p>
        </div>
     );
  }

  if (isAnalyzingLocation) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <SearchVisualizer 
          query={`Geospatial Scan: ${context?.location}`} 
          steps={[
            "Triangulating physical coordinates...",
            "Identifying nearby traffic magnets...",
            "Analyzing pedestrian vectors...",
            "Calculating proximity leverage scores...",
            "Formulating hyper-local strategies..."
          ]} 
        />
      </div>
    );
  }

  if (!locationAnalysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-tech-cyan/10 flex items-center justify-center mb-6 shadow-glow-cyan relative">
          <div className="absolute inset-0 border border-tech-cyan/30 rounded-full animate-ping opacity-20" />
          <MapPin className="w-12 h-12 text-tech-cyan" />
        </div>
        <h2 className="text-3xl font-light text-white mb-4">Geospatial Strategy Center</h2>
        <p className="text-white/40 max-w-md mb-8 leading-relaxed">
          Unlock the hidden potential of your location. EntreprenOS will scan {context.location} for nearby hospitals, colleges, and hubs to generate leverage strategies.
        </p>
        <button 
          onClick={handleRunAnalysis}
          className="px-8 py-4 bg-tech-cyan hover:bg-cyan-500 text-nebula-950 rounded-xl font-medium tracking-wide flex items-center gap-3 transition-all hover:scale-105 shadow-xl"
        >
          <Radar className="w-5 h-5" />
          Initiate Radar Scan
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
            <Map className="w-6 h-6 text-tech-cyan" />
            Local Intelligence
            <span className="text-xs font-mono px-2 py-1 bg-white/5 rounded text-white/40 uppercase">{context.location}</span>
          </h2>
          <p className="text-white/40 text-sm mt-1 ml-9">Geospatial Leverage & Proximity Analysis</p>
        </div>
        <button 
          onClick={handleRunAnalysis}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors"
        >
          <Scan className="w-3 h-3" /> Rescan Area
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         {/* RADAR VISUALIZATION */}
         <GlassPane className="lg:col-span-2 p-8 relative overflow-hidden min-h-[400px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] opacity-50 pointer-events-none" />
            
            {/* Concentric Circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
               <div className="w-[80%] h-[80%] border border-tech-cyan rounded-full" />
               <div className="w-[50%] h-[50%] border border-tech-cyan rounded-full" />
               <div className="w-[20%] h-[20%] border border-tech-cyan rounded-full bg-tech-cyan/20" />
            </div>

            {/* Scanning Line */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="w-full h-full animate-[spin_4s_linear_infinite] origin-center bg-gradient-to-r from-transparent via-transparent to-tech-cyan/10" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }} />
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 h-full">
               {locationAnalysis.nearbyEntities.map((entity, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: idx * 0.2 }}
                   className="bg-nebula-950/60 backdrop-blur border border-white/10 p-4 rounded-xl hover:border-tech-cyan/50 transition-colors group"
                 >
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                          <Building2 className={`w-4 h-4 ${entity.impactLevel === 'High' ? 'text-tech-cyan' : 'text-white/40'}`} />
                          <span className="text-white font-medium text-sm">{entity.name}</span>
                       </div>
                       <span className="text-[9px] font-mono text-white/40">{entity.distance}</span>
                    </div>
                    <div className="text-xs text-white/60 mb-2">{entity.reasoning}</div>
                    <div className={`text-[9px] inline-block px-1.5 py-0.5 rounded font-mono uppercase ${
                       entity.impactLevel === 'High' ? 'bg-tech-cyan/10 text-tech-cyan' : 'bg-white/10 text-white/40'
                    }`}>
                       Impact: {entity.impactLevel}
                    </div>
                 </motion.div>
               ))}
            </div>
         </GlassPane>

         {/* SUMMARY METRICS */}
         <div className="space-y-6">
            <GlassPane className="p-6 bg-tech-cyan/5 border-tech-cyan/10">
               <div className="flex items-center gap-3 mb-2">
                  <Footprints className="w-5 h-5 text-tech-cyan" />
                  <span className="text-cyan-200 text-sm font-medium">Foot Traffic Score</span>
               </div>
               <div className="text-4xl text-white font-light font-mono mb-2">
                  {locationAnalysis.footTrafficScore}<span className="text-base text-white/30">/100</span>
               </div>
               <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-tech-cyan" style={{ width: `${locationAnalysis.footTrafficScore}%` }} />
               </div>
            </GlassPane>

            <GlassPane className="p-6">
               <div className="flex items-center gap-3 mb-4">
                  <Navigation className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-200 text-sm font-medium">Strategic Analysis</span>
               </div>
               <p className="text-sm text-white/60 leading-relaxed">
                  {locationAnalysis.summary}
               </p>
            </GlassPane>
         </div>
      </div>

      {/* STRATEGY CARDS */}
      <h3 className="text-white/60 text-sm font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
         <Zap className="w-4 h-4 text-tech-amber" /> Hyper-Local Strategies
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {locationAnalysis.strategies.map((strategy, idx) => (
            <motion.div
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 + idx * 0.1 }}
            >
               <GlassPane className="h-full p-6 hover:border-tech-amber/30 transition-colors group">
                  <div className="flex items-start justify-between mb-4">
                     <div className="p-2 bg-tech-amber/10 rounded-lg group-hover:bg-tech-amber/20 transition-colors">
                        <Lightbulb className="w-5 h-5 text-tech-amber" />
                     </div>
                     <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider border border-white/10 px-2 py-1 rounded">
                        Target: {strategy.targetAudience}
                     </span>
                  </div>
                  <h4 className="text-white font-medium mb-2 group-hover:text-tech-amber transition-colors">{strategy.title}</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                     {strategy.description}
                  </p>
               </GlassPane>
            </motion.div>
         ))}
      </div>

    </div>
  );
};