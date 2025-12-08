import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Search, Activity, ListChecks, Cpu, Terminal, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { identifyEntity, performDeepResearch, constructDashboard, generateStrategicQuestions } from '../../services/geminiService';
import { GlassPane } from '../ui/GlassPane';
import { SearchVisualizer } from '../ui/SearchVisualizer';
import { EntityDossier } from '../../types';

enum Phase {
  INPUT = 0,
  SEARCHING_IDENTITY = 1,
  CONFIRM_IDENTITY = 2,
  GENERATING_QUESTIONS = 3,
  CONSULTATION = 4,
  SEARCHING_SENTIMENT = 5,
  BUILDING_OS = 6
}

export const ContextEngine: React.FC = () => {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>(Phase.INPUT);
  const [error, setError] = useState<string | null>(null);
  
  // Consultation State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{question: string, answer: string}[]>([]);

  const { 
    setContext, 
    setWidgets, 
    setDossier, 
    setSentiment,
    setConsultationQuestions,
    setBusinessProfile,
    research 
  } = useAppStore();

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setPhase(Phase.SEARCHING_IDENTITY);
    setError(null);

    try {
      const dossier = await identifyEntity(input);
      setDossier(dossier);
      setPhase(Phase.CONFIRM_IDENTITY);
    } catch (err) {
      console.error(err);
      setError("Could not locate entity. Please try being more specific.");
      setPhase(Phase.INPUT);
    }
  };

  const handleStartConsultation = async () => {
     if (!research.dossier) return;
     setPhase(Phase.GENERATING_QUESTIONS);
     
     try {
       const result = await generateStrategicQuestions(research.dossier);
       setConsultationQuestions(result.questions || []);
       setPhase(Phase.CONSULTATION);
     } catch(err) {
       console.error("Consultation gen failed, skipping", err);
       handleDeepScan(); // Fallback
     }
  };

  const handleAnswerSelect = (answer: string) => {
    const currentQ = research.questions[currentQuestionIndex];
    const newAnswers = [...answers, { question: currentQ.text, answer }];
    setAnswers(newAnswers);

    if (currentQuestionIndex < research.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setBusinessProfile({ answers: newAnswers });
      handleDeepScan(newAnswers);
    }
  };

  const handleDeepScan = async (finalAnswers?: {question: string, answer: string}[]) => {
    if (!research.dossier) return;
    
    setPhase(Phase.SEARCHING_SENTIMENT);
    
    try {
      const sentiment = await performDeepResearch(research.dossier);
      setSentiment(sentiment);
      setPhase(Phase.BUILDING_OS);
      
      const profile = finalAnswers ? { answers: finalAnswers } : research.profile;

      const result = await constructDashboard(research.dossier, sentiment, profile);
      
      setWidgets(Array.isArray(result.widgets) ? result.widgets : []);
      setContext({
        name: research.dossier.name,
        businessName: research.dossier.name,
        description: research.dossier.description,
        industry: research.dossier.industry,
        stage: "Live",
        location: research.dossier.location,
        generatedAt: Date.now()
      });
      
    } catch (err) {
      console.error(err);
      setError("Intelligence gathering failed during deep scan.");
      setPhase(Phase.CONFIRM_IDENTITY);
    }
  };

  // --- RENDER HELPERS ---

  const renderDossierCard = (dossier: EntityDossier) => (
    <GlassPane className="p-8 max-w-2xl w-full mx-auto border-t-4 border-t-tech-emerald">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-tech-emerald animate-pulse"/>
            <span className="text-tech-emerald font-mono text-xs uppercase tracking-widest">Target Acquired</span>
          </div>
          <h2 className="text-4xl text-white font-light tracking-tight">{dossier.name}</h2>
          {dossier.location && <div className="text-white/40 text-sm mt-1 flex items-center gap-1"><Terminal className="w-3 h-3"/> {dossier.location}</div>}
        </div>
        <div className="px-4 py-2 bg-tech-emerald/10 border border-tech-emerald/20 text-tech-emerald rounded-lg text-xs font-mono tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRMED
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8 p-6 bg-white/5 rounded-xl border border-white/5">
        <div className="space-y-1">
          <div className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Industry Sector</div>
          <div className="text-white font-medium text-lg">{dossier.industry}</div>
        </div>
        <div className="space-y-1">
          <div className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Key Founders</div>
          <div className="text-white font-medium text-lg">
            {Array.isArray(dossier.founders) ? dossier.founders.join(", ") : (dossier.founders || "Unknown")}
          </div>
        </div>
        <div className="col-span-2 space-y-1 pt-4 border-t border-white/5">
          <div className="text-white/30 text-[10px] font-mono uppercase tracking-wider">Operational Summary</div>
          <div className="text-white/80 text-sm leading-relaxed">{dossier.description}</div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => setPhase(Phase.INPUT)}
          className="px-6 py-4 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-wider"
        >
          [ Cancel ]
        </button>
        <button 
          onClick={handleStartConsultation}
          className="flex-1 bg-tech-cyan/10 hover:bg-tech-cyan/20 border border-tech-cyan/50 text-tech-cyan font-medium rounded-lg flex items-center justify-center gap-3 transition-all hover:shadow-glow-cyan group"
        >
          <Activity className="w-4 h-4" />
          <span>Initiate Calibration Sequence</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </GlassPane>
  );

  return (
    <div className="w-full max-w-3xl mx-auto px-4 relative z-10">
      <AnimatePresence mode="wait">
        
        {/* PHASE 0: INPUT */}
        {phase === Phase.INPUT && (
          <motion.div
            key="input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            className="w-full"
          >
            <div className="text-center mb-10">
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/60 mb-4"
               >
                 <Terminal className="w-3 h-3" />
                 <span>SYSTEM READY</span>
               </motion.div>
               <h1 className="text-5xl md:text-6xl font-light text-white tracking-tighter mb-4 text-glow">
                 Entrepren<span className="text-tech-cyan font-normal">OS</span>
               </h1>
               <p className="text-white/40 text-lg font-light max-w-lg mx-auto">
                 The world's first agentic operating system. Enter your venture to begin.
               </p>
            </div>

            <GlassPane className="p-1 pl-6 flex items-center bg-nebula-900/80 border-white/20 shadow-2xl">
              <ChevronRight className="w-5 h-5 text-tech-cyan animate-pulse mr-2 shrink-0" />
              <form onSubmit={handleIdentify} className="flex-1 flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. My local coffee shop in Brooklyn..."
                  className="w-full bg-transparent border-none py-6 text-xl text-white placeholder-white/20 focus:outline-none focus:ring-0 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-8 m-2 bg-white/10 hover:bg-tech-cyan hover:text-nebula-950 text-white rounded-lg transition-all font-medium"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </GlassPane>
            
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center text-tech-rose font-mono text-xs bg-tech-rose/10 py-2 rounded border border-tech-rose/20">
                 [ERROR] {error}
              </motion.div>
            )}
            
            {/* Suggested Chips */}
            <div className="mt-8 flex justify-center gap-3 flex-wrap">
               {["SpaceX", "Joe's Pizza in NYC", "AI Startup Idea"].map(ex => (
                 <button key={ex} onClick={() => setInput(ex)} className="px-3 py-1.5 rounded border border-white/5 hover:border-white/20 text-white/30 hover:text-white text-xs font-mono transition-colors">
                   "{ex}"
                 </button>
               ))}
            </div>
          </motion.div>
        )}

        {/* PHASE 1 & 5: SEARCH VISUALIZER */}
        {(phase === Phase.SEARCHING_IDENTITY || phase === Phase.SEARCHING_SENTIMENT) && (
          <motion.div key="search" exit={{ opacity: 0 }}>
             <SearchVisualizer 
                query={input || research.dossier?.name || "Entity"} 
                steps={phase === Phase.SEARCHING_IDENTITY ? [
                  "Parsing localized entity data...",
                  "Triangulating business footprint...",
                  "Accessing Google Knowledge Graph..."
                ] : [
                  "Auditing digital presence assets...",
                  "Checking Google Maps visibility...",
                  "Analyzing reviews & sentiment...",
                  "Scanning local competitors...",
                  "Calculating growth opportunities..."
                ]}
             />
          </motion.div>
        )}

        {/* PHASE 2: CONFIRMATION */}
        {phase === Phase.CONFIRM_IDENTITY && research.dossier && (
          <motion.div 
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderDossierCard(research.dossier)}
          </motion.div>
        )}

        {/* PHASE 3: GENERATING (Loader) */}
        {phase === Phase.GENERATING_QUESTIONS && (
           <motion.div key="gen" className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-tech-purple border-t-transparent rounded-full animate-spin mb-6" />
              <div className="font-mono text-tech-purple text-sm animate-pulse">CALIBRATING STRATEGY...</div>
           </motion.div>
        )}

        {/* PHASE 4: CONSULTATION */}
        {phase === Phase.CONSULTATION && research.questions.length > 0 && (
          <motion.div
            key="consultation"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl mx-auto"
          >
             <GlassPane className="p-8">
               <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-tech-purple/20 rounded-lg">
                     <ListChecks className="w-6 h-6 text-tech-purple" />
                   </div>
                   <div>
                     <h2 className="text-xl font-light text-white">Strategic Calibration</h2>
                     <p className="text-xs text-white/50 font-mono mt-1">OPTIMIZING WIDGET CONFIGURATION</p>
                   </div>
                 </div>
                 <div className="text-2xl font-mono text-white/20">
                    0{currentQuestionIndex + 1}<span className="text-base text-white/10">/0{research.questions.length}</span>
                 </div>
               </div>

               <AnimatePresence mode="wait">
                 <motion.div
                   key={currentQuestionIndex}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                 >
                   <h3 className="text-xl text-white mb-8 leading-relaxed font-light">
                     {research.questions[currentQuestionIndex].text}
                   </h3>

                   <div className="space-y-3">
                     {research.questions[currentQuestionIndex].options.map((opt, idx) => (
                       <button
                         key={idx}
                         onClick={() => handleAnswerSelect(opt)}
                         className="w-full text-left p-5 rounded-lg bg-white/5 hover:bg-tech-cyan/10 border border-white/5 hover:border-tech-cyan/50 transition-all text-white/70 hover:text-white flex justify-between items-center group relative overflow-hidden"
                       >
                         <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-tech-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                         <span className="font-mono text-sm">{opt}</span>
                         <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-tech-cyan" />
                       </button>
                     ))}
                   </div>
                 </motion.div>
               </AnimatePresence>
             </GlassPane>
          </motion.div>
        )}

        {/* PHASE 6: BUILDING */}
        {phase === Phase.BUILDING_OS && (
          <motion.div key="building" className="text-center" exit={{ opacity: 0 }}>
             <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="inline-block relative"
             >
               <Cpu className="w-16 h-16 text-white/20" />
               <div className="absolute inset-0 border-t-2 border-tech-cyan rounded-full animate-spin" />
             </motion.div>
             <h2 className="text-2xl text-white mt-6 font-light tracking-wide">Synthesizing Core</h2>
             <div className="w-64 h-1 bg-white/10 rounded-full mx-auto mt-6 overflow-hidden">
                <div className="h-full bg-tech-cyan w-1/2 animate-shimmer" />
             </div>
             <p className="text-white/40 text-xs font-mono mt-4">ALLOCATING RESOURCES</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};