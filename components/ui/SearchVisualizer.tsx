import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, Wifi, Cpu } from 'lucide-react';

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
      delay += Math.random() * 800 + 600; // Slightly longer for readability
      setTimeout(() => {
        setLogs(prev => [...prev.slice(-4), `> ${step}`]); 
        setStage(index);
      }, delay);
    });

    return () => {};
  }, [steps]);

  return (
    <div className="w-full h-96 relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-cyan-500/20 backdrop-blur-xl">
      
      {/* Background Grid Animation */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      {/* Center Radar */}
      <div className="relative z-10 w-48 h-48 mb-8 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-t border-l border-cyan-500/50 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border-b border-r border-purple-500/50 rounded-full"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-cyan-500/5 rounded-full blur-xl"
        />
        
        {/* Central Icon Swapping */}
        <div className="relative z-20 bg-nebula-950/80 p-4 rounded-full border border-white/10">
           <AnimatePresence mode="wait">
             {stage < 2 && <Wifi key="wifi" className="w-8 h-8 text-cyan-400" />}
             {stage >= 2 && stage < 4 && <Globe key="globe" className="w-8 h-8 text-indigo-400" />}
             {stage >= 4 && stage < steps.length - 1 && <Search key="search" className="w-8 h-8 text-purple-400" />}
             {stage >= steps.length - 1 && <Cpu key="cpu" className="w-8 h-8 text-emerald-400" />}
           </AnimatePresence>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="w-full max-w-md px-6 z-10">
        <div className="font-mono text-xs text-cyan-500/50 mb-2 flex justify-between">
           <span>PROCESS_ID: {Math.floor(Math.random() * 999999)}</span>
           <span>SECURE_LINK: ACTIVE</span>
        </div>
        <div className="h-32 flex flex-col justify-end space-y-2">
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-mono text-cyan-100/80 border-l-2 border-cyan-500/30 pl-3"
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