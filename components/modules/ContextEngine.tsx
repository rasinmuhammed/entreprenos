
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Mic, Video, StopCircle, Play, Activity, ListChecks, Cpu, Terminal, ChevronRight, Camera, Loader2, User, Building, MapPin, Target, LayoutGrid, CheckSquare, Sparkles, HelpCircle, BrainCircuit } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { analyzeMultimodalPitch, performDeepResearch, constructDashboard, generateStrategicQuestions, processSaaSOnboarding } from '../../services/geminiService';
import { GlassPane } from '../ui/GlassPane';
import { SearchVisualizer } from '../ui/SearchVisualizer';
import { EntityDossier, SaaSOnboardingData } from '../../types';
import { useMultimodalInput } from '../../hooks/useMultimodalInput';
import { AudioVisualizer } from '../ui/AudioVisualizer';

enum Phase {
  INIT = 0,
  SHARK_TANK_PITCH = 1,
  SAAS_WIZARD = 2,
  ANALYZING_INPUT = 3,
  CONFIRM_IDENTITY = 4,
  GENERATING_QUESTIONS = 5,
  CONSULTATION = 6,
  SEARCHING_SENTIMENT = 7,
  BUILDING_OS = 8
}

export const ContextEngine: React.FC = () => {
  const { 
    setContext, 
    setWidgets, 
    setDossier, 
    setSentiment,
    setConsultationQuestions,
    setBusinessProfile,
    research,
    userRole
  } = useAppStore();

  const [phase, setPhase] = useState<Phase>(Phase.INIT);
  const [error, setError] = useState<string | null>(null);
  const isAlly = userRole === 'ALLY';

  useEffect(() => {
    if (phase === Phase.INIT) {
      setPhase(isAlly ? Phase.SAAS_WIZARD : Phase.SHARK_TANK_PITCH);
    }
  }, [isAlly, phase]);
  
  // Shark Tank State
  const { isRecording, startRecording, stopRecording, stream } = useMultimodalInput();
  const videoRef = useRef<HTMLVideoElement>(null);

  // SaaS Wizard State
  const [wizardStep, setWizardStep] = useState(0);
  const [saasData, setSaasData] = useState<SaaSOnboardingData>({
    businessName: '',
    industry: '',
    location: '',
    description: '',
    goals: [],
    integrations: [],
    operationalStyle: '',
    digitalMaturity: ''
  });

  // Consultation State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{question: string, answer: string}[]>([]);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleStopPitch = async () => {
    if (!isRecording) return;
    setPhase(Phase.ANALYZING_INPUT);
    try {
      const blobs = await stopRecording();
      if (!blobs) throw new Error("Recording failed");
      const dossier = await analyzeMultimodalPitch(blobs.audioBlob, blobs.videoBlob);
      setDossier(dossier);
      setPhase(Phase.CONFIRM_IDENTITY);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try pitching again.");
      setPhase(Phase.SHARK_TANK_PITCH);
    }
  };

  const handleWizardSubmit = async () => {
    setPhase(Phase.ANALYZING_INPUT);
    try {
      const dossier = await processSaaSOnboarding(saasData);
      setDossier(dossier);
      setPhase(Phase.CONFIRM_IDENTITY);
    } catch (err) {
      console.error(err);
      setError("Processing failed.");
      setPhase(Phase.SAAS_WIZARD);
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
        generatedAt: Date.now(),
        accessibilityMode: useAppStore.getState().accessibilityMode
      });
    } catch (err) {
      console.error(err);
      setError("Intelligence gathering failed during deep scan.");
      setPhase(Phase.CONFIRM_IDENTITY);
    }
  };

  // --- WIZARD RENDERER ---
  const renderWizard = () => {
    const steps = [
      { title: "The Vision", icon: <Building />, tip: "We'll build your brand dossier from this." },
      { title: "The Operations", icon: <BrainCircuit />, tip: "This helps us tailor the UI complexity." },
      { title: "The Ecosystem", icon: <LayoutGrid />, tip: "We'll auto-connect these services." }
    ];

    const currentTip = steps[wizardStep].tip;

    return (
      <div className="flex gap-6 max-w-5xl w-full mx-auto">
        {/* Main Wizard Pane */}
        <GlassPane className="flex-[2] p-8 relative overflow-hidden bg-nebula-900/90 min-h-[500px] flex flex-col">
           <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
              <div>
                 <h2 className="text-2xl font-light text-white mb-1">System Configuration</h2>
                 <p className="text-white/40 text-sm">Step {wizardStep + 1} of {steps.length}: {steps[wizardStep].title}</p>
              </div>
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === wizardStep ? 'bg-tech-cyan' : 'bg-white/10'}`} />
                ))}
              </div>
           </div>

           <div className="flex-1">
             {wizardStep === 0 && (
               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-xs font-mono uppercase text-white/40">Venture Name</label>
                     <input 
                        type="text" 
                        value={saasData.businessName}
                        onChange={e => setSaasData({...saasData, businessName: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white focus:border-tech-cyan/50 focus:outline-none transition-colors"
                        placeholder="e.g. Acme Corp"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-mono uppercase text-white/40">Core Model</label>
                     <input 
                        type="text" 
                        value={saasData.industry}
                        onChange={e => setSaasData({...saasData, industry: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white focus:border-tech-cyan/50 focus:outline-none transition-colors"
                        placeholder="e.g. B2B SaaS, Local Bakery"
                     />
                   </div>
                 </div>
                 <div className="space-y-2">
                     <label className="text-xs font-mono uppercase text-white/40">Primary Location</label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-4 h-4 text-white/30" />
                        <input 
                            type="text" 
                            value={saasData.location}
                            onChange={e => setSaasData({...saasData, location: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 pl-12 text-white focus:border-tech-cyan/50 focus:outline-none transition-colors"
                            placeholder="City, State (or 'Global')"
                        />
                     </div>
                 </div>
                 <div className="space-y-2">
                     <label className="text-xs font-mono uppercase text-white/40">Elevator Pitch</label>
                     <textarea 
                        value={saasData.description}
                        onChange={e => setSaasData({...saasData, description: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white focus:border-tech-cyan/50 focus:outline-none h-32 resize-none transition-colors"
                        placeholder="What problem do you solve, and for whom?"
                     />
                 </div>
               </div>
             )}

             {wizardStep === 1 && (
               <div className="space-y-8">
                 <div className="space-y-4">
                   <label className="text-xs font-mono uppercase text-white/40 block">Operational Style (Determines UI Density)</label>
                   <div className="grid grid-cols-2 gap-4">
                      {['Solo & Agile', 'Team & Structured'].map(style => (
                        <button
                           key={style}
                           onClick={() => setSaasData({...saasData, operationalStyle: style})}
                           className={`p-4 rounded-xl border text-left transition-all ${
                              saasData.operationalStyle === style 
                              ? 'bg-tech-cyan/10 border-tech-cyan text-white' 
                              : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                           }`}
                        >
                          <span className="font-medium">{style}</span>
                        </button>
                      ))}
                   </div>
                 </div>

                 <div className="space-y-4">
                   <label className="text-xs font-mono uppercase text-white/40 block">Digital Maturity</label>
                   <div className="grid grid-cols-3 gap-3">
                      {['Just Starting', 'Growing', 'Scaling'].map(lvl => (
                        <button
                           key={lvl}
                           onClick={() => setSaasData({...saasData, digitalMaturity: lvl})}
                           className={`p-3 rounded-xl border text-center text-sm transition-all ${
                              saasData.digitalMaturity === lvl 
                              ? 'bg-tech-purple/10 border-tech-purple text-white' 
                              : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                           }`}
                        >
                          {lvl}
                        </button>
                      ))}
                   </div>
                 </div>
                 
                 <div className="space-y-4">
                   <label className="text-xs font-mono uppercase text-white/40 block">Top 3 Success Metrics</label>
                   <div className="flex flex-wrap gap-2">
                     {['Revenue', 'Profit', 'Retention', 'Traffic', 'Compliance', 'Inventory', 'Brand'].map(goal => (
                       <button 
                         key={goal}
                         onClick={() => {
                            const newGoals = saasData.goals.includes(goal) 
                              ? saasData.goals.filter(g => g !== goal)
                              : [...saasData.goals, goal];
                            if (newGoals.length <= 3) setSaasData({...saasData, goals: newGoals});
                         }}
                         className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                            saasData.goals.includes(goal) 
                              ? 'bg-white text-nebula-950 border-white' 
                              : 'bg-transparent border-white/20 text-white/40 hover:border-white/50'
                         }`}
                       >
                         {goal}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>
             )}

             {wizardStep === 2 && (
               <div className="space-y-6">
                 <p className="text-white/60 text-sm">We'll automatically connect to these services to pull your data:</p>
                 <div className="grid grid-cols-1 gap-3">
                   {[
                     { id: 'gbp', name: 'Google Business Profile', icon: <MapPin />, desc: 'For reviews and local presence' },
                     { id: 'shopify', name: 'Shopify / E-commerce', icon: <LayoutGrid />, desc: 'For inventory and sales data' },
                     { id: 'quickbooks', name: 'Quickbooks / Xero', icon: <Terminal />, desc: 'For burn rate and runway' },
                     { id: 'stripe', name: 'Stripe / Payments', icon: <CheckSquare />, desc: 'For MRR and revenue trends' }
                   ].map(tool => (
                     <button 
                       key={tool.id}
                       onClick={() => {
                          const newInts = saasData.integrations.includes(tool.id) 
                            ? saasData.integrations.filter(i => i !== tool.id)
                            : [...saasData.integrations, tool.id];
                          setSaasData({...saasData, integrations: newInts});
                       }}
                       className={`p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${
                          saasData.integrations.includes(tool.id) 
                            ? 'bg-tech-purple/10 border-tech-purple/50 text-white' 
                            : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'
                       }`}
                     >
                       <div className={`p-2 rounded-lg ${saasData.integrations.includes(tool.id) ? 'bg-tech-purple/20' : 'bg-white/5'}`}>
                          {React.cloneElement(tool.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                       </div>
                       <div>
                         <div className="font-medium text-sm">{tool.name}</div>
                         <div className="text-xs opacity-50">{tool.desc}</div>
                       </div>
                       {saasData.integrations.includes(tool.id) && <CheckCircle2 className="w-5 h-5 text-tech-purple ml-auto" />}
                     </button>
                   ))}
                 </div>
               </div>
             )}
           </div>

           <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/10">
              {wizardStep > 0 ? (
                 <button 
                   onClick={() => setWizardStep(prev => prev - 1)}
                   className="text-white/40 hover:text-white text-sm"
                 >
                   Back
                 </button>
              ) : (
                 <button 
                   onClick={() => setPhase(Phase.SHARK_TANK_PITCH)}
                   className="text-white/40 hover:text-white text-sm underline decoration-white/20 underline-offset-4"
                 >
                   Switch to Live Video Pitch
                 </button>
              )}

              <button 
                 onClick={() => {
                    if (wizardStep < steps.length - 1) setWizardStep(prev => prev + 1);
                    else handleWizardSubmit();
                 }}
                 disabled={wizardStep === 0 && !saasData.businessName}
                 className="bg-tech-cyan hover:bg-cyan-400 text-nebula-950 px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-cyan"
              >
                 {wizardStep === steps.length - 1 ? "Initialize Command Center" : "Next Step"}
                 <ArrowRight className="w-4 h-4" />
              </button>
           </div>
        </GlassPane>

        {/* Sidebar Guide */}
        <div className="flex-1 hidden lg:flex flex-col gap-4 pt-12">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-20 h-20 bg-tech-cyan/10 blur-2xl rounded-full" />
               <div className="flex items-center gap-2 mb-4 text-tech-cyan">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-mono text-xs uppercase tracking-widest">OS Guide</span>
               </div>
               <p className="text-white/80 text-sm leading-relaxed mb-4">
                  {currentTip}
               </p>
               <div className="h-1 w-12 bg-tech-cyan/30 rounded-full" />
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 opacity-60">
               <div className="flex items-center gap-2 mb-2 text-white/50">
                  <HelpCircle className="w-4 h-4" />
                  <span className="font-mono text-xs uppercase tracking-widest">Why we ask</span>
               </div>
               <p className="text-white/50 text-xs leading-relaxed">
                  EntreprenOS uses "Generative UI" to build a custom interface. The more context you provide about your operations, the more tailored your tools will be.
               </p>
            </div>
        </div>
      </div>
    );
  };

  // --- RENDER HELPERS ---
  const renderDossierCard = (dossier: EntityDossier) => (
    <GlassPane className="p-8 max-w-2xl w-full mx-auto border-t-4 border-t-tech-emerald">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-tech-emerald animate-pulse"/>
            <span className="text-tech-emerald font-mono text-xs uppercase tracking-widest">Entity Synthesized</span>
          </div>
          <h2 className="text-4xl text-white font-light tracking-tight">{dossier.name}</h2>
          {dossier.location && <div className="text-white/40 text-sm mt-1 flex items-center gap-1"><Terminal className="w-3 h-3"/> {dossier.location}</div>}
        </div>
        <div className="px-4 py-2 bg-tech-emerald/10 border border-tech-emerald/20 text-tech-emerald rounded-lg text-xs font-mono tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
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
          onClick={() => setPhase(isAlly ? Phase.SAAS_WIZARD : Phase.SHARK_TANK_PITCH)}
          className="px-6 py-4 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-wider"
        >
          [ Edit Data ]
        </button>
        <button 
          onClick={handleStartConsultation}
          className="flex-1 bg-tech-cyan/10 hover:bg-tech-cyan/20 border border-tech-cyan/50 text-tech-cyan font-medium rounded-lg flex items-center justify-center gap-3 transition-all hover:shadow-glow-cyan group"
        >
          <Activity className="w-4 h-4" />
          <span>Confirm & Build OS</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </GlassPane>
  );

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative z-10 p-4">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: SHARK TANK PITCH */}
        {phase === Phase.SHARK_TANK_PITCH && (
          <motion.div
            key="input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            className="w-full max-w-2xl mx-auto"
          >
            <div className="text-center mb-10">
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/60 mb-4"
               >
                 <Video className="w-3 h-3 text-tech-rose" />
                 <span>LIVE PITCH MODE</span>
               </motion.div>
               <h1 className="text-5xl md:text-6xl font-light text-white tracking-tighter mb-4 text-glow">
                 Pitch Your <span className="text-tech-cyan font-normal">Vision</span>
               </h1>
               <p className="text-white/40 text-lg font-light max-w-lg mx-auto">
                 Don't just type. Show us your world. The AI will analyze your product and passion.
               </p>
            </div>

            <GlassPane className="p-6 bg-nebula-900/80 border-white/20 shadow-2xl relative overflow-hidden">
               {/* Camera Viewfinder */}
               <div className="aspect-video bg-black rounded-xl overflow-hidden relative mb-6 border border-white/10 group">
                  {isRecording ? (
                     <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                  ) : (
                     <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                        <Camera className="w-12 h-12 text-white/20" />
                     </div>
                  )}
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-rose-500/80 backdrop-blur px-3 py-1 rounded-full z-10">
                       <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                       <span className="text-xs font-bold text-white uppercase tracking-wider">Rec</span>
                    </div>
                  )}
                  {isRecording && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent flex items-end px-6 pb-4">
                       <AudioVisualizer stream={stream} />
                    </div>
                  )}
               </div>

               <div className="flex justify-center mb-4">
                 {!isRecording ? (
                   <button 
                     onClick={startRecording}
                     className="w-16 h-16 rounded-full bg-tech-cyan hover:bg-cyan-400 flex items-center justify-center shadow-glow-cyan transition-all hover:scale-105 group"
                   >
                     <Mic className="w-6 h-6 text-nebula-950 group-hover:scale-110 transition-transform" />
                   </button>
                 ) : (
                   <button 
                     onClick={handleStopPitch}
                     className="w-16 h-16 rounded-full bg-tech-rose hover:bg-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all hover:scale-105 group"
                   >
                     <StopCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                   </button>
                 )}
               </div>

               <div className="text-center text-xs font-mono text-white/30">
                 <button onClick={() => setPhase(Phase.SAAS_WIZARD)} className="hover:text-white underline decoration-white/20 underline-offset-4">
                    Or use the Configuration Wizard
                 </button>
               </div>
            </GlassPane>
            
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center text-tech-rose font-mono text-xs bg-tech-rose/10 py-2 rounded border border-tech-rose/20">
                 [ERROR] {error}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* PHASE 2: SAAS WIZARD */}
        {phase === Phase.SAAS_WIZARD && (
           <motion.div
             key="wizard"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="w-full"
           >
              {renderWizard()}
           </motion.div>
        )}

        {/* PHASE 3 & 7: SEARCH VISUALIZER */}
        {(phase === Phase.ANALYZING_INPUT || phase === Phase.SEARCHING_SENTIMENT) && (
          <motion.div key="search" exit={{ opacity: 0 }} className="w-full max-w-3xl">
             <SearchVisualizer 
                query={phase === Phase.ANALYZING_INPUT ? "Processing Input Stream" : "Deep Sector Scan"} 
                steps={phase === Phase.ANALYZING_INPUT ? [
                  "Parsing structural data...",
                  "Extracting semantic intent...",
                  "Identifying ecosystem nodes...",
                  "Synthesizing Venture Dossier..."
                ] : [
                  "Auditing digital presence assets...",
                  "Checking Google Maps visibility...",
                  "Scanning local competitors...",
                  "Calculating growth opportunities..."
                ]}
             />
          </motion.div>
        )}

        {/* PHASE 4: CONFIRMATION */}
        {phase === Phase.CONFIRM_IDENTITY && research.dossier && (
          <motion.div 
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            {renderDossierCard(research.dossier)}
          </motion.div>
        )}

        {/* PHASE 5: GENERATING (Loader) */}
        {phase === Phase.GENERATING_QUESTIONS && (
           <motion.div key="gen" className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-tech-purple border-t-transparent rounded-full animate-spin mb-6" />
              <div className="font-mono text-tech-purple text-sm animate-pulse">CALIBRATING STRATEGY...</div>
           </motion.div>
        )}

        {/* PHASE 6: CONSULTATION */}
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
                     {research.questions[currentQuestionIndex].options?.map((opt, idx) => (
                       <button
                         key={idx}
                         onClick={() => {
                           const val = typeof opt === 'string' ? opt : (opt as any).value || (opt as any).label || (opt as any).text;
                           handleAnswerSelect(val || JSON.stringify(opt));
                         }}
                         className="w-full text-left p-5 rounded-lg bg-white/5 hover:bg-tech-cyan/10 border border-white/5 hover:border-tech-cyan/50 transition-all text-white/70 hover:text-white flex justify-between items-center group relative overflow-hidden"
                       >
                         <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-tech-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                         <span className="font-mono text-sm">
                           {typeof opt === 'string' ? opt : (opt as any).label || (opt as any).text || (opt as any).value || JSON.stringify(opt)}
                         </span>
                         <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-tech-cyan" />
                       </button>
                     ))}
                   </div>
                 </motion.div>
               </AnimatePresence>
             </GlassPane>
          </motion.div>
        )}

        {/* PHASE 8: BUILDING */}
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
