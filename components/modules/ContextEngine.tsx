
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, StopCircle, Camera, MessageSquare, Zap, MapPin, Check, BrainCircuit, Send, User, Bot, Loader2, Sparkles, Volume2, ArrowRight, Keyboard } from 'lucide-react';
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
  const [textInput, setTextInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'model', parts: {text: string}[]}[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  
  const { isRecording, startRecording, stopRecording, stream } = useMultimodalInput();
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isThinking, interactionMode]);

  useEffect(() => {
    // Intelligent Phase Skipping based on Accessibility Profile
    switch (accessibilityMode) {
      case AccessibilityMode.SONIC_VIEW:
        setPhase(Phase.INTERVIEW); 
        setInteractionMode('VOICE'); // Blind users prefer Voice
        break;
      case AccessibilityMode.SENTIMENT_HUD:
        setPhase(Phase.INTERVIEW);
        setInteractionMode('TEXT'); // Deaf/HoH users prefer Text
        break;
      case AccessibilityMode.FOCUS_SHIELD:
        setPhase(Phase.INTERVIEW);
        setInteractionMode('TEXT'); // ADHD users often prefer direct Text to avoid audio distraction
        break;
      default: 
        setPhase(Phase.PITCH); // Standard users get the full Pitch experience
        setInteractionMode('VOICE');
        break;
    }
  }, [accessibilityMode]);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    // Only auto-connect live bridge if we are in Voice mode and Interview phase
    // PREVENT auto-connection for Text mode (Deaf/HoH)
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
             systemInstruction: `ROLE: Business Architect. GOAL: Determine if user is New or Existing business. Extract Industry, Revenue Model, Target Audience.`
          });
       }
    } else if (interactionMode === 'TEXT') {
       // Ensure bridge is disconnected if in text mode to prevent "Listening..." state
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

  const handleVerificationComplete = async (location: string) => {
    setPhase(Phase.BUILDING);
    if (!research.dossier) return;

    try {
      // 1. Deep Research
      const sentiment = await performDeepResearch(research.dossier);
      setSentiment(sentiment);

      // 2. Build Dashboard
      const dashboard = await constructDashboard(research.dossier, sentiment);
      setWidgets(dashboard.widgets);

      // 3. Hire Team
      const newTeam = await generateTeamStructure(research.dossier);
      setTeam(newTeam);

      // 4. Set Context & Launch
      setContext({
        name: research.dossier.name,
        businessName: research.dossier.name,
        industry: research.dossier.industry,
        description: research.dossier.description,
        stage: "Growth",
        location: location,
        generatedAt: Date.now(),
        accessibilityMode: accessibilityMode,
        theme: ThemeMode.NEBULA
      });
      
      startOnboarding(); // Finish onboarding
    } catch (e) {
      console.error(e);
      setError("Construction failed. Manual override engaged.");
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const userMsg = textInput;
    setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
    setTextInput('');
    setIsThinking(true);

    try {
       const response = await chatWithGenesisArchitect(chatHistory, userMsg);
       
       if (response.toolCalls && response.toolCalls.length > 0) {
          // Process tool calls (mock execution, assuming service handled context update)
          const contextUpdate = response.toolCalls.find((tc: any) => tc.name === 'update_business_context');
          if (contextUpdate) {
             updateDossier(contextUpdate.args);
          }
       }

       setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
    } catch (err) {
       console.error("Chat Error", err);
    } finally {
       setIsThinking(false);
    }
  };

  return (
    <div className="w-full max-w-5xl h-[600px] relative">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: INIT / PITCH (Only for Standard Mode) */}
        {phase === Phase.PITCH && (
          <motion.div 
            key="pitch"
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full w-full rounded-3xl overflow-hidden relative bg-slate-900 shadow-2xl border border-slate-800"
          >
             {/* Background Video Layer */}
             <div className="absolute inset-0 z-0">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover opacity-60" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
             </div>

             {/* Content Layer */}
             <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
                
                <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center mb-8 shadow-glow">
                   <div className="absolute inset-0 rounded-full border border-tech-cyan/30 animate-ping opacity-50" />
                   <Camera className="w-10 h-10 text-tech-cyan" />
                </div>
                
                <h1 className="text-6xl font-bold mb-4 tracking-tighter text-white drop-shadow-lg">Genesis Pitch</h1>
                
                <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-2xl drop-shadow-md font-medium">
                   "I'm listening and watching. Show me your product, walk me through your office, or just describe your vision. 
                   I will build your operating system in real-time."
                </p>

                <div className="flex gap-4 items-center">
                   {!isRecording ? (
                      <button 
                        onClick={startRecording} 
                        className="px-10 py-5 bg-tech-purple hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center gap-3 transition-all hover:scale-105 shadow-xl hover:shadow-indigo-500/30 group"
                      >
                         <Mic className="w-6 h-6 group-hover:animate-bounce" /> Start Transmission
                      </button>
                   ) : (
                      <button 
                        onClick={handleStopPitch} 
                        className="px-10 py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold flex items-center gap-3 transition-all hover:scale-105 shadow-xl animate-pulse"
                      >
                         <StopCircle className="w-6 h-6" /> Stop & Analyze
                      </button>
                   )}
                   
                   <button 
                     onClick={() => setPhase(Phase.INTERVIEW)} 
                     className="px-8 py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold backdrop-blur-md border border-white/10 transition-all flex items-center gap-2"
                   >
                      Skip to Interview <ArrowRight className="w-4 h-4" />
                   </button>
                </div>

                {/* Audio Visualizer (Overlay) */}
                {isRecording && (
                   <div className="absolute bottom-0 left-0 right-0 h-32 z-20 px-8 pb-8 flex items-end justify-center">
                      <div className="w-full max-w-lg">
                         <AudioVisualizer stream={stream} />
                      </div>
                   </div>
                )}
             </div>
          </motion.div>
        )}

        {/* PHASE 2: INTERVIEW (Text/Voice Hybrid) */}
        {phase === Phase.INTERVIEW && (
          <motion.div 
            key="interview"
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="h-full flex flex-col"
          >
             <GlassPane className="h-full flex flex-col p-0 overflow-hidden bg-white border-slate-200 shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-tech-purple text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
                         <BrainCircuit className="w-6 h-6" />
                      </div>
                      <div>
                         <h2 className="text-xl font-bold text-ink-900">Genesis Architect</h2>
                         <p className="text-xs text-ink-500 font-medium">
                            {interactionMode === 'TEXT' ? 'Text Interview Mode' : 'Voice Link Active'}
                         </p>
                      </div>
                   </div>
                   
                   <div className="flex bg-slate-200/50 p-1 rounded-lg">
                      <button 
                        onClick={() => setInteractionMode('VOICE')} 
                        className={`p-2 rounded-md transition-all ${interactionMode === 'VOICE' ? 'bg-white shadow-sm text-tech-purple' : 'text-ink-400 hover:text-ink-600'}`}
                        title="Switch to Voice"
                      >
                         <Mic className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setInteractionMode('TEXT')} 
                        className={`p-2 rounded-md transition-all ${interactionMode === 'TEXT' ? 'bg-white shadow-sm text-tech-purple' : 'text-ink-400 hover:text-ink-600'}`}
                        title="Switch to Text"
                      >
                         <Keyboard className="w-4 h-4" />
                      </button>
                   </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                   {interactionMode === 'VOICE' ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-white to-slate-50">
                         <div className="w-40 h-40 rounded-full bg-slate-100 flex items-center justify-center mb-8 relative">
                            <div className="absolute inset-0 border-4 border-tech-purple/20 rounded-full animate-ping" />
                            <div className="absolute inset-0 border-4 border-tech-purple/40 rounded-full animate-pulse delay-75" />
                            <div className="w-32 h-32 bg-white rounded-full shadow-inner flex items-center justify-center relative z-10">
                               <Volume2 className="w-12 h-12 text-tech-purple animate-bounce" />
                            </div>
                         </div>
                         <h3 className="text-2xl font-bold text-ink-900 mb-2">Voice Link Active</h3>
                         <p className="text-ink-500 max-w-md">The Architect is listening. Describe your business model, customers, and revenue streams.</p>
                      </div>
                   ) : (
                      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50" ref={chatScrollRef}>
                         {/* Intro Message */}
                         <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-tech-purple text-white flex items-center justify-center shrink-0 shadow-md">
                               <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-sm text-ink-700 leading-relaxed max-w-[80%]">
                               Hello. I am the Genesis Architect. Tell me about your business idea, or existing company. I'll build your dashboard.
                            </div>
                         </div>

                         {(chatHistory || []).map((msg, i) => (
                            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${msg.role === 'user' ? 'bg-ink-900 text-white' : 'bg-tech-purple text-white'}`}>
                                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                               </div>
                               <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[80%] shadow-sm ${
                                  msg.role === 'user' 
                                  ? 'bg-tech-purple text-white rounded-tr-none' 
                                  : 'bg-white text-ink-700 border border-slate-200 rounded-tl-none'
                               }`}>
                                  {msg.parts && msg.parts.length > 0 ? msg.parts[0].text : '...'}
                               </div>
                            </div>
                         ))}

                         {isThinking && (
                            <div className="flex gap-4">
                               <div className="w-8 h-8 rounded-full bg-tech-purple text-white flex items-center justify-center shrink-0 shadow-md">
                                  <Bot className="w-4 h-4" />
                               </div>
                               <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" />
                                  <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce delay-100" />
                                  <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce delay-200" />
                               </div>
                            </div>
                         )}
                      </div>
                   )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-4 shrink-0">
                   {research.dossier && (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                         <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Context Acquired</span>
                         </div>
                         <button onClick={handleManualBuild} className="text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
                            <Zap className="w-3 h-3" /> Build OS
                         </button>
                      </div>
                   )}

                   {/* Always show text input in TEXT mode OR if we have started chatting */}
                   {(interactionMode === 'TEXT' || chatHistory.length > 0) && (
                      <form onSubmit={handleTextSubmit} className="relative">
                         <input 
                           value={textInput}
                           onChange={(e) => setTextInput(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-tech-purple focus:ring-1 focus:ring-tech-purple/20 transition-all text-ink-900 placeholder-ink-400"
                           placeholder="Type your response..."
                           disabled={isThinking}
                           autoFocus
                         />
                         <button 
                           type="submit" 
                           disabled={!textInput.trim() || isThinking}
                           className="absolute right-2 top-2 p-1.5 bg-tech-purple text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors shadow-sm"
                         >
                            <Send className="w-4 h-4" />
                         </button>
                      </form>
                   )}
                </div>
             </GlassPane>
          </motion.div>
        )}

        {/* PHASE 3: BUILDING SYSTEM */}
        {phase === Phase.BUILDING && (
           <SystemBuilder team={team} />
        )}

      </AnimatePresence>
    </div>
  );
};
