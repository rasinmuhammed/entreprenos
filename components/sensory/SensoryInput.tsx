
import React from 'react';
import { useGeminiLive } from '../../hooks/useGeminiLive';
import { motion } from 'framer-motion';
import { Mic, MicOff, Power, Activity } from 'lucide-react';
import { GlassPane } from '../ui/GlassPane';

export const SensoryInput: React.FC = () => {
  const { connect, disconnect, isConnected, volume } = useGeminiLive();

  const handleToggle = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <GlassPane className="relative flex items-center justify-between p-4 bg-nebula-900/80 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50">
      
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

      <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5">
         <span className="text-[9px] font-mono text-white/30 uppercase">Latency: &lt;200ms</span>
      </div>
    </GlassPane>
  );
};
