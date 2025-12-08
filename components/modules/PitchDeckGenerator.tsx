
import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { motion, AnimatePresence } from 'framer-motion';
import { Presentation, Wand2, ChevronLeft, ChevronRight, FileDown, Mic2 } from 'lucide-react';
import { generatePitchDeck } from '../../services/geminiService';
import { SearchVisualizer } from '../ui/SearchVisualizer';

export const PitchDeckGenerator: React.FC = () => {
  const { 
    context, 
    pitchDeck, 
    setPitchDeck, 
    isGeneratingPitch, 
    setGeneratingPitch,
    research,
    competitors,
    financialInputs 
  } = useAppStore();

  const [currentSlide, setCurrentSlide] = useState(0);

  const handleGenerate = async () => {
    if (!context) return;
    setGeneratingPitch(true);
    try {
      const deck = await generatePitchDeck(context, research.dossier, competitors, financialInputs);
      setPitchDeck(deck);
      setCurrentSlide(0);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingPitch(false);
    }
  };

  const nextSlide = () => {
    if (pitchDeck && pitchDeck.slides && currentSlide < pitchDeck.slides.length - 1) setCurrentSlide(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  if (isGeneratingPitch) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <SearchVisualizer 
          query={`Pitch Deck Synthesis: ${context?.businessName}`} 
          steps={[
            "Structuring narrative arc...",
            "Synthesizing competitor weaknesses...",
            "Visualizing financial runway...",
            "Drafting founder story...",
            "Optimizing for Series-A investors..."
          ]} 
        />
      </div>
    );
  }

  if (!pitchDeck || !pitchDeck.slides || pitchDeck.slides.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-tech-purple/10 flex items-center justify-center mb-6 shadow-glow relative group cursor-pointer" onClick={handleGenerate}>
          <Presentation className="w-12 h-12 text-tech-purple group-hover:scale-110 transition-transform" />
          <div className="absolute inset-0 border border-tech-purple/30 rounded-full animate-pulse opacity-50" />
        </div>
        <h2 className="text-3xl font-light text-white mb-4">Venture Pitch Architect</h2>
        <p className="text-white/40 max-w-md mb-8 leading-relaxed">
          Transform your gathered intelligence into a 10-slide, investor-ready pitch deck. 
          EntreprenOS will weave your metrics, SWOT, and market data into a compelling narrative.
        </p>
        <button 
          onClick={handleGenerate}
          className="px-8 py-4 bg-tech-purple hover:bg-purple-500 text-white rounded-xl font-medium tracking-wide flex items-center gap-3 transition-all hover:scale-105 shadow-xl"
        >
          <Wand2 className="w-5 h-5" />
          Generate Deck
        </button>
      </div>
    );
  }

  const slide = pitchDeck.slides[currentSlide];
  if (!slide) return null;

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6 p-6 overflow-hidden">
      
      {/* MAIN SLIDE VIEW */}
      <GlassPane className="flex-[3] flex flex-col relative overflow-hidden bg-white/5">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
               Slide {currentSlide + 1} / {pitchDeck.slides.length}
             </span>
             <h2 className="text-sm font-medium text-white">{slide.title}</h2>
           </div>
           <button className="text-xs flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <FileDown className="w-4 h-4" /> Export PDF
           </button>
        </div>

        {/* Slide Content */}
        <div className="flex-1 p-16 flex flex-col justify-center items-center text-center relative">
           <div className="absolute inset-0 bg-gradient-to-br from-nebula-950 via-nebula-900 to-nebula-950 -z-10" />
           <div className="absolute top-0 right-0 w-64 h-64 bg-tech-purple/10 blur-[100px] rounded-full pointer-events-none" />
           
           <motion.div
             key={currentSlide}
             initial={{ opacity: 0, scale: 0.95, y: 10 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             transition={{ duration: 0.4 }}
             className="max-w-3xl w-full"
           >
             <div className="text-tech-cyan font-mono text-sm uppercase tracking-[0.2em] mb-6">{slide.subtitle}</div>
             <h1 className="text-5xl font-light text-white mb-12 leading-tight">{slide.title}</h1>
             
             <div className="grid grid-cols-1 gap-6 text-left">
               {slide.contentPoints.map((point, idx) => (
                 <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-tech-purple mt-2 shrink-0" />
                    <span className="text-lg text-white/80 font-light">{point}</span>
                 </div>
               ))}
             </div>

             {/* Visual Placeholder */}
             <div className="mt-12 p-6 border border-dashed border-white/20 rounded-xl bg-white/5">
                <div className="text-[10px] font-mono text-white/30 uppercase mb-2">Suggested Visual</div>
                <div className="text-sm text-white/50 italic">"{slide.visualPrompt}"</div>
             </div>
           </motion.div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between">
           <button onClick={prevSlide} disabled={currentSlide === 0} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30">
             <ChevronLeft className="w-6 h-6 text-white" />
           </button>
           
           {/* Progress Dots */}
           <div className="flex gap-2">
             {pitchDeck.slides.map((_, idx) => (
               <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentSlide ? 'bg-tech-purple w-4' : 'bg-white/20'}`} />
             ))}
           </div>

           <button onClick={nextSlide} disabled={currentSlide === pitchDeck.slides.length - 1} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30">
             <ChevronRight className="w-6 h-6 text-white" />
           </button>
        </div>
      </GlassPane>

      {/* SPEAKER NOTES SIDEBAR */}
      <GlassPane className="flex-1 bg-nebula-900/60 p-6 flex flex-col">
         <div className="flex items-center gap-2 mb-6">
            <Mic2 className="w-4 h-4 text-tech-cyan" />
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/60">Speaker Notes</h3>
         </div>
         
         <div className="flex-1 overflow-y-auto custom-scrollbar">
            <motion.p 
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-white/80 leading-relaxed font-light whitespace-pre-wrap"
            >
              {slide.speakerNotes}
            </motion.p>
         </div>

         <div className="mt-6 pt-6 border-t border-white/5">
            <div className="text-[10px] text-white/30 font-mono mb-2">AI TIP</div>
            <div className="text-xs text-white/50 italic">
               "Keep your tone confident but humble. Focus on the metrics in slide 6 to back up these claims."
            </div>
         </div>
      </GlassPane>

    </div>
  );
};
