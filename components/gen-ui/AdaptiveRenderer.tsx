
import React from 'react';
import { useAppStore } from '../../store/appStore';
import { AccessibilityMode } from '../../types';
import { GoldenGrid } from '../layout/GoldenGrid';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Focus, Eye } from 'lucide-react';

export const AdaptiveRenderer: React.FC = () => {
  const { accessibilityMode, widgets } = useAppStore();

  const variants = {
    [AccessibilityMode.STANDARD]: (
      <GoldenGrid widgets={widgets} />
    ),
    
    // BLIND / LOW VISION: Linear, High Contrast, Semantic Audio
    [AccessibilityMode.SONIC_VIEW]: (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div className="bg-yellow-400 text-black p-6 rounded-none border-4 border-black font-mono text-2xl font-bold uppercase tracking-wider mb-8 flex items-center gap-4">
           <Volume2 className="w-10 h-10" /> Sonic View Active
        </div>
        
        {widgets.map(widget => (
           <div key={widget.id} className="border-b-4 border-white/20 pb-8" role="region" aria-label={widget.title}>
              <h2 className="text-4xl font-bold text-white mb-4">{widget.title}</h2>
              {/* Simplified Semantic Content */}
              <div className="text-2xl text-white/80 leading-relaxed">
                 {JSON.stringify(widget.content).slice(0, 150)}...
              </div>
              <button className="mt-6 px-8 py-4 bg-white text-black text-xl font-bold hover:bg-yellow-400 transition-colors">
                 Interact with {widget.title}
              </button>
           </div>
        ))}
      </div>
    ),

    // NEURODIVERGENT: Tunnel Vision, No Clutter
    [AccessibilityMode.FOCUS_SHIELD]: (
      <div className="h-full flex items-center justify-center bg-black">
         <div className="max-w-2xl w-full text-center">
            <div className="mb-12 inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full text-zinc-500 font-mono text-xs uppercase tracking-widest">
               <Focus className="w-4 h-4" /> Focus Shield Engaged
            </div>
            
            {/* Show only the most critical widget */}
            {widgets.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-zinc-900 border border-zinc-800 p-12 rounded-3xl"
               >
                  <h1 className="text-4xl text-white font-light mb-8">{widgets[0].title}</h1>
                  <div className="text-zinc-400 text-lg mb-12">
                     {/* Simplified Content */}
                     One task at a time. Process this item.
                  </div>
                  <button className="w-full py-6 bg-white text-black text-xl font-medium rounded-xl hover:bg-zinc-200 transition-colors">
                     Complete & Next
                  </button>
               </motion.div>
            )}
         </div>
      </div>
    ),

    // DEAF: Sentiment HUD
    [AccessibilityMode.SENTIMENT_HUD]: (
      <div className="h-full relative">
         <div className="absolute top-4 right-4 flex gap-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-full text-xs font-mono uppercase">
               Visual Audio
            </span>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/40 rounded-full text-xs font-mono uppercase">
               Sentiment: Positive
            </span>
         </div>
         <GoldenGrid widgets={widgets} />
         {/* Overlay Captions would go here */}
      </div>
    )
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={accessibilityMode}
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(10px)" }}
        transition={{ duration: 0.5 }}
        className="h-full w-full overflow-y-auto"
      >
        {variants[accessibilityMode]}
      </motion.div>
    </AnimatePresence>
  );
};
