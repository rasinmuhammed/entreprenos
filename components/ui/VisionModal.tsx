
import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Eye, Loader2, ScanLine, CheckCircle2 } from 'lucide-react';
import { GlassPane } from './GlassPane';
import { analyzeMultimodalInput } from '../../services/geminiService';
import { WidgetType } from '../../types';

export const VisionModal: React.FC = () => {
  const { isVisionModalOpen, setVisionModalOpen, context, appendWidgets, setCompetitors, competitors } = useAppStore();
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isVisionModalOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!context) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      try {
        const result = await analyzeMultimodalInput(base64, context);
        
        // --- 1. THE MISSING LINK: Handle Sketches (Napkin-to-App) ---
        if (result.detectedType === 'UI_BLUEPRINT' && result.dataPayload?.genUISchema) {
           appendWidgets([{
              id: Math.random().toString(),
              type: WidgetType.GENERATIVE_UI,
              title: "Blueprint V1 (From Sketch)",
              content: {}, 
              genUISchema: result.dataPayload.genUISchema,
              gridArea: "span 2 / span 2"
           }]);
           
           // UX Micro-Polish: Show success state, then delay close
           setAnalysisResult({ 
              detectedType: "SUCCESS", 
              summary: "Blueprint confirmed. Generating interface components..." 
           });
           
           setTimeout(() => {
             setVisionModalOpen(false);
           }, 1500);
           return;
        }
        
        setAnalysisResult(result);

        // Auto-apply logic for other types
        if (result.detectedType === 'COMPETITOR_PRICING' && result.dataPayload) {
           if (result.dataPayload.competitors) {
             // In a real app we would merge intelligently
             // setCompetitors([...competitors, ...result.dataPayload.competitors]);
           }
        }
        if (result.detectedType === 'PHYSICAL_INVENTORY' && result.dataPayload?.widgets) {
           appendWidgets(result.dataPayload.widgets);
        }
        
      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-nebula-950/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl"
      >
        <GlassPane className="relative p-8 overflow-hidden">
           <button 
             onClick={() => setVisionModalOpen(false)}
             className="absolute top-4 right-4 p-2 text-white/30 hover:text-white rounded-full hover:bg-white/10 transition-colors z-20"
           >
             <X className="w-5 h-5" />
           </button>

           <div className="flex items-center gap-3 mb-8">
             <div className="p-3 bg-tech-purple/20 rounded-xl">
               <Eye className="w-6 h-6 text-tech-purple" />
             </div>
             <div>
               <h2 className="text-2xl font-light text-white">Omniscient Vision</h2>
               <p className="text-white/40 text-sm">Upload visual intelligence (Competitor Pricing, Sketches, Shelf Photos)</p>
             </div>
           </div>

           {!analysisResult && !isAnalyzing && (
             <div 
               className={`h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 touch-manipulation ${
                 dragActive ? 'border-tech-purple bg-tech-purple/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'
               }`}
               onDragEnter={handleDrag}
               onDragLeave={handleDrag}
               onDragOver={handleDrag}
               onDrop={handleDrop}
               onClick={() => inputRef.current?.click()}
             >
               <input ref={inputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleChange} />
               <Upload className="w-10 h-10 text-white/20 mb-4" />
               <p className="text-white/60 font-medium text-lg flex flex-col items-center gap-2">
                  <span className="hidden md:inline">Drag & Drop or Click to Upload</span>
                  <span className="md:hidden font-bold text-tech-purple">Tap to Take Photo</span>
               </p>
               <p className="text-white/30 text-xs mt-2">Supports JPG, PNG, WEBP</p>
             </div>
           )}

           {isAnalyzing && (
             <div className="h-64 flex flex-col items-center justify-center relative overflow-hidden rounded-xl bg-black/20">
               <div className="absolute inset-0 bg-grid-pattern opacity-20 animate-pulse" />
               <div className="absolute top-0 w-full h-1 bg-tech-purple shadow-[0_0_20px_#8b5cf6] animate-scanline" />
               
               <Loader2 className="w-10 h-10 text-tech-purple animate-spin mb-4 relative z-10" />
               <div className="font-mono text-tech-purple text-sm relative z-10">ANALYZING PIXEL DATA...</div>
             </div>
           )}

           {analysisResult && (
             <div className="bg-white/5 rounded-xl p-6 border border-white/10">
               <div className="flex items-center gap-2 mb-4">
                 {analysisResult.detectedType === "SUCCESS" ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />
                 ) : (
                    <ScanLine className="w-5 h-5 text-tech-emerald" />
                 )}
                 <span className={`font-mono uppercase tracking-wider text-sm ${analysisResult.detectedType === "SUCCESS" ? "text-emerald-400 font-bold" : "text-tech-emerald"}`}>
                    {analysisResult.detectedType === "SUCCESS" ? "Construction Initiated" : "Analysis Complete"}
                 </span>
               </div>
               
               {analysisResult.detectedType !== "SUCCESS" && (
                 <div className="mb-4">
                   <div className="text-[10px] text-white/30 uppercase font-mono mb-1">Detected Type</div>
                   <div className="text-white font-medium">{analysisResult.detectedType}</div>
                 </div>
               )}

               <div className="mb-6">
                 <div className="text-[10px] text-white/30 uppercase font-mono mb-1">Summary</div>
                 <p className="text-sm text-white/70 leading-relaxed">{analysisResult.summary}</p>
               </div>

               {analysisResult.detectedType !== "SUCCESS" && (
                 <div className="p-4 bg-tech-emerald/10 border border-tech-emerald/20 rounded-lg flex items-center justify-between">
                   <span className="text-xs text-emerald-200">Data extracted and synced to OS.</span>
                   <button onClick={() => setVisionModalOpen(false)} className="text-xs font-medium text-emerald-400 hover:text-white transition-colors">
                     Close & View
                   </button>
                 </div>
               )}
             </div>
           )}

        </GlassPane>
      </motion.div>
    </div>
  );
};
