
import React, { useEffect, useState } from 'react';
import { useGeminiLive } from '../../hooks/useGeminiLive';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Power, Activity, Lock, Unlock, Ear, EarOff, VolumeX } from 'lucide-react';
import { GlassPane } from '../ui/GlassPane';
import { useAppStore } from '../../store/appStore';
import { liveBridge } from '../../services/geminiLiveBridge';

export const SensoryInput: React.FC = () => {
  const { connect, disconnect, isConnected, volume } = useGeminiLive();
  const { liveState, setPrivacyMode } = useAppStore();
  const [showNoiseAlert, setShowNoiseAlert] = useState(false);

  const handleToggle = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  const togglePrivacy = () => {
     const newMode = liveState.privacyMode === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
     setPrivacyMode(newMode);
     liveBridge.updatePrivacyMode(newMode);
     setShowNoiseAlert(false); // Dismiss alert if manually toggled
     
     // UX Polish: Immediate Local Feedback
     const utterance = new SpeechSynthesisUtterance(`${newMode === 'PUBLIC' ? 'Public' : 'Private'} Mode Active`);
     utterance.rate = 1.2;
     window.speechSynthesis.speak(utterance);
  };

  // High Noise Detection Logic
  useEffect(() => {
    if (isConnected && volume > 0.3 && liveState.privacyMode === 'PRIVATE') {
       // If volume RMS > 0.3 (loud) and currently in Private Mode, prompt user
       // Simple debounce could be added here
       const timer = setTimeout(() => setShowNoiseAlert(true), 1500);
       return () => clearTimeout(timer);
    }
  }, [volume, isConnected, liveState.privacyMode]);

  return (
    <GlassPane className="relative flex items-center justify-between p-4 bg-nebula-950/80 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50">
      
      {/* Noise Alert Toast */}
      <AnimatePresence>
         {showNoiseAlert && (
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: -80 }}
               exit={{ opacity: 0, y: 0 }}
               className="absolute left-1/2 -translate-x-1/2 bg-tech-amber/90 backdrop-blur-md text-black px-6 py-3 rounded-full flex items-center gap-4 shadow-glow z-50 cursor-pointer"
               onClick={togglePrivacy}
            >
               <VolumeX className="w-5 h-5" />
               <div className="flex flex-col text-left">
                  <span className="text-xs font-bold uppercase">High Noise Detected</span>
                  <span className="text-[10px] opacity-80">Tap to enable Privacy Mode?</span>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Visualizer / Status */}
      <div className="flex items-center gap-6 flex-1">
        <button 
          onClick={handleToggle}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 relative group ${isConnected ? 'bg-tech-rose/20' : 'bg-tech-cyan/20'}`}
        >
          <div className={`absolute inset-0 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity ${isConnected ? 'bg-tech-rose' : 'bg-tech-cyan'}`} />
          <Power className={`w-6 h-6 relative z-10 ${isConnected ? 'text-tech-rose' : 'text-tech-cyan'}`} />
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 flex items-center gap-2">
             <Activity className="w-3 h-3" />
             {isConnected ? "NEURAL BRIDGE ACTIVE" : "SYSTEM STANDBY"}
          </div>
          
          {/* Dynamic Waveform */}
          <div className="h-8 flex items-center gap-1">
             {isConnected ? (
                Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: Math.max(4, Math.random() * (volume * 100)),
                      backgroundColor: volume > 0.1 ? '#06b6d4' : '#334155'
                    }}
                    transition={{ duration: 0.1 }}
                    className="w-1 rounded-full bg-slate-700"
                  />
                ))
             ) : (
                <div className="text-white/20 text-sm font-light">Tap power to initialize sensory link...</div>
             )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
         {/* Privacy Shield Toggle */}
         <button 
            onClick={togglePrivacy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
               liveState.privacyMode === 'PUBLIC' 
               ? 'bg-tech-amber/10 border-tech-amber/30 text-tech-amber shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
               : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
            }`}
            title="Privacy Shield: Prevent AI from reading sensitive numbers aloud"
         >
            {liveState.privacyMode === 'PUBLIC' ? <EarOff className="w-4 h-4" /> : <Ear className="w-4 h-4" />}
            <div className="flex flex-col text-left">
               <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                  {liveState.privacyMode === 'PUBLIC' ? 'Public Mode' : 'Private Mode'}
               </span>
               <span className="text-[8px] opacity-50 hidden md:inline">
                  {liveState.privacyMode === 'PUBLIC' ? 'Audio Masked' : 'Full Audio'}
               </span>
            </div>
         </button>

         <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 hidden md:block">
            <span className="text-[9px] font-mono text-white/30 uppercase">Latency: &lt;200ms</span>
         </div>
      </div>
    </GlassPane>
  );
};
