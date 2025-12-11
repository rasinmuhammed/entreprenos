
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, Wifi, Cpu, Loader2 } from 'lucide-react';

interface SearchVisualizerProps {
  query: string;
  steps?: string[];
}

export const SearchVisualizer: React.FC<SearchVisualizerProps> = ({ 
  query, 
  steps = [
    `Initializing neural handshake...`,
    `Parsing query entity: "${query}"`,
    `Connecting to Global Knowledge Graph...`,
    `Triangulating business footprint...`,
    `Accessing public ledgers...`,
    `Scanning competitor vectors...`,
    `Synthesizing market sentiment analysis...`,
    `Constructing EntreprenOS profile...`
  ] 
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    let delay = 0;
    steps.forEach((step, index) => {
      delay += Math.random() * 800 + 600; 
      setTimeout(() => {
        setLogs(prev => [...prev.slice(-4), `> ${step}`]); 
        setStage(index);
      }, delay);
    });

    return () => {};
  }, [steps]);

  return (
    <div className="w-full h-96 relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xl">
      
      {/* Background Pulse */}
      <div className="absolute inset-0 z-0 overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-tech-purple/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Center Radar */}
      <div className="relative z-10 w-48 h-48 mb-8 flex items-center justify-center">
        {/* Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-slate-200 rounded-full border-t-tech-purple/50 border-l-transparent"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-8 border border-slate-200 rounded-full border-b-tech-cyan/50 border-r-transparent"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-indigo-50/50 rounded-full blur-xl"
        />
        
        {/* Central Icon Swapping */}
        <div className="relative z-20 bg-white p-6 rounded-full border border-slate-100 shadow-lg">
           <AnimatePresence mode="wait">
             {stage < 2 && <Wifi key="wifi" className="w-8 h-8 text-slate-400" />}
             {stage >= 2 && stage < 4 && <Globe key="globe" className="w-8 h-8 text-tech-cyan" />}
             {stage >= 4 && stage < steps.length - 1 && <Search key="search" className="w-8 h-8 text-tech-purple" />}
             {stage >= steps.length - 1 && <Cpu key="cpu" className="w-8 h-8 text-emerald-500" />}
           </AnimatePresence>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="w-full max-w-md px-6 z-10">
        <div className="font-mono text-[10px] text-ink-400 mb-4 flex justify-between uppercase tracking-widest font-bold">
           <span>PID: {Math.floor(Math.random() * 999999)}</span>
           <span className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-tech-purple" />
              Scanning
           </span>
        </div>
        <div className="h-32 flex flex-col justify-end space-y-2">
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-mono text-ink-600 border-l-2 border-tech-purple/30 pl-3 py-1 font-medium"
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};
