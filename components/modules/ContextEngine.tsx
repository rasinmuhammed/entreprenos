
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, StopCircle, Camera, Keyboard, MessageSquare, Zap, MapPin, Check, AudioWaveform, BrainCircuit, Activity } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { analyzeMultimodalPitch, performDeepResearch, constructDashboard, processSaaSOnboarding, generateTeamStructure, generateMicroTaskPlan } from '../../services/geminiService';
import { GlassPane } from '../ui/GlassPane';
import { SearchVisualizer } from '../ui/SearchVisualizer';
import { useMultimodalInput } from '../../hooks/useMultimodalInput';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import { liveBridge } from '../../services/geminiLiveBridge';
import { AccessibilityMode, ThemeMode } from '../../types';

enum Phase { INIT = 0, PITCH = 1, INTERVIEW = 2, ANALYZING = 4, VERIFY_LOCATION = 5, BUILDING = 6 }

export const ContextEngine: React.FC = () => {
  const { 
    setContext, setWidgets, setDossier, setSentiment, startOnboarding, 
    accessibilityMode, research, setThemeMode, setTeam, startFocusSession 
  } = useAppStore();
  
  const [phase, setPhase] = useState<Phase>(Phase.INIT);
  const [error, setError] = useState<string | null>(null);
  const [buildSteps, setBuildSteps] = useState<string[]>([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  
  const { isRecording, startRecording, stopRecording, stream } = useMultimodalInput();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-Start Logic
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
       liveBridge.connect({
          voiceName: 'Kore',
          systemInstruction: `
            ROLE: Genesis Architect (AI Venture Capitalist & System Builder).
            GOAL: Interview the user to build their EntreprenOS.
            
            OBJECTIVES:
            1. Ask probing questions to extract: Industry, Revenue Model, Target Audience, Differentiator, and Main Bottleneck.
            2. When you hear a key detail, call the 'update_business_context' tool IMMEDIATELY.
            3. Keep it conversational. Be efficient.
            4. If the user seems done or you have all 5 key points, ask: "Shall I build your OS now?"
            
            TONE: Professional, Insightful, Efficient.
          `
       });
    }
  }, [phase, interviewStarted]);

  const handleStopPitch = async () => {
    if (!isRecording) return;
    
    // Instead of jumping to analysis, we transition to the INTERVIEW to refine the pitch
    // We can assume the pitch audio was sent to a buffer, but for this specific flow,
    // let's transition to the Live Interview to "Discuss" the pitch.
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
     if (research.dossier) {
        const updatedDossier = { ...research.dossier, location: verifiedLocation };
        setDossier(updatedDossier);
        handleBuild(updatedDossier);
     } else {
        const fallbackDossier = { name: "New Venture", industry: "Unknown", location: verifiedLocation, description: "New Business", founders: [], coreProduct: "Unknown" };
        setDossier(fallbackDossier);
        handleBuild(fallbackDossier);
     }
  };

  const handleBuild = async (dossier: any) => {
    try {
      liveBridge.disconnect(); // Stop interview

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

      setPhase(Phase.BUILDING);
      setBuildSteps(["Triangulating coordinates...", "Hiring AI Workforce...", "Synthesizing Strategic Dashboard...", "Generating Day 1 Operational Plan..."]);

      // 1. Research
      const sentiment = await performDeepResearch(dossier);
      setSentiment(sentiment);
      
      // 2. Dashboard
      const result = await constructDashboard(dossier, sentiment);
      setWidgets(Array.isArray(result.widgets) ? result.widgets : []);
      
      // 3. Team Generation (NEW)
      const team = await generateTeamStructure(dossier);
      setTeam(team);

      // 4. Micro-Task Plan (NEW - Day 1)
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
      
      startOnboarding();
    } catch (err) { console.error(err); setError("System construction failed."); }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative z-10">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: PITCH (Optional, mostly for visual mode users) */}
        {phase === Phase.PITCH && (
          <motion.div key="pitch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <h2 className="text-3xl font-light text-white mb-2">Genesis Interview</h2>
            <p className="text-white/40 text-lg mb-8">Speak to the Architect. Describe your vision.</p>
            <GlassPane className="p-6 bg-nebula-900/80 border-white/20 shadow-2xl relative overflow-hidden max-w-2xl mx-auto">
               <div className={`aspect-video bg-black rounded-xl overflow-hidden relative mb-6 border border-white/10 group`}>
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
               <div className="text-xs text-white/30 font-mono mt-4">Click to Start / Stop Recording</div>
            </GlassPane>
            <button onClick={() => setPhase(Phase.INTERVIEW)} className="mt-6 text-white/30 hover:text-white text-sm flex items-center gap-2 mx-auto"><MessageSquare className="w-4 h-4" /> Skip to Interview</button>
          </motion.div>
        )}

        {/* PHASE 2: GENESIS INTERVIEW (Active Tool Usage) */}
        {phase === Phase.INTERVIEW && (
           <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-tech-purple/20 flex items-center justify-center mb-8 relative animate-pulse">
                 <BrainCircuit className="w-16 h-16 text-tech-purple" />
                 <div className="absolute inset-0 border border-tech-purple/40 rounded-full animate-ping opacity-20" />
              </div>
              
              <h2 className="text-3xl font-light text-white mb-2">Genesis Architect Active</h2>
              <p className="text-white/40 mb-8 max-w-lg text-center">I am interviewing you to build your business infrastructure. I will auto-extract key details as we speak.</p>

              {/* Data Extraction Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
                 <ExtractionCard label="Industry" value={research.dossier?.industry} />
                 <ExtractionCard label="Revenue Model" value={research.dossier?.revenueModel} />
                 <ExtractionCard label="Target Audience" value={research.dossier?.targetAudience} />
                 <ExtractionCard label="Differentiator" value={research.dossier?.differentiator} />
                 <ExtractionCard label="Bottleneck" value={research.dossier?.bottleneck} />
                 <ExtractionCard label="Location" value={research.dossier?.location} />
              </div>

              <div className="flex gap-4">
                 <button onClick={handleManualBuild} className="px-8 py-4 bg-tech-cyan hover:bg-cyan-400 text-nebula-950 font-bold rounded-xl shadow-glow-cyan transition-all flex items-center gap-2">
                    <Zap className="w-5 h-5" /> BUILD OS NOW
                 </button>
              </div>
              
              <div className="mt-8 h-12 w-64">
                 <div className="flex items-end justify-center gap-1 h-full opacity-50">
                    {[1,2,3,4,5].map(i => (
                       <motion.div 
                         key={i} 
                         animate={{ height: [10, 30, 10] }} 
                         transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                         className="w-1.5 bg-tech-purple rounded-full" 
                       />
                    ))}
                 </div>
              </div>
           </motion.div>
        )}
        
        {phase === Phase.VERIFY_LOCATION && (
           <LocationVerifier 
              initialLocation={research.dossier?.location || ""} 
              onConfirm={handleVerificationComplete} 
           />
        )}

        {(phase === Phase.ANALYZING || phase === Phase.BUILDING) && <motion.div key="analyzing" className="w-full max-w-2xl mx-auto"><SearchVisualizer query="Constructing EntreprenOS" steps={buildSteps} /></motion.div>}
        
        {error && <div className="absolute bottom-0 w-full text-center pb-4"><span className="text-tech-rose bg-tech-rose/10 px-4 py-2 rounded text-sm font-mono border border-tech-rose/20">{error}</span></div>}
      </AnimatePresence>
    </div>
  );
};

const ExtractionCard: React.FC<{ label: string, value?: string }> = ({ label, value }) => (
   <div className={`p-4 rounded-xl border transition-all duration-500 ${value ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'}`}>
      <div className="text-[10px] uppercase font-mono text-white/40 mb-1">{label}</div>
      <div className={`text-sm font-medium ${value ? 'text-white' : 'text-white/20 italic'}`}>
         {value || "Extracting..."}
      </div>
      {value && <div className="absolute top-2 right-2 text-emerald-500"><Check className="w-3 h-3" /></div>}
   </div>
);

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
