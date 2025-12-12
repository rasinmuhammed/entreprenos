
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Eye, X } from 'lucide-react';

export const SentimentHUD: React.FC = () => {
  const { sentimentStream, liveState } = useAppStore();
  const [minimized, setMinimized] = useState(false);

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'positive': return 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case 'negative': return 'border-rose-400/50 bg-rose-500/10 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
      case 'skeptical': return 'border-amber-400/50 bg-amber-500/10 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 'excited': return 'border-purple-400/50 bg-purple-500/10 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.2)]';
      case 'conflict': return 'border-red-500/50 bg-red-600/10 text-red-100 shadow-[0_0_15px_rgba(220,38,38,0.2)] animate-pulse';
      default: return 'border-blue-400/50 bg-blue-500/10 text-blue-100';
    }
  };

  if (minimized) {
     return (
        <button 
          onClick={() => setMinimized(false)}
          className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-full shadow-lg hover:scale-110 transition-transform group pointer-events-auto"
        >
           <Eye className="w-5 h-5 text-tech-cyan group-hover:text-white" />
        </button>
     );
  }

  return (
    <div className="w-96 max-h-[400px] flex flex-col pointer-events-auto">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
         {/* Header */}
         <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div className="flex items-center gap-2">
               <Eye className="w-4 h-4 text-tech-cyan" />
               <span className="text-xs font-bold text-white uppercase tracking-wider">Visual Captions</span>
            </div>
            <button onClick={() => setMinimized(true)} className="text-white/40 hover:text-white transition-colors">
               <X className="w-3 h-3" />
            </button>
         </div>

         {/* Stream */}
         <div className="p-4 space-y-3 overflow-y-auto max-h-64 flex flex-col-reverse">
            {sentimentStream.length === 0 && (
               <div className="text-center py-4 text-white/30 text-xs font-mono">
                  {liveState.isConnected ? "Listening for speech..." : "Microphone inactive."}
               </div>
            )}
            
            <AnimatePresence initial={false}>
               {[...sentimentStream].reverse().slice(0, 4).map((frame) => (
                  <motion.div
                    key={frame.id}
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-3 rounded-xl border text-sm font-medium backdrop-blur-sm relative ${getToneColor(frame.tone)}`}
                  >
                     <div className="flex justify-between items-center mb-1 opacity-70 text-[10px] font-mono uppercase">
                        <span>{frame.speaker}</span>
                        <span className="font-bold">{frame.tone}</span>
                     </div>
                     <div className="leading-snug">{frame.text}</div>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>

         {/* Status Footer */}
         <div className="p-2 bg-white/5 text-[9px] font-mono text-white/30 text-center border-t border-white/5">
            {liveState.isConnected ? "LIVE TRANSCRIPTION ACTIVE" : "OFFLINE"}
         </div>
      </div>
    </div>
  );
};
