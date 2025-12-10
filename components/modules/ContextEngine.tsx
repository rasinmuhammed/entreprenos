
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, StopCircle, Camera, Keyboard, MessageSquare, Zap, MapPin, Check, AudioWaveform, BrainCircuit, Activity } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { analyzeMultimodalPitch, performDeepResearch, constructDashboard, processSaaSOnboarding, generateTeamStructure, generateMicroTaskPlan } from '../../services/geminiService';
import { GlassPane } from '../ui/GlassPane';
import { SearchVisualizer } from '../ui/SearchVisualizer';
import { SystemBuilder } from './SystemBuilder';
import { useMultimodalInput } from '../../hooks/useMultimodalInput';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import { liveBridge } from '../../services/geminiLiveBridge';
import { AccessibilityMode, ThemeMode } from '../../types';

enum Phase { INIT = 0, PITCH = 1, INTERVIEW = 2, ANALYZING = 4, VERIFY_LOCATION = 5, BUILDING = 6 }

export const ContextEngine: React.FC = () => {
  const { 
    setContext, setWidgets, setDossier, setSentiment, startOnboarding, 
    accessibilityMode, research, setThemeMode, setTeam, startFocusSession, team 
  } = useAppStore();
  
  const [phase, setPhase] = useState<Phase>(Phase.INIT);
  const [error, setError] = useState<string | null>(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  
  const { isRecording, startRecording, stopRecording, stream } = useMultimodalInput();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-Start Logic for Voice-First Users
  useEffect(() => {
    switch (accessibilityMode) {
      case AccessibilityMode.SONIC_VIEW:
        setPhase(Phase.INTERVIEW); // Voice first immediately
        break;
      default: 
        setPhase(Phase.PITCH); // Default entry
        break;
    }
  }, [accessibilityMode]);

  // Connect Video
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  // Handle Interview Start
  useEffect(() => {
    if (phase === Phase.INTERVIEW && !interviewStarted) {
       setInterviewStarted(true);
       
       // If SONIC_VIEW, the useGeminiLive hook might handle generic connection, 
       // but here we want the specific "Genesis Architect" persona.
       // We force a connection here to ensure the right system instruction.
       if (accessibilityMode === AccessibilityMode.SONIC_VIEW) {
          // Add a slight delay to ensure audio context is ready
          setTimeout(() => {
             liveBridge.connect({
                voiceName: 'Kore',
                systemInstruction: `
                  ROLE: Genesis Architect (AI Venture Capitalist).
                  CONTEXT: User is blind/visually impaired (SONIC_VIEW).
                  GOAL: Interview them to build their EntreprenOS.
                  
                  PROTOCOL:
                  1. Introduce yourself briefly: "I am the Genesis Architect. Tell me your business dream."
                  2. Extract: Industry, Revenue Model, Target Audience.
                  3. Call 'update_business_context' tool as you learn.
                  4. Ask: "Ready to build?" when you have enough info.
                `
             });
          }, 500);
       } else {
          // Standard Mode - Connect on transition
          liveBridge.connect({
             voiceName: 'Kore',
             systemInstruction: `
               ROLE: Genesis Architect (AI Venture Capitalist & System Builder).
               GOAL: Interview the user to build their EntreprenOS.
               OBJECTIVES:
               1. Extract: Industry, Revenue Model, Target Audience, Differentiator, Bottleneck.
               2. Call 'update_business_context' tool IMMEDIATELY upon hearing details.
               3. Keep it conversational.
               4. Ask: "Shall I build your OS now?" when ready.
             `
          });
       }
    }
  }, [phase, interviewStarted, accessibilityMode]);

  const handleStopPitch = async () => {
    if (!isRecording) return;
    await stopRecording();
    setPhase(Phase.INTERVIEW);
  };

  const handleManualBuild = async () => {
     if (research.dossier) {
        handleVerificationComplete(research.dossier.location || "Global");
     } else {
        handleVerificationComplete("Global");
     }
  };

  const handleVerificationComplete = (verifiedLocation: string) => {
     const baseDossier = research.dossier || { name: "New Venture", industry: "Unknown", description: "New Business", founders: [], coreProduct: "Unknown" };
     const updatedDossier = { ...baseDossier, location: verifiedLocation };
     setDossier(updatedDossier);
     handleBuild(updatedDossier);
  };

  const handleBuild = async (dossier: any) => {
    try {
      // 1. Announce Transition (Graceful Exit)
      liveBridge.sendText("I have everything I need. Initiating EntreprenOS construction sequence now. Stand by.");
      
      // 2. Wait for audio to play out before cutting connection
      await new Promise(resolve => setTimeout(resolve, 3000));
      liveBridge.disconnect();

      setPhase(Phase.BUILDING);

      // Determine Theme
      const industryLower = (dossier.industry || "").toLowerCase();
      const descLower = (dossier.description || "").toLowerCase();
      const isTraditional = 
         industryLower.includes('farm') || 
         industryLower.includes('agri') || 
         industryLower.includes('retail') ||
         industryLower.includes('shop') ||
         industryLower.includes('bakery') ||
         descLower.includes('family');

      const theme = isTraditional ? ThemeMode.EARTH : ThemeMode.NEBULA;
      setThemeMode(theme);

      // 3. Parallel Execution for Speed
      // We start dashboard construction...
      const dashboardPromise = constructDashboard(dossier, { overallSentiment: "Neutral", keyPraises: [], keyComplaints: [], recentEvents: [] });
      // We start team generation...
      const teamPromise = generateTeamStructure(dossier);
      // We start research...
      const researchPromise = performDeepResearch(dossier);

      // Await Team First for the "Hiring Montage" (SystemBuilder needs this ASAP)
      const hiredTeam = await teamPromise;
      setTeam(hiredTeam); // Updates store, triggering SystemBuilder animation

      // Await others
      const [dashboardResult, sentiment] = await Promise.all([dashboardPromise, researchPromise]);
      
      setWidgets(Array.isArray(dashboardResult.widgets) ? dashboardResult.widgets : []);
      setSentiment(sentiment);

      // 4. Micro-Task Plan (Day 1)
      const taskTitle = `Day 1 Launch for ${dossier.name}`;
      const microPlan = await generateMicroTaskPlan(taskTitle, dossier.industry);
      startFocusSession(microPlan.title, microPlan.microTasks);

      setContext({
        name: dossier.name || "My Business", 
        businessName: dossier.name || "My Business", 
        description: dossier.description || "No description",
        industry: dossier.industry || "General", 
        stage: "Live", 
        location: dossier.location,
        generatedAt: Date.now(), 
        accessibilityMode,
        theme
      });
      
      // Delay to let the "System Ready" state of SystemBuilder shine
      // 4s delay after team is set gives time for the Hiring Montage
      setTimeout(() => startOnboarding(), 5000);

    } catch (err) { console.error(err); setError("System construction failed."); }
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative z-10">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: PITCH */}
        {phase === Phase.PITCH && (
          <motion.div key="pitch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <h2 className="text-4xl font-light text-white mb-4">Genesis Interview</h2>
            <p className="text-white/40 text-xl mb-12">Speak to the Architect. Describe your vision.</p>
            <GlassPane className="p-8 bg-nebula-900/80 border-white/20 shadow-2xl relative overflow-hidden max-w-2xl mx-auto">
               <div className={`aspect-video bg-black rounded-2xl overflow-hidden relative mb-8 border border-white/10 group shadow-inner`}>
                  {isRecording ? <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" /> : <div className="absolute inset-0 flex items-center justify-center bg-white/5"><Camera className="w-16 h-16 text-white/10" /></div>}
                  {isRecording && <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 to-transparent flex items-end px-8 pb-6"><AudioVisualizer stream={stream} /></div>}
               </div>
               <div className="flex justify-center mb-4">
                 {!isRecording ? (
                   <button onClick={startRecording} className="w-24 h-24 rounded-full bg-tech-cyan hover:bg-cyan-400 flex items-center justify-center shadow-glow-cyan transition-all hover:scale-105 group"><Mic className="w-10 h-10 text-nebula-950 group-hover:scale-110 transition-transform" /></button>
                 ) : (
                   <button onClick={handleStopPitch} className="w-24 h-24 rounded-full bg-tech-rose hover:bg-rose-500 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.5)] transition-all hover:scale-105"><StopCircle className="w-10 h-10 text-white" /></button>
                 )}
               </div>
               <div className="text-sm text-white/30 font-mono mt-4 uppercase tracking-widest">
                  {isRecording ? "Listening..." : "Tap to Speak"}
               </div>
            </GlassPane>
            <button onClick={() => setPhase(Phase.INTERVIEW)} className="mt-8 text-white/30 hover:text-white text-sm flex items-center gap-2 mx-auto transition-colors"><MessageSquare className="w-4 h-4" /> Text / Manual Mode</button>
          </motion.div>
        )}

        {/* PHASE 2: INTERVIEW */}
        {phase === Phase.INTERVIEW && (
           <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
              <div className="w-40 h-40 rounded-full bg-tech-purple/10 flex items-center justify-center mb-8 relative animate-pulse shadow-glow">
                 <BrainCircuit className="w-20 h-20 text-tech-purple" />
                 <div className="absolute inset-0 border border-tech-purple/30 rounded-full animate-ping opacity-20" />
              </div>
              
              <h2 className="text-4xl font-light text-white mb-2">Genesis Architect Active</h2>
              <p className="text-white/40 mb-12 max-w-lg text-center text-lg">I am interviewing you to build your business infrastructure. I will auto-extract key details as we speak.</p>

              {/* Data Extraction Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
                 <ExtractionCard label="Industry" value={research.dossier?.industry} />
                 <ExtractionCard label="Revenue Model" value={research.dossier?.revenueModel} />
                 <ExtractionCard label="Target Audience" value={research.dossier?.targetAudience} />
                 <ExtractionCard label="Differentiator" value={research.dossier?.differentiator} />
                 <ExtractionCard label="Bottleneck" value={research.dossier?.bottleneck} />
                 <ExtractionCard label="Location" value={research.dossier?.location} />
              </div>

              <button onClick={handleManualBuild} className="px-10 py-5 bg-tech-cyan hover:bg-cyan-400 text-nebula-950 font-bold rounded-2xl shadow-glow-cyan transition-all hover:scale-105 flex items-center gap-3 text-lg">
                 <Zap className="w-6 h-6" /> BUILD ENTREPREN<span className="opacity-50">OS</span>
              </button>
           </motion.div>
        )}
        
        {phase === Phase.VERIFY_LOCATION && (
           <LocationVerifier 
              initialLocation={research.dossier?.location || ""} 
              onConfirm={handleVerificationComplete} 
           />
        )}

        {(phase === Phase.BUILDING) && (
           <motion.div key="building" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center">
              {/* Replaced generic text with SystemBuilder */}
              <SystemBuilder team={team} />
           </motion.div>
        )}
        
        {error && <div className="absolute bottom-0 w-full text-center pb-4"><span className="text-tech-rose bg-tech-rose/10 px-4 py-2 rounded text-sm font-mono border border-tech-rose/20">{error}</span></div>}
      </AnimatePresence>
    </div>
  );
};

const ExtractionCard: React.FC<{ label: string, value?: string }> = ({ label, value }) => (
   <div className={`p-5 rounded-2xl border transition-all duration-500 ${value ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'}`}>
      <div className="text-[10px] uppercase font-mono text-white/40 mb-2 tracking-wider">{label}</div>
      <div className={`text-base font-medium leading-tight ${value ? 'text-white' : 'text-white/20 italic'}`}>
         {value || "Extracting..."}
      </div>
      {value && <div className="absolute top-3 right-3 text-emerald-500"><Check className="w-4 h-4" /></div>}
   </div>
);

const LocationVerifier: React.FC<{ initialLocation: string, onConfirm: (l: string) => void }> = ({ initialLocation, onConfirm }) => {
  const [val, setVal] = useState(initialLocation === "Global" || initialLocation === "Unknown" ? "" : initialLocation);
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center w-full">
       <GlassPane className="max-w-xl w-full p-10 text-center bg-nebula-900/90 border-tech-cyan/20">
          <div className="w-24 h-24 rounded-full bg-tech-cyan/10 flex items-center justify-center mx-auto mb-8 shadow-glow-cyan">
             <MapPin className="w-10 h-10 text-tech-cyan" />
          </div>
          
          <h2 className="text-4xl text-white font-light mb-4">Confirm Coordinates</h2>
          <p className="text-white/50 mb-8 mx-auto text-lg">
            Precise location unlocks our <span className="text-tech-cyan">Geospatial Strategy Engine</span>.
          </p>
          
          <div className="relative mb-8">
             <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
             <input 
               value={val} 
               onChange={e => setVal(e.target.value)}
               placeholder="e.g. 123 Market St, San Francisco"
               className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-white text-xl focus:border-tech-cyan/50 focus:outline-none transition-colors placeholder-white/20"
               autoFocus
             />
          </div>
          
          <button 
             onClick={() => onConfirm(val || "Global")}
             className="w-full py-5 bg-tech-cyan hover:bg-cyan-400 text-nebula-950 font-bold text-xl rounded-2xl transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
          >
             <Check className="w-6 h-6" /> CONFIRM LOCATION
          </button>
          
          <button 
             onClick={() => onConfirm("Global")}
             className="mt-8 text-xs text-white/30 hover:text-white uppercase tracking-widest font-mono transition-colors"
          >
             Skip (Digital / Global Operations)
          </button>
       </GlassPane>
    </motion.div>
  );
};
