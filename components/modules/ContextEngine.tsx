import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, StopCircle, Camera, Keyboard, MessageSquare, Zap, MapPin, Check } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { analyzeMultimodalPitch, performDeepResearch, constructDashboard, processSaaSOnboarding } from '../../services/geminiService';
import { GlassPane } from '../ui/GlassPane';
import { SearchVisualizer } from '../ui/SearchVisualizer';
import { useMultimodalInput } from '../../hooks/useMultimodalInput';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import { liveBridge } from '../../services/geminiLiveBridge';
import { AccessibilityMode, ThemeMode } from '../../types';

enum Phase { INIT = 0, PITCH = 1, WIZARD = 2, MICRO_WIZARD = 3, ANALYZING = 4, VERIFY_LOCATION = 5, BUILDING = 6 }

export const ContextEngine: React.FC = () => {
  const { setContext, setWidgets, setDossier, setSentiment, startOnboarding, accessibilityMode, research, setThemeMode } = useAppStore();
  const [phase, setPhase] = useState<Phase>(Phase.INIT);
  const [error, setError] = useState<string | null>(null);
  const [buildSteps, setBuildSteps] = useState<string[]>([]);
  
  const { isRecording, startRecording, stopRecording, stream } = useMultimodalInput();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    switch (accessibilityMode) {
      case AccessibilityMode.SONIC_VIEW:
        setPhase(Phase.PITCH);
        const msg = new SpeechSynthesisUtterance("EntreprenOS is listening. Describe your business in one breath.");
        window.speechSynthesis.speak(msg);
        break;
      case AccessibilityMode.SENTIMENT_HUD: setPhase(Phase.WIZARD); break;
      case AccessibilityMode.FOCUS_SHIELD: setPhase(Phase.MICRO_WIZARD); break;
      default: setPhase(Phase.PITCH); break;
    }
  }, [accessibilityMode]);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  const handleStopPitch = async () => {
    if (!isRecording) return;
    setPhase(Phase.ANALYZING);
    setBuildSteps(["Processing sensory input...", "Extracting business semantics...", "Analyzing emotional tone..."]);
    try {
      const blobs = await stopRecording();
      if (!blobs) throw new Error("Recording failed");
      const dossier = await analyzeMultimodalPitch(blobs.audioBlob, blobs.videoBlob);
      setDossier(dossier);
      // Intercept for location verification
      setPhase(Phase.VERIFY_LOCATION);
    } catch (err) {
      console.error(err);
      setError("Analysis failed.");
      setPhase(Phase.PITCH);
    }
  };

  const handleTextBuild = async (name: string, description: string) => {
    setPhase(Phase.ANALYZING);
    setBuildSteps([`Target Acquired: ${name}`, "Synthesizing strategy...", "Constructing OS..."]);
    try {
      const dossier = await processSaaSOnboarding({
        businessName: name, description, industry: "Unknown", location: "Global",
        goals: [], integrations: [], operationalStyle: "Adaptive", digitalMaturity: "Startup"
      });
      setDossier(dossier);
      // Intercept for location verification
      setPhase(Phase.VERIFY_LOCATION);
    } catch (err) {
      console.error(err);
      setError("Construction failed.");
      setPhase(Phase.INIT);
    }
  };

  const handleVerificationComplete = (verifiedLocation: string) => {
     if (research.dossier) {
        const updatedDossier = { ...research.dossier, location: verifiedLocation };
        setDossier(updatedDossier);
        handleBuild(updatedDossier);
     } else {
        // Fallback safety
        const fallbackDossier = { name: "New Venture", industry: "Unknown", location: verifiedLocation, description: "New Business", founders: [], coreProduct: "Unknown" };
        setDossier(fallbackDossier);
        handleBuild(fallbackDossier);
     }
  };

  const handleBuild = async (dossier: any) => {
    try {
      // Determine Theme based on industry keywords
      const industryLower = (dossier.industry || "").toLowerCase();
      const descLower = (dossier.description || "").toLowerCase();
      const isTraditional = 
         industryLower.includes('farm') || 
         industryLower.includes('agri') || 
         industryLower.includes('retail') ||
         industryLower.includes('shop') ||
         industryLower.includes('bakery') ||
         industryLower.includes('local') ||
         descLower.includes('farm') ||
         descLower.includes('family');

      const theme = isTraditional ? ThemeMode.EARTH : ThemeMode.NEBULA;
      setThemeMode(theme);

      setPhase(Phase.BUILDING);
      setBuildSteps(["Triangulating coordinates...", "Calibrating Geospatial Engine...", "Finalizing Dashboard..."]);

      const sentiment = await performDeepResearch(dossier);
      setSentiment(sentiment);
      
      const result = await constructDashboard(dossier, sentiment);
      setWidgets(Array.isArray(result.widgets) ? result.widgets : []);
      
      setContext({
        name: dossier.name, 
        businessName: dossier.name, 
        description: dossier.description,
        industry: dossier.industry, 
        stage: "Live", 
        location: dossier.location,
        generatedAt: Date.now(), 
        accessibilityMode,
        theme
      });
      
      const welcomeMsg = theme === ThemeMode.EARTH 
         ? `Welcome, ${dossier.name}. Your harvest command center is ready.`
         : `Welcome, ${dossier.name}. System online.`;

      liveBridge.sendText(welcomeMsg);
      startOnboarding();
    } catch (err) { console.error(err); setError("System construction failed."); }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative z-10">
      <AnimatePresence mode="wait">
        {phase === Phase.PITCH && (
          <motion.div key="pitch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <h2 className="text-3xl font-light text-white mb-2">Pitch Your Venture</h2>
            <p className="text-white/40 text-lg mb-8">{accessibilityMode === AccessibilityMode.SONIC_VIEW ? "I'm listening..." : "Show us your business or describe it in one breath."}</p>
            <GlassPane className="p-6 bg-nebula-900/80 border-white/20 shadow-2xl relative overflow-hidden max-w-2xl mx-auto">
               <div className={`aspect-video bg-black rounded-xl overflow-hidden relative mb-6 border border-white/10 group ${accessibilityMode === AccessibilityMode.SONIC_VIEW ? 'opacity-50 grayscale' : ''}`} aria-hidden={accessibilityMode === AccessibilityMode.SONIC_VIEW}>
                  {isRecording ? <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" /> : <div className="absolute inset-0 flex items-center justify-center bg-white/5"><Camera className="w-12 h-12 text-white/20" /></div>}
                  {isRecording && <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent flex items-end px-6 pb-4"><AudioVisualizer stream={stream} /></div>}
               </div>
               <div className="flex justify-center mb-4">
                 {!isRecording ? (
                   <button onClick={startRecording} className="w-20 h-20 rounded-full bg-tech-cyan hover:bg-cyan-400 flex items-center justify-center shadow-glow-cyan transition-all hover:scale-105"><Mic className="w-8 h-8 text-nebula-950" /></button>
                 ) : (
                   <button onClick={handleStopPitch} className="w-20 h-20 rounded-full bg-tech-rose hover:bg-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all hover:scale-105"><StopCircle className="w-8 h-8 text-white" /></button>
                 )}
               </div>
            </GlassPane>
            {accessibilityMode === AccessibilityMode.STANDARD && <button onClick={() => setPhase(Phase.MICRO_WIZARD)} className="mt-6 text-white/30 hover:text-white text-sm flex items-center gap-2 mx-auto"><Keyboard className="w-4 h-4" /> Prefer to type?</button>}
          </motion.div>
        )}
        
        {phase === Phase.VERIFY_LOCATION && (
           <LocationVerifier 
              initialLocation={research.dossier?.location || ""} 
              onConfirm={handleVerificationComplete} 
           />
        )}

        {phase === Phase.MICRO_WIZARD && <MicroWizard onComplete={handleTextBuild} />}
        {phase === Phase.WIZARD && <SaasWizard onComplete={handleTextBuild} />}
        
        {(phase === Phase.ANALYZING || phase === Phase.BUILDING) && <motion.div key="analyzing" className="w-full max-w-2xl mx-auto"><SearchVisualizer query="Constructing OS" steps={buildSteps} /></motion.div>}
        
        {error && <div className="absolute bottom-0 w-full text-center pb-4"><span className="text-tech-rose bg-tech-rose/10 px-4 py-2 rounded text-sm font-mono border border-tech-rose/20">{error}</span></div>}
      </AnimatePresence>
    </div>
  );
};

const LocationVerifier: React.FC<{ initialLocation: string, onConfirm: (l: string) => void }> = ({ initialLocation, onConfirm }) => {
  const [val, setVal] = useState(initialLocation === "Global" || initialLocation === "Unknown" ? "" : initialLocation);
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
       <GlassPane className="max-w-xl w-full p-8 text-center bg-nebula-900/90 border-tech-cyan/20">
          <div className="w-20 h-20 rounded-full bg-tech-cyan/10 flex items-center justify-center mx-auto mb-6 shadow-glow-cyan">
             <MapPin className="w-10 h-10 text-tech-cyan" />
          </div>
          
          <h2 className="text-3xl text-white font-light mb-3">Confirm Coordinates</h2>
          <p className="text-white/50 mb-8 max-w-sm mx-auto">
            Precise location unlocks our <span className="text-tech-cyan">Geospatial Strategy Engine</span>.
          </p>
          
          <div className="relative mb-6">
             <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
             <input 
               value={val} 
               onChange={e => setVal(e.target.value)}
               placeholder="e.g. 123 Market St, San Francisco"
               className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white text-lg focus:border-tech-cyan/50 focus:outline-none transition-colors placeholder-white/20"
               autoFocus
             />
          </div>
          
          <button 
             onClick={() => onConfirm(val || "Global")}
             className="w-full py-4 bg-tech-cyan hover:bg-cyan-400 text-nebula-950 font-bold text-lg rounded-xl transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
          >
             <Check className="w-5 h-5" /> CONFIRM LOCATION
          </button>
          
          <button 
             onClick={() => onConfirm("Global")}
             className="mt-6 text-xs text-white/30 hover:text-white uppercase tracking-widest font-mono transition-colors"
          >
             Skip (Digital / Global Operations)
          </button>
       </GlassPane>
    </motion.div>
  );
};

