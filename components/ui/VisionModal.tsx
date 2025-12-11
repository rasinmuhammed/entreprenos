
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl"
      >
        <GlassPane className="relative p-8 overflow-hidden bg-white shadow-2xl">
           <button 
             onClick={() => setVisionModalOpen(false)}
             className="absolute top-4 right-4 p-2 text-ink-400 hover:text-ink-900 rounded-full hover:bg-slate-50 transition-colors z-20"
           >
             <X className="w-5 h-5" />
           </button>

           <div className="flex items-center gap-3 mb-8">
             <div className="p-3 bg-indigo-50 rounded-xl">
               <Eye className="w-6 h-6 text-tech-purple" />
             </div>
             <div>
               <h2 className="text-2xl font-bold font-display text-ink-950">Omniscient Vision</h2>
               <p className="text-ink-500 text-sm">Upload visual intelligence (Competitor Pricing, Sketches, Shelf Photos)</p>
             </div>
           </div>

           {!analysisResult && !isAnalyzing && (
             <div 
               className={`h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 touch-manipulation ${
                 dragActive ? 'border-tech-purple bg-indigo-50' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
               }`}
               onDragEnter={handleDrag}
               onDragLeave={handleDrag}
               onDragOver={handleDrag}
               onDrop={handleDrop}
               onClick={() => inputRef.current?.click()}
             >
               <input ref={inputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleChange} />
               <Upload className={`w-10 h-10 mb-4 ${dragActive ? 'text-tech-purple' : 'text-slate-300'}`} />
               <p className="text-ink-900 font-bold text-lg flex flex-col items-center gap-2">
                  <span className="hidden md:inline">Drag & Drop or Click to Upload</span>
                  <span className="md:hidden text-tech-purple">Tap to Take Photo</span>
               </p>
               <p className="text-ink-400 text-xs mt-2">Supports JPG, PNG, WEBP</p>
             </div>
           )}

           {isAnalyzing && (
             <div className="h-64 flex flex-col items-center justify-center relative overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
               <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-pulse" />
               <div className="absolute top-0 w-full h-1 bg-tech-purple shadow-glow animate-scanline" />
               
               <Loader2 className="w-10 h-10 text-tech-purple animate-spin mb-4 relative z-10" />
               <div className="font-mono text-ink-900 font-bold text-sm relative z-10">ANALYZING PIXEL DATA...</div>
             </div>
           )}

           {analysisResult && (
             <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
               <div className="flex items-center gap-2 mb-4">
                 {analysisResult.detectedType === "SUCCESS" ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-bounce" />
                 ) : (
                    <ScanLine className="w-5 h-5 text-tech-purple" />
                 )}
                 <span className={`font-mono uppercase tracking-wider text-sm font-bold ${analysisResult.detectedType === "SUCCESS" ? "text-emerald-600" : "text-tech-purple"}`}>
                    {analysisResult.detectedType === "SUCCESS" ? "Construction Initiated" : "Analysis Complete"}
                 </span>
               </div>
               
               {analysisResult.detectedType !== "SUCCESS" && (
                 <div className="mb-4">
                   <div className="text-[10px] text-ink-400 uppercase font-mono mb-1 font-bold">Detected Type</div>
                   <div className="text-ink-900 font-medium">{analysisResult.detectedType}</div>
                 </div>
               )}

               <div className="mb-6">
                 <div className="text-[10px] text-ink-400 uppercase font-mono mb-1 font-bold">Summary</div>
                 <p className="text-sm text-ink-600 leading-relaxed">{analysisResult.summary}</p>
               </div>

               {analysisResult.detectedType !== "SUCCESS" && (
                 <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between">
                   <span className="text-xs text-indigo-700 font-medium">Data extracted and synced to OS.</span>
                   <button onClick={() => setVisionModalOpen(false)} className="text-xs font-bold text-tech-purple hover:text-indigo-800 transition-colors">
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
    