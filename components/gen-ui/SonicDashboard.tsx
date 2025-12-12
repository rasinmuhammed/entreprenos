
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { synthesizeWidgetAudio } from '../../services/audio/semanticSynthesizer';
import { Volume2, Play, Rewind, FastForward, Activity, Info, StopCircle, MicOff, Mic, WifiOff } from 'lucide-react';
import { WidgetData, View } from '../../types';

export const SonicDashboard: React.FC = () => {
  const { widgets, audioBriefs, setAudioBrief, setView, addBlindStrategistMessage, liveState } = useAppStore();
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Announce Instructions on Mount
  useEffect(() => {
     window.speechSynthesis.cancel();
     const text = "Sonic Dashboard Active. I am your Navigation Assistant. I will read the screen data for you. The Neural Bridge is listening in the background but will remain silent until you ask a question. Use Up and Down arrows to navigate widgets.";
     const msg = new SpeechSynthesisUtterance(text);
     msg.rate = 1.1; 
     msg.onstart = () => setIsPlaying(true);
     msg.onend = () => setIsPlaying(false);
     window.speechSynthesis.speak(msg);
     
     return () => window.speechSynthesis.cancel();
  }, []);

  const handleStopAudio = () => {
     window.speechSynthesis.cancel();
     setIsPlaying(false);
  };

  const handlePlayBrief = async (widget: WidgetData) => {
    window.speechSynthesis.cancel();
    
    let text = audioBriefs[widget.id];
    if (!text) {
      // Optimistic interim announcement
      const loadingMsg = new SpeechSynthesisUtterance(`Analyzing ${widget.title}...`);
      window.speechSynthesis.speak(loadingMsg);
      
      text = await synthesizeWidgetAudio(widget);
      setAudioBrief(widget.id, text);
    }
    
    const msg = new SpeechSynthesisUtterance(text);
    msg.onstart = () => setIsPlaying(true);
    msg.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
       handleStopAudio();
    } else if (e.key === 'ArrowDown' || e.key === 'j') {
      setFocusedIndex(i => {
         const next = Math.min(i + 1, widgets.length - 1);
         handlePlayBrief(widgets[next]); // Auto-play on nav
         return next;
      });
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      setFocusedIndex(i => {
         const prev = Math.max(i - 1, 0);
         handlePlayBrief(widgets[prev]); // Auto-play on nav
         return prev;
      });
    } else if (e.key === 'Enter') {
      if (widgets[focusedIndex]) {
        handlePlayBrief(widgets[focusedIndex]);
      }
    } else if (e.key === ' ' || e.key === 'Spacebar') {
       e.preventDefault();
       const activeWidget = widgets[focusedIndex];
       if (activeWidget) {
          // Deep Dive: Switch to Strategist with context
          addBlindStrategistMessage({
             id: Math.random().toString(),
             sender: 'system',
             text: `Context: ${activeWidget.title}.`,
             timestamp: Date.now()
          });
          
          const utterance = new SpeechSynthesisUtterance("Context set. Ask the Neural Bridge a question about this data.");
          window.speechSynthesis.speak(utterance);
       }
    }
  };

  if (widgets.length === 0) {
    return (
      <div className="h-full bg-black text-white p-8 flex items-center justify-center">
        <p className="text-xl font-mono text-zinc-500">No data available for sonic analysis.</p>
      </div>
    );
  }

  return (
    <div 
      className="h-full bg-black text-yellow-400 p-8 outline-none flex flex-col" 
      tabIndex={0} 
      onKeyDown={handleKeyDown} 
      autoFocus
      role="application"
      aria-label="Sonic Dashboard. Audio-first interface."
    >
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-8 border-b-4 border-yellow-400 pb-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
             <Volume2 className="w-12 h-12 text-yellow-400" />
             <div>
                <h1 className="text-4xl font-bold uppercase tracking-widest">Sonic Dashboard</h1>
                <p className="text-sm font-mono text-yellow-400/70 mt-1">Audio Interface for Blind/Low-Vision Users</p>
             </div>
           </div>
           
           {/* Status Indicators */}
           <div className="flex gap-4">
              <div className={`px-4 py-2 border-2 rounded-lg flex items-center gap-2 ${isPlaying ? 'border-yellow-400 bg-yellow-400/20' : 'border-zinc-800'}`}>
                 {isPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4 opacity-50" />}
                 <span className="font-mono font-bold text-xs uppercase">{isPlaying ? 'READING DATA' : 'READER IDLE'}</span>
              </div>
              <div className={`px-4 py-2 border-2 rounded-lg flex items-center gap-2 ${liveState.isConnected ? 'border-emerald-500 text-emerald-500' : 'border-zinc-800 text-zinc-600'}`}>
                 {liveState.isConnected ? <Activity className="w-4 h-4 animate-pulse" /> : <WifiOff className="w-4 h-4" />}
                 <span className="font-mono font-bold text-xs uppercase">{liveState.isConnected ? 'NEURAL BRIDGE: LISTENING' : 'BRIDGE DISCONNECTED'}</span>
              </div>
           </div>
        </div>

        {/* Instructions / Role Clarity */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-start gap-3">
           <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
           <div className="text-sm font-mono text-zinc-300">
              <strong className="text-white">Role Separation:</strong> I am your <u>Navigation Assistant</u> (Synthesized Voice). I read the charts. The <u>Neural Bridge</u> (Human-like Voice) is listening silently in the background. Ask it complex questions anytime.
           </div>
        </div>
      </div>

      {/* WIDGET LIST */}
      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2" role="list">
        {widgets.map((widget, idx) => (
          <div
            key={widget.id}
            role="listitem"
            aria-selected={idx === focusedIndex}
            onClick={() => { setFocusedIndex(idx); handlePlayBrief(widget); }}
            className={`p-6 border-4 rounded-xl cursor-pointer transition-all ${
              idx === focusedIndex ? 'border-yellow-400 bg-yellow-400/10 scale-[1.02]' : 'border-zinc-800 bg-zinc-900 opacity-60'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold tracking-tight">{widget.title}</h2>
              {idx === focusedIndex && <Play className="w-6 h-6 text-yellow-400 fill-current" />}
            </div>
            
            {/* Display raw content for screen readers or low vision checking */}
            <div className="font-mono text-sm text-zinc-400 truncate">
               {typeof widget.content === 'object' 
                  ? Object.entries(widget.content || {}).map(([k,v]) => `${k}: ${v}`).join(' | ').slice(0, 80) + '...'
                  : 'No textual data available.'
               }
            </div>
          </div>
        ))}
      </div>
      
      {/* FOOTER CONTROLS */}
      <div className="mt-6 flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800">
         <div className="font-bold text-xs uppercase tracking-widest text-zinc-500">
            Navigation Controls
         </div>
         <div className="flex gap-4 font-mono text-sm">
            <span><kbd className="bg-zinc-800 px-2 py-1 rounded">↑/↓</kbd> Navigate</span>
            <span><kbd className="bg-zinc-800 px-2 py-1 rounded">ENTER</kbd> Read</span>
            <span><kbd className="bg-zinc-800 px-2 py-1 rounded">SPACE</kbd> Ask Bridge</span>
            <button onClick={handleStopAudio} className="flex items-center gap-2 bg-red-900/50 hover:bg-red-900 text-red-200 px-3 py-1 rounded border border-red-900/50 transition-colors">
               <StopCircle className="w-4 h-4" /> <kbd className="font-sans">ESC</kbd> STOP AUDIO
            </button>
         </div>
      </div>
    </div>
  );
};