const MicroWizard: React.FC<{ onComplete: (n: string, d: string) => void }> = ({ onComplete }) => {
  const [val, setVal] = useState("");
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && val.trim()) {
       if (step === 0) { setName(val); setVal(""); setStep(1); } else { onComplete(name, val); }
    }
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[50vh]">
       <div className="w-full max-w-3xl">
          <label className="block text-center text-zinc-500 font-mono text-xl uppercase tracking-widest mb-8">{step === 0 ? "Step 1: Identity" : "Step 2: Mission"}</label>
          <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={handleKey} placeholder={step === 0 ? "Business Name..." : "What do you do?"} className="w-full bg-transparent border-b-2 border-zinc-800 focus:border-white text-5xl md:text-7xl text-white placeholder-zinc-800 text-center py-8 focus:outline-none transition-colors" />
          <div className="mt-8 text-center text-zinc-600 font-mono animate-pulse">PRESS [ENTER] TO {step === 0 ? "NEXT" : "BUILD"}</div>
       </div>
    </motion.div>
  );
};

const SaasWizard: React.FC<{ onComplete: (n: string, d: string) => void }> = ({ onComplete }) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       <GlassPane className="max-w-xl mx-auto p-8">
          <div className="flex items-center gap-3 mb-6"><MessageSquare className={(React.cloneElement(<MessageSquare/>, { className: "w-6 h-6 text-tech-cyan" })).props.className} /><h2 className="text-xl text-white font-light">Venture Profile</h2></div>
          <div className="space-y-6">
             <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-tech-cyan/50 focus:outline-none" placeholder="Acme Corp" />
             <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-tech-cyan/50 focus:outline-none resize-none" placeholder="Description..." />
             <button disabled={!name || !desc} onClick={() => onComplete(name, desc)} className="w-full py-4 bg-tech-cyan hover:bg-cyan-400 text-nebula-950 font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"><Zap className="w-4 h-4" /> Initialize OS</button>
          </div>
       </GlassPane>
    </motion.div>
  );
};
