
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, StopCircle, Camera, MessageSquare, Zap, MapPin, Check, BrainCircuit, Send, User, Bot, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { performDeepResearch, constructDashboard, generateTeamStructure, generateMicroTaskPlan, chatWithGenesisArchitect } from '../../services/geminiService';
import { GlassPane } from '../ui/GlassPane';
import { SystemBuilder } from './SystemBuilder';
import { useMultimodalInput } from '../../hooks/useMultimodalInput';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import { liveBridge } from '../../services/geminiLiveBridge';
import { AccessibilityMode, ThemeMode } from '../../types';

enum Phase { INIT = 0, PITCH = 1, INTERVIEW = 2, ANALYZING = 4, VERIFY_LOCATION = 5, BUILDING = 6 }

export const ContextEngine: React.FC = () => {
  const { 
    setContext, setWidgets, setDossier, setSentiment, startOnboarding, 
    accessibilityMode, research, setThemeMode, setTeam, startFocusSession, team, updateDossier 
  } = useAppStore();
  
  const [phase, setPhase] = useState<Phase>(Phase.INIT);
  const [error, setError] = useState<string | null>(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'VOICE' | 'TEXT'>('VOICE');
  
  const { isRecording, startRecording, stopRecording, stream } = useMultimodalInput();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    switch (accessibilityMode) {
      case AccessibilityMode.SONIC_VIEW:
        setPhase(Phase.INTERVIEW); 
        break;
      default: 
        setPhase(Phase.PITCH); 
        break;
    }
  }, [accessibilityMode]);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    // Only auto-connect live bridge if we are in Voice mode and Interview phase
    if (phase === Phase.INTERVIEW && interactionMode === 'VOICE' && !interviewStarted) {
       setInterviewStarted(true);
       if (accessibilityMode === AccessibilityMode.SONIC_VIEW) {
          setTimeout(() => {
             liveBridge.connect({
                voiceName: 'Kore',
                systemInstruction: `ROLE: Genesis Architect. CONTEXT: User is blind. GOAL: Interview to build EntreprenOS.`
             });
          }, 500);
       } else {
          liveBridge.connect({
             voiceName: 'Kore',
             systemInstruction: `ROLE: Genesis Architect. GOAL: Interview to build EntreprenOS. Extract Industry, Revenue Model, Target Audience, Differentiator, Bottleneck.`
          });
       }
    } else if (interactionMode === 'TEXT') {
       // If switching to text, disconnect live bridge
       liveBridge.disconnect();
    }
  }, [phase, interviewStarted, accessibilityMode, interactionMode]);

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
      if (interactionMode === 'VOICE') {
         liveBridge.sendText("Initiating EntreprenOS construction sequence.");
         await new Promise(resolve => setTimeout(resolve, 3000));
         liveBridge.disconnect();
      }

      setPhase(Phase.BUILDING);
      setThemeMode(ThemeMode.NEBULA);

      const dashboardPromise = constructDashboard(dossier, { overallSentiment: "Neutral", keyPraises: [], keyComplaints: [], recentEvents: [] });
      const teamPromise = generateTeamStructure(dossier);
      const researchPromise = performDeepResearch(dossier);

      const hiredTeam = await teamPromise;
      setTeam(hiredTeam);

      const [dashboardResult, sentiment] = await Promise.all([dashboardPromise, researchPromise]);
      setWidgets(Array.isArray(dashboardResult.widgets) ? dashboardResult.widgets : []);
      setSentiment(sentiment);

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
        theme: ThemeMode.NEBULA
      });
      
      setTimeout(() => startOnboarding(), 5000);

    } catch (err) { console.error(err); setError("System construction failed."); }
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative z-10 px-6">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: PITCH */}
        {phase === Phase.PITCH && (
          <motion.div key="pitch" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
            <h2 className="text-5xl font-bold font-display text-ink-950 mb-4 tracking-tight">Genesis Interview</h2>
            <p className="text-ink-600 text-lg mb-12 max-w-2xl mx-auto">Speak to the Architect. Describe your vision in plain language, and we will build the infrastructure.</p>
            
            <GlassPane className="p-8 relative overflow-hidden max-w-2xl mx-auto bg-white shadow-xl">
               <div className={`aspect-video bg-slate-900 rounded-2xl overflow-hidden relative mb-8 border border-slate-200 group shadow-inner`}>
                  {isRecording ? <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" /> : <div className="absolute inset-0 flex items-center justify-center bg-slate-100"><Camera className="w-16 h-16 text-slate-300" /></div>}
                  {isRecording && <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex items-end px-8 pb-6"><AudioVisualizer stream={stream} /></div>}
               </div>
               <div className="flex justify-center mb-4">
                 {!isRecording ? (
                   <button onClick={startRecording} className="w-20 h-20 rounded-full bg-tech-purple hover:bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 group"><Mic className="w-8 h-8 text-white" /></button>
                 ) : (
                   <button onClick={handleStopPitch} className="w-20 h-20 rounded-full bg-tech-rose hover:bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30 transition-all hover:scale-105"><StopCircle className="w-8 h-8 text-white" /></button>
                 )}
               </div>
               <div className="text-xs font-bold text-ink-400 font-mono mt-4 uppercase tracking-widest">
                  {isRecording ? "Listening..." : "Tap to Speak"}
               </div>
            </GlassPane>
            <button 
               onClick={() => {
                  setPhase(Phase.INTERVIEW);
                  setInteractionMode('TEXT');
               }} 
               className="mt-8 text-ink-400 hover:text-tech-purple text-sm font-medium flex items-center gap-2 mx-auto transition-colors"
            >
               <MessageSquare className="w-4 h-4" /> Switch to Text Mode
            </button>
          </motion.div>
        )}

        {/* PHASE 2: INTERVIEW */}
        {phase === Phase.INTERVIEW && (
           <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
              
              {interactionMode === 'VOICE' ? (
                 <>
                    <div className="w-32 h-32 rounded-full bg-white border border-slate-100 shadow-xl flex items-center justify-center mb-8 relative">
                       <BrainCircuit className="w-16 h-16 text-tech-purple animate-pulse" />
                       <div className="absolute inset-0 border border-tech-purple/20 rounded-full animate-ping opacity-50" />
                    </div>
                    
                    <h2 className="text-4xl font-bold font-display text-ink-950 mb-3 tracking-tight">Architect Active</h2>
                    <p className="text-ink-600 mb-12 max-w-lg text-center text-lg">I am interviewing you to build your business infrastructure. Extracting data...</p>
                 </>
              ) : (
                 <TextInterview onUpdate={(data) => {
                    updateDossier(data);
                 }} />
              )}

              {/* Data Extraction Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl mb-12">
                 <ExtractionCard label="Industry" value={research.dossier?.industry} />
                 <ExtractionCard label="Revenue Model" value={research.dossier?.revenueModel} />
                 <ExtractionCard label="Target Audience" value={research.dossier?.targetAudience} />
                 <ExtractionCard label="Differentiator" value={research.dossier?.differentiator} />
                 <ExtractionCard label="Bottleneck" value={research.dossier?.bottleneck} />
                 <ExtractionCard label="Location" value={research.dossier?.location} />
              </div>

              <button onClick={handleManualBuild} className="px-10 py-4 bg-tech-purple hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 flex items-center gap-3 text-lg">
                 <Zap className="w-5 h-5" /> BUILD ENTREPREN_OS
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
              <SystemBuilder team={team} />
           </motion.div>
        )}
        
        {error && <div className="absolute bottom-0 w-full text-center pb-4"><span className="text-rose-600 bg-rose-50 px-4 py-2 rounded-lg text-sm font-bold border border-rose-200">{error}</span></div>}
      </AnimatePresence>
    </div>
  );
};

const TextInterview: React.FC<{ onUpdate: (data: any) => void }> = ({ onUpdate }) => {
   // Initial history with alternating User/Model turns.
   const [history, setHistory] = useState<{ role: string, parts: { text: string }[] }[]>([
      { role: "user", parts: [{ text: "Start the interview now. Ask me about my business." }] },
      { role: "model", parts: [{ text: "Hello. I'm the Genesis Architect. Let's build your OS. First, what industry are you in?" }] }
   ]);
   
   // UI messages (skip the hidden primer)
   const [messages, setMessages] = useState<{ id: string, sender: 'user'|'ai', text: string }[]>([
      { id: 'init', sender: 'ai', text: "Hello. I'm the Genesis Architect. Let's build your OS. First, what industry are you in?" }
   ]);
   const [input, setInput] = useState('');
   const [isThinking, setIsThinking] = useState(false);
   const scrollRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
   }, [messages]);

   const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      const userMsg = input;
      setInput('');
      
      // Optimistic Update
      setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'user', text: userMsg }]);
      setIsThinking(true);

      try {
         // Pass the EXISTING history to the service.
         const { text, toolCalls } = await chatWithGenesisArchitect(history, userMsg);
         
         if (toolCalls && toolCalls.length > 0) {
            toolCalls.forEach((fc: any) => {
               if (fc.name === 'update_business_context') {
                  onUpdate(fc.args);
               }
            });
         }

         // Update history with the completed turn (User input + AI response)
         // Ensure we provide a fallback for text if it's empty (e.g. tool call only)
         const aiResponseText = text || "(Action taken)";
         
         setHistory(prev => [
            ...prev,
            { role: "user", parts: [{ text: userMsg }] },
            { role: "model", parts: [{ text: aiResponseText }] } 
         ]);

         if (text) {
            setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'ai', text }]);
         } else if (toolCalls && toolCalls.length > 0) {
            setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'ai', text: "I've updated your business profile." }]);
         }

      } catch (err) {
         console.error(err);
         setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'ai', text: "Connection error. Please try again." }]);
      } finally {
         setIsThinking(false);
      }
   };

   return (
      <GlassPane className="w-full max-w-2xl h-[400px] flex flex-col bg-white border border-slate-200 shadow-xl mb-8">
         <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" ref={scrollRef}>
            {messages.map(msg => (
               <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-tech-purple text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                     </div>
                     <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-tech-purple text-white rounded-tr-none' : 'bg-slate-50 border border-slate-100 text-ink-900 rounded-tl-none'}`}>
                        {msg.text}
                     </div>
                  </div>
               </div>
            ))}
            {isThinking && (
               <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                     <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                     </div>
                     <div className="p-3 rounded-2xl rounded-tl-none bg-slate-50 border border-slate-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                     </div>
                  </div>
               </div>
            )}
         </div>
         <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2">
            <input 
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder="Type your answer..."
               className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-ink-900 focus:outline-none focus:border-tech-purple focus:ring-1 focus:ring-tech-purple/20 transition-all"
               autoFocus
            />
            <button type="submit" disabled={!input.trim() || isThinking} className="p-2 bg-tech-purple hover:bg-indigo-600 text-white rounded-lg disabled:opacity-50 transition-colors">
               <Send className="w-4 h-4" />
            </button>
         </form>
      </GlassPane>
   );
};

const ExtractionCard: React.FC<{ label: string, value?: string }> = ({ label, value }) => (
   <div className={`p-5 rounded-xl border transition-all duration-500 ${value ? 'bg-white border-tech-purple shadow-md' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
      <div className="text-[10px] uppercase font-bold text-ink-400 mb-2 tracking-wider">{label}</div>
      <div className={`text-base font-semibold leading-tight ${value ? 'text-ink-950' : 'text-ink-400 italic'}`}>
         {value || "Extracting..."}
      </div>
      {value && <div className="absolute top-3 right-3 text-tech-purple"><Check className="w-4 h-4" /></div>}
   </div>
);

const LocationVerifier: React.FC<{ initialLocation: string, onConfirm: (l: string) => void }> = ({ initialLocation, onConfirm }) => {
  const [val, setVal] = useState(initialLocation === "Global" || initialLocation === "Unknown" ? "" : initialLocation);
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center w-full">
       <GlassPane className="max-w-xl w-full p-10 text-center bg-white shadow-2xl border-slate-200">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-6">
             <MapPin className="w-10 h-10 text-tech-purple" />
          </div>
          
          <h2 className="text-3xl font-bold font-display text-ink-950 mb-4">Confirm Coordinates</h2>
          <p className="text-ink-600 mb-8 mx-auto text-lg">
            Precise location unlocks our <span className="text-tech-purple font-semibold">Geospatial Strategy Engine</span>.
          </p>
          
          <div className="relative mb-8">
             <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
             <input 
               value={val} 
               onChange={e => setVal(e.target.value)}
               placeholder="e.g. 123 Market St, San Francisco"
               className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-14 pr-6 py-4 text-ink-900 text-lg focus:border-tech-purple focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all placeholder-ink-400"
               autoFocus
             />
          </div>
          
          <button 
             onClick={() => onConfirm(val || "Global")}
             className="w-full py-4 bg-tech-purple hover:bg-indigo-600 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.01] flex items-center justify-center gap-2"
          >
             <Check className="w-5 h-5" /> CONFIRM LOCATION
          </button>
          
          <button 
             onClick={() => onConfirm("Global")}
             className="mt-6 text-xs text-ink-400 hover:text-ink-900 uppercase tracking-widest font-bold transition-colors"
          >
             Skip (Digital / Global Operations)
          </button>
       </GlassPane>
    </motion.div>
  );
};
