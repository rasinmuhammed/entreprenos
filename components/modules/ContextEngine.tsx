
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mic, Video, StopCircle, CheckCircle2, Camera, Sparkles, Building, BrainCircuit, LayoutGrid, MapPin, Terminal } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { analyzeMultimodalPitch, performDeepResearch, constructDashboard, generateStrategicQuestions, processSaaSOnboarding } from '../../services/geminiService';
import { GlassPane } from '../ui/GlassPane';
import { SearchVisualizer } from '../ui/SearchVisualizer';
import { useMultimodalInput } from '../../hooks/useMultimodalInput';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import { liveBridge } from '../../services/geminiLiveBridge';

enum Phase {
  INIT = 0,
  PITCH = 1,
  ANALYZING = 2,
  CONFIRMING = 3,
  BUILDING = 4
}

export const ContextEngine: React.FC = () => {
  const { 
    setContext, 
    setWidgets, 
    setDossier, 
    setSentiment, 
    startOnboarding, // To signal app start
    research
  } = useAppStore();

  const [phase, setPhase] = useState<Phase>(Phase.PITCH);
  const [error, setError] = useState<string | null>(null);
  
  // Shark Tank State
  const { isRecording, startRecording, stopRecording, stream } = useMultimodalInput();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleStopPitch = async () => {
    if (!isRecording) return;
    setPhase(Phase.ANALYZING);
    try {
      const blobs = await stopRecording();
      if (!blobs) throw new Error("Recording failed");
      
      const dossier = await analyzeMultimodalPitch(blobs.audioBlob, blobs.videoBlob);
      setDossier(dossier);
      
      // Auto-transition to dashboard construction
      handleBuild(dossier);
      
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try pitching again.");
      setPhase(Phase.PITCH);
    }
  };

  const handleBuild = async (dossier: any) => {
    try {
      const sentiment = await performDeepResearch(dossier);
      setSentiment(sentiment);
      
      setPhase(Phase.BUILDING);
      
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
        accessibilityMode: useAppStore.getState().accessibilityMode
      });

      // Announce arrival via Live Bridge if we have a generated welcome
      liveBridge.sendText(`Welcome ${dossier.name}. I've analyzed your business. I found some critical insights.`);
      
      startOnboarding(); // Triggers main app view

    } catch (err) {
      console.error(err);
      setError("System construction failed.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative z-10">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: PITCH */}
        {phase === Phase.PITCH && (
          <motion.div
            key="pitch"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="mb-8">
               <h2 className="text-3xl font-light text-white mb-2">What is your business?</h2>
               <p className="text-white/40 text-lg">In one breath, tell us who you are and what you sell.</p>
            </div>

            <GlassPane className="p-6 bg-nebula-900/80 border-white/20 shadow-2xl relative overflow-hidden">
               <div className="aspect-video bg-black rounded-xl overflow-hidden relative mb-6 border border-white/10 group">
                  {isRecording ? (
                     <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                  ) : (
                     <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                        <Camera className="w-12 h-12 text-white/20" />
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
                     className="w-20 h-20 rounded-full bg-tech-cyan hover:bg-cyan-400 flex items-center justify-center shadow-glow-cyan transition-all hover:scale-105 group"
                   >
                     <Mic className="w-8 h-8 text-nebula-950 group-hover:scale-110 transition-transform" />
                   </button>
                 ) : (
                   <button 
                     onClick={handleStopPitch}
                     className="w-20 h-20 rounded-full bg-tech-rose hover:bg-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all hover:scale-105 group"
                   >
                     <StopCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                   </button>
                 )}
               </div>
               
               <p className="text-xs font-mono text-white/30 uppercase tracking-widest">
                 {isRecording ? "Listening & Analyzing..." : "Tap to Speak"}
               </p>
            </GlassPane>
            
            {error && (
              <div className="mt-4 text-tech-rose bg-tech-rose/10 px-4 py-2 rounded text-sm font-mono border border-tech-rose/20">
                {error}
              </div>
            )}
          </motion.div>
        )}

        {/* PHASE 2: ANALYZING */}
        {(phase === Phase.ANALYZING || phase === Phase.BUILDING) && (
          <motion.div key="analyzing" className="w-full">
             <SearchVisualizer 
                query="Processing Multimodal Input" 
                steps={[
                  "Extracting semantic intent from audio...",
                  "Analyzing visual context cues...",
                  "Synthesizing Venture Dossier...",
                  "Calculating initial strategies..."
                ]}
             />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
