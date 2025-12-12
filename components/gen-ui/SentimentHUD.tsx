
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, MessageSquare, Ear } from 'lucide-react';

export const SentimentHUD: React.FC = () => {
  const { sentimentStream, liveState } = useAppStore();
  const [showSpeakNow, setShowSpeakNow] = useState(false);

  // Silence Detection Logic
  useEffect(() => {
    if (liveState.isConnected && liveState.volumeLevel < 0.01) {
       const timer = setTimeout(() => setShowSpeakNow(true), 2000); // 2s silence gap
       return () => clearTimeout(timer);
    } else {
       setShowSpeakNow(false);
    }
  }, [liveState.volumeLevel, liveState.isConnected]);

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'positive': return 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]';
      case 'negative': return 'bg-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]';
      case 'skeptical': return 'bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)]';
      case 'excited': return 'bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]';
      case 'conflict': return 'bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-pulse';
      default: return 'bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)]';
    }
  };

  return (
    <div className="h-full relative overflow-hidden bg-black">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[80vw] h-[80vh] border border-white/10 rounded-full opacity-20" />
      </div>

      <div className="h-full flex flex-col justify-end p-8 pb-20 max-w-4xl mx-auto space-y-6">
         {/* Accessibility Instructions */}
         {sentimentStream.length === 0 && (
            <div className="text-center text-white/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Ear className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">Visual Captions Active</h3>
                <p className="max-w-md">This mode visualizes spoken conversation tone and transcribes speech for Deaf or Hard-of-Hearing users. Enable the microphone to begin.</p>
            </div>
         )}

         <AnimatePresence>
            {sentimentStream.map((frame) => (
               <motion.div
                 key={frame.id}
                 initial={{ opacity: 0, scale: 0.5, y: 50 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.8, y: -50 }}
                 transition={{ type: "spring", stiffness: 200, damping: 20 }}
                 className={`self-start max-w-lg p-6 rounded-3xl rounded-bl-none text-white backdrop-blur-md border border-white/10 relative ${getToneColor(frame.tone)} bg-opacity-20`}
               >
                  <div className="text-[10px] font-mono uppercase opacity-70 mb-2 flex justify-between">
                     <span>{frame.speaker}</span>
                     <span className="font-bold">{frame.tone}</span>
                  </div>
                  <div className="text-xl font-medium leading-relaxed">
                     {frame.text}
                  </div>
               </motion.div>
            ))}
         </AnimatePresence>
         
         {/* Silence / Speak Now Indicator */}
         <AnimatePresence>
            {showSpeakNow && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute bottom-32 left-1/2 -translate-x-1/2"
               >
                  <div className="px-6 py-3 bg-white text-black font-bold rounded-full shadow-glow animate-bounce flex items-center gap-2">
                     <Mic className="w-5 h-5" /> Waiting for speech...
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="absolute bottom-8 left-0 right-0 flex justify-center text-white/30 text-sm font-mono">
            {liveState.isConnected ? "MICROPHONE ACTIVE - VISUALIZING AUDIO" : "MICROPHONE OFF"}
         </div>
      </div>
    </div>
  );
};
