
import React, { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { synthesizeWidgetAudio } from '../../services/audio/semanticSynthesizer';
import { Volume2, Play, Rewind, FastForward } from 'lucide-react';
import { WidgetData, View } from '../../types';

export const SonicDashboard: React.FC = () => {
  const { widgets, audioBriefs, setAudioBrief, setView, addBlindStrategistMessage } = useAppStore();
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  // Announce Instructions on Mount
  useEffect(() => {
     const msg = new SpeechSynthesisUtterance("Sonic Dashboard Active. Use Up and Down arrows to navigate. Press Enter for summary. Spacebar for deep dive.");
     msg.rate = 1.1; 
     window.speechSynthesis.speak(msg);
  }, []);

  const handlePlayBrief = async (widget: WidgetData) => {
    let text = audioBriefs[widget.id];
    if (!text) {
      text = await synthesizeWidgetAudio(widget);
      setAudioBrief(widget.id, text);
    }
    const msg = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'j') {
      setFocusedIndex(i => Math.min(i + 1, widgets.length - 1));
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      setFocusedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (widgets[focusedIndex]) {
        handlePlayBrief(widgets[focusedIndex]);
      }
    } else if (e.key === ' ' || e.key === 'Spacebar') {
       e.preventDefault();
       const activeWidget = widgets[focusedIndex];
       if (activeWidget) {
          // Deep Dive: Switch to Strategist with context
          // Since BlindStrategist is visible in the 'BLIND' layout, we trigger it via message injection.
          addBlindStrategistMessage({
             id: Math.random().toString(),
             sender: 'system',
             text: `Analyzing ${activeWidget.title}...`,
             timestamp: Date.now()
          });
          
          const utterance = new SpeechSynthesisUtterance("Opening deep dive analysis. Ask a question.");
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
      className="h-full bg-black text-white p-8 outline-none" 
      tabIndex={0} 
      onKeyDown={handleKeyDown} 
      autoFocus
      role="application"
      aria-label="Sonic Dashboard. Use Up and Down arrow keys to navigate widgets. Press Enter to hear a summary. Spacebar for details."
    >
      <div className="flex items-center gap-4 mb-8 border-b-4 border-yellow-400 pb-4">
        <Volume2 className="w-12 h-12 text-yellow-400" />
        <h1 className="text-4xl font-bold uppercase tracking-widest">Sonic Dashboard</h1>
      </div>

      <div className="space-y-4" role="list">
        {widgets.map((widget, idx) => (
          <div
            key={widget.id}
            role="listitem"
            aria-selected={idx === focusedIndex}
            onClick={() => { setFocusedIndex(idx); handlePlayBrief(widget); }}
            className={`p-6 border-4 rounded-xl cursor-pointer transition-all ${
              idx === focusedIndex ? 'border-yellow-400 bg-yellow-400/20 scale-105' : 'border-zinc-800 bg-zinc-900 opacity-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{widget.title}</h2>
              {idx === focusedIndex && <Play className="w-8 h-8 text-yellow-400 fill-current" />}
            </div>
            <div className="mt-2 text-lg font-mono opacity-80 truncate" aria-hidden="true">
               {/* Safe stringify with fallback to avoid crash on undefined content */}
               {(JSON.stringify(widget.content || {})).slice(0, 50)}...
            </div>
          </div>
        ))}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-yellow-400 text-black p-4 font-bold text-center uppercase tracking-widest" aria-hidden="true">
         UP/DOWN: Nav • ENTER: Brief • SPACE: Deep Dive
      </div>
    </div>
  );
};
