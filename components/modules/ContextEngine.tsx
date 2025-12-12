
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, StopCircle, Camera, MessageSquare, Zap, MapPin, Check, BrainCircuit, Send, User, Bot, Loader2, Sparkles, Volume2, ArrowRight, Keyboard, ArrowLeft, AlertCircle, X, Building2, Lightbulb, Search, Globe, Briefcase } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { performDeepResearch, constructDashboard, generateTeamStructure, chatWithGenesisArchitect } from '../../services/geminiService';
import { GlassPane } from '../ui/GlassPane';
import { SystemBuilder } from './SystemBuilder';
import { useMultimodalInput } from '../../hooks/useMultimodalInput';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import { liveBridge } from '../../services/geminiLiveBridge';
import { AccessibilityMode, ThemeMode, EntityDossier } from '../../types';
import { GoogleGenAI } from '@google/genai';

enum Phase { INIT = 0, PITCH = 1, INTERVIEW = 2, ANALYZING = 4, VERIFY_LOCATION = 5, BUILDING = 6 }
enum WizardStep { MODE_SELECT = 'MODE', SEARCH = 'SEARCH', CONFIRM = 'CONFIRM', MANUAL = 'MANUAL' }

interface ContextEngineProps {
  onBack?: () => void;
}

export const ContextEngine: React.FC<ContextEngineProps> = ({ onBack }) => {
  const { 
    setContext, setWidgets, setSentiment, startOnboarding, 
    accessibilityMode, research, setTeam, updateDossier 
  } = useAppStore();
  
  const [phase, setPhase] = useState<Phase>(Phase.INIT);
  const [error, setError] = useState<string | null>(null);
  
  // Wizard State
  const [wizardStep, setWizardStep] = useState<WizardStep>(WizardStep.MODE_SELECT);
  const [searchInputs, setSearchInputs] = useState({ name: '', location: '' });
  const [manualInputs, setManualInputs] = useState({ name: '', industry: '', description: '' });
  const [foundEntity, setFoundEntity] = useState<EntityDossier | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { isRecording, startRecording, stopRecording, stream } = useMultimodalInput();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Intelligent Phase Skipping
    switch (accessibilityMode) {
      case AccessibilityMode.SONIC_VIEW:
      case AccessibilityMode.SENTIMENT_HUD:
      case AccessibilityMode.FOCUS_SHIELD:
        setPhase(Phase.INTERVIEW); 
        break;
      default: 
        setPhase(Phase.PITCH); // Standard users get the full Pitch experience
        break;
    }
  }, [accessibilityMode]);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  const handleBackNavigation = async () => {
     if (phase === Phase.INTERVIEW && accessibilityMode === AccessibilityMode.STANDARD) {
        if (wizardStep !== WizardStep.MODE_SELECT) {
           setWizardStep(WizardStep.MODE_SELECT);
           return;
        }
        setPhase(Phase.PITCH);
     } else {
        if (stopRecording) await stopRecording();
        if (onBack) onBack();
     }
  };

  const handleStopPitch = async () => {
    if (!isRecording) return;
    await stopRecording();
    setPhase(Phase.INTERVIEW);
  };

  // --- WIZARD LOGIC ---

  const identifyBusiness = async () => {
     if (!searchInputs.name.trim() || !searchInputs.location.trim()) return;
     
     setIsSearching(true);
     setError(null);
     
     try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
           Identify the business "${searchInputs.name}" in "${searchInputs.location}".
           Return a JSON object with:
           {
             "name": "Exact Business Name",
             "industry": "Industry Sector",
             "description": "2 sentence summary of what they do",
             "location": "${searchInputs.location}",
             "website": "url if known",
             "foundingDate": "year",
             "confidence": "High/Medium/Low"
           }
           If not a real famous business, simulate a plausible profile based on the name.
        `;
        
        const response = await ai.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: prompt,
           config: { responseMimeType: 'application/json' }
        });
        
        const data = JSON.parse(response.text || '{}');
        setFoundEntity({
           name: data.name || searchInputs.name,
           industry: data.industry || 'Unknown',
           description: data.description || 'No description available',
           location: data.location || searchInputs.location,
           website: data.website,
           founders: [],
           coreProduct: 'Services'
        });
        setWizardStep(WizardStep.CONFIRM);

     } catch (e) {
        console.error(e);
        setError("Could not identify business. Please enter manually.");
        setWizardStep(WizardStep.MANUAL);
     } finally {
        setIsSearching(false);
     }
  };

  const handleBuildOS = async (dossier: EntityDossier) => {
    setPhase(Phase.BUILDING);
    
    try {
      // 1. Deep Research
      const sentiment = await performDeepResearch(dossier);
      setSentiment(sentiment);

      // 2. Build Dashboard
      const dashboard = await constructDashboard(dossier, sentiment);
      setWidgets(dashboard.widgets);

      // 3. Hire Team
      const newTeam = await generateTeamStructure(dossier);
      setTeam(newTeam);

      // 4. Set Context & Launch
      setContext({
        name: dossier.name,
        businessName: dossier.name,
        industry: dossier.industry,
        description: dossier.description,
        stage: "Growth",
        location: dossier.location || "Global",
        generatedAt: Date.now(),
        accessibilityMode: accessibilityMode,
        theme: ThemeMode.NEBULA
      });
      
      startOnboarding(); 
    } catch (e) {
      console.error(e);
      setError("Construction failed. Manual override engaged.");
    }
  };

  return (
    <div className="w-full max-w-5xl h-[85vh] min-h-[600px] relative">
      {error && (
         <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3"
         >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-bold">{error}</span>
            <button onClick={() => setError(null)} className="p-1 hover:bg-rose-100 rounded-full transition-colors"><X className="w-4 h-4" /></button>
         </motion.div>
      )}

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
             <button 
               onClick={handleBackNavigation}
               className="absolute top-6 left-6 z-30 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all border border-white/20 group hover:scale-105"
               title="Go Back"
             >
               <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
             </button>

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
                      Skip to Wizard <ArrowRight className="w-4 h-4" />
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

        {/* PHASE 2: WIZARD (Structured Input) */}
        {phase === Phase.INTERVIEW && (
          <motion.div 
            key="interview"
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="h-full flex flex-col relative"
          >
             <GlassPane className="h-full p-0 overflow-hidden bg-slate-50 border-slate-200 shadow-2xl relative flex flex-col">
                
                {/* Header */}
                <div className="h-20 border-b border-slate-100 flex justify-between items-center bg-white px-6 shrink-0">
                   <div className="flex items-center gap-4">
                      <button 
                        onClick={handleBackNavigation} 
                        className="p-2 hover:bg-slate-100 rounded-lg text-ink-400 hover:text-ink-900 transition-colors group"
                        title="Back"
                      >
                         <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      </button>
                      <div className="w-10 h-10 rounded-xl bg-tech-purple text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
                         <BrainCircuit className="w-5 h-5" />
                      </div>
                      <div>
                         <h2 className="text-lg font-bold text-ink-900">Genesis Architect</h2>
                         <p className="text-[10px] text-ink-500 font-medium uppercase tracking-wider">
                            System Configuration
                         </p>
                      </div>
                   </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
                   
                   {/* STEP 1: MODE SELECT */}
                   {wizardStep === WizardStep.MODE_SELECT && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
                         <button 
                           onClick={() => setWizardStep(WizardStep.SEARCH)}
                           className="group relative p-8 bg-white border border-slate-200 hover:border-tech-purple rounded-3xl text-left hover:shadow-xl transition-all overflow-hidden"
                         >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 text-tech-purple relative z-10">
                               <Building2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-ink-900 mb-2 relative z-10">Existing Business</h3>
                            <p className="text-ink-500 text-sm relative z-10">I have an active company. Find my data and optimize my operations.</p>
                         </button>

                         <button 
                           onClick={() => setWizardStep(WizardStep.MANUAL)}
                           className="group relative p-8 bg-white border border-slate-200 hover:border-tech-cyan rounded-3xl text-left hover:shadow-xl transition-all overflow-hidden"
                         >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mb-6 text-tech-cyan relative z-10">
                               <Lightbulb className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-ink-900 mb-2 relative z-10">New Idea</h3>
                            <p className="text-ink-500 text-sm relative z-10">I am building from scratch. Help me structure my team and strategy.</p>
                         </button>
                      </motion.div>
                   )}

                   {/* STEP 2: SEARCH */}
                   {wizardStep === WizardStep.SEARCH && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                         <h3 className="text-2xl font-bold text-ink-900 mb-6 text-center">Identify Entity</h3>
                         <div className="space-y-4">
                            <div>
                               <label className="block text-xs font-bold text-ink-500 uppercase mb-2">Business Name</label>
                               <div className="relative">
                                  <Building2 className="absolute left-3 top-3 w-5 h-5 text-ink-400" />
                                  <input 
                                    autoFocus
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-tech-purple focus:ring-2 focus:ring-tech-purple/20 transition-all text-ink-900"
                                    placeholder="e.g. Acme Corp"
                                    value={searchInputs.name}
                                    onChange={(e) => setSearchInputs({ ...searchInputs, name: e.target.value })}
                                  />
                               </div>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-ink-500 uppercase mb-2">Location</label>
                               <div className="relative">
                                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-ink-400" />
                                  <input 
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-tech-purple focus:ring-2 focus:ring-tech-purple/20 transition-all text-ink-900"
                                    placeholder="e.g. San Francisco, CA"
                                    value={searchInputs.location}
                                    onChange={(e) => setSearchInputs({ ...searchInputs, location: e.target.value })}
                                  />
                               </div>
                            </div>
                            
                            <button 
                              onClick={identifyBusiness}
                              disabled={isSearching || !searchInputs.name || !searchInputs.location}
                              className="w-full py-3.5 bg-tech-purple hover:bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
                            >
                               {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                               Find Business
                            </button>
                            
                            <button onClick={() => setWizardStep(WizardStep.MANUAL)} className="w-full py-2 text-xs text-ink-400 hover:text-ink-600 transition-colors">
                               Skip to manual entry
                            </button>
                         </div>
                      </motion.div>
                   )}

                   {/* STEP 3: CONFIRM */}
                   {wizardStep === WizardStep.CONFIRM && foundEntity && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center">
                         <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                            <Check className="w-10 h-10 text-emerald-500" />
                         </div>
                         <h3 className="text-2xl font-bold text-ink-900 mb-2">{foundEntity.name}</h3>
                         <div className="flex items-center justify-center gap-2 text-sm text-ink-500 mb-6">
                            <MapPin className="w-4 h-4" /> {foundEntity.location}
                         </div>
                         
                         <div className="bg-slate-50 p-4 rounded-xl text-sm text-ink-600 mb-8 border border-slate-100 italic">
                            "{foundEntity.description}"
                         </div>

                         <div className="flex gap-4">
                            <button 
                              onClick={() => setWizardStep(WizardStep.MANUAL)}
                              className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-ink-900 rounded-xl font-bold transition-colors"
                            >
                               No, that's wrong
                            </button>
                            <button 
                              onClick={() => handleBuildOS(foundEntity)}
                              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                               Confirm Entity
                            </button>
                         </div>
                      </motion.div>
                   )}

                   {/* STEP 4: MANUAL */}
                   {wizardStep === WizardStep.MANUAL && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-lg bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                         <h3 className="text-2xl font-bold text-ink-900 mb-6 text-center">Business Profile</h3>
                         <div className="space-y-4">
                            <div>
                               <label className="block text-xs font-bold text-ink-500 uppercase mb-2">Venture Name</label>
                               <div className="relative">
                                  <Rocket className="absolute left-3 top-3 w-5 h-5 text-ink-400" />
                                  <input 
                                    autoFocus
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-tech-purple focus:ring-2 focus:ring-tech-purple/20 transition-all text-ink-900"
                                    placeholder="e.g. NextGen AI"
                                    value={manualInputs.name}
                                    onChange={(e) => setManualInputs({ ...manualInputs, name: e.target.value })}
                                  />
                               </div>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-ink-500 uppercase mb-2">Industry</label>
                               <div className="relative">
                                  <Briefcase className="absolute left-3 top-3 w-5 h-5 text-ink-400" />
                                  <input 
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-tech-purple focus:ring-2 focus:ring-tech-purple/20 transition-all text-ink-900"
                                    placeholder="e.g. SaaS, Retail, BioTech"
                                    value={manualInputs.industry}
                                    onChange={(e) => setManualInputs({ ...manualInputs, industry: e.target.value })}
                                  />
                               </div>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-ink-500 uppercase mb-2">Description</label>
                               <textarea 
                                 className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-tech-purple focus:ring-2 focus:ring-tech-purple/20 transition-all text-ink-900 h-24 resize-none"
                                 placeholder="We help companies automate X using Y..."
                                 value={manualInputs.description}
                                 onChange={(e) => setManualInputs({ ...manualInputs, description: e.target.value })}
                               />
                            </div>
                            
                            <button 
                              onClick={() => handleBuildOS({ 
                                 name: manualInputs.name, 
                                 industry: manualInputs.industry, 
                                 description: manualInputs.description, 
                                 founders: [], 
                                 coreProduct: 'Idea' 
                              })}
                              disabled={!manualInputs.name || !manualInputs.industry}
                              className="w-full py-3.5 bg-tech-purple hover:bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
                            >
                               <Zap className="w-5 h-5" />
                               Initialize OS
                            </button>
                         </div>
                      </motion.div>
                   )}

                </div>
             </GlassPane>
          </motion.div>
        )}

        {/* PHASE 3: BUILDING SYSTEM */}
        {phase === Phase.BUILDING && (
           <SystemBuilder team={research.dossier ? [] : []} /> // Temporarily pass empty until team is generated
        )}

      </AnimatePresence>
    </div>
  );
};

// Helper Icon for manual inputs
const Rocket = ({ className }: { className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
);
