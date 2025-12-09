
import React, { useState, useRef } from 'react';
import { WidgetData, WidgetType } from '../../types';
import { GlassPane } from '../ui/GlassPane';
import { TrendingUp, TrendingDown, AlertTriangle, List, Layout, MapPin, Globe, ShieldAlert, GitBranch, CheckCircle2, Circle, ArrowRight, Plug, Flag, ChevronDown, ChevronUp, MessageSquare, Loader2, Upload, Maximize2, Target, Coins, Scale, Star, Navigation, MoreHorizontal, Rocket, Lightbulb, Zap, Users, ShoppingBag, BarChart3, PieChart, Briefcase, Cpu, Mail, ExternalLink, Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeSalesData, fetchBusinessProfileDetails } from '../../services/geminiService';
import { GenerativeWidget } from './GenerativeWidget';
import { EmailClient } from './EmailClient';

export const DynamicWidget: React.FC<{ widget: WidgetData }> = ({ widget }) => {
  const { startBoardRoomSession, context, appendWidgets, updateWidgetContent } = useAppStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleDeepDive = () => {
    startBoardRoomSession(`Deep dive analysis on: ${widget.title}`);
  };

  const handleDeployTactic = (tactic: string) => {
    startBoardRoomSession(`Create a detailed execution plan for: ${tactic}`);
  };

  const handleSwotDebate = (point: string, category: string) => {
    startBoardRoomSession(`Strategic debate on ${category}: "${point}". How do we address this?`);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !context) {
        setActiveServiceId(null);
        return;
    }
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      try {
        const result = await analyzeSalesData(text, context);
        if (result.widgets) appendWidgets(result.widgets);
      } catch (err) { console.error("Import failed", err); } finally {
        setIsAnalyzing(false);
        setActiveServiceId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleConnect = async (serviceName: string) => {
    setActiveServiceId(serviceName);
    if (serviceName.toLowerCase().includes("google business")) {
       setIsAnalyzing(true);
       try {
         await new Promise(r => setTimeout(r, 1000));
         const result = await fetchBusinessProfileDetails(context?.businessName || "");
         if (result.widgets) appendWidgets(result.widgets);
       } catch (err) { console.error("GBP Connect failed", err); } finally {
         setIsAnalyzing(false);
         setActiveServiceId(null);
       }
       return;
    }
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const toggleTaskStatus = (colIndex: number, taskIndex: number, currentText: string) => {
     if (widget.type !== WidgetType.KANBAN_BOARD) return;
     const isDone = currentText.startsWith("✅ ");
     const newText = isDone ? currentText.replace("✅ ", "") : "✅ " + currentText;
     const newColumns = [...widget.content.columns];
     newColumns[colIndex].tasks[taskIndex] = newText;
     updateWidgetContent(widget.id, { ...widget.content, columns: newColumns });
  };

  if (!widget) return null;
  
  // Defensive: If content is missing, show error card instead of nothing
  if (!widget.content && !widget.genUISchema && widget.type !== WidgetType.EMAIL_CLIENT) {
     return (
        <GlassPane className="h-full p-6 flex flex-col items-center justify-center text-center border-dashed border-white/20">
           <AlertTriangle className="w-8 h-8 text-white/20 mb-2" />
           <div className="text-xs text-white/40 font-mono">Data Corruption</div>
           <div className="text-[10px] text-white/20">{widget.title}</div>
        </GlassPane>
     );
  }
  
  const safeRender = (val: any) => {
    if (typeof val === 'object' && val !== null) {
      return val.label || val.value || val.text || val.toString();
    }
    return val;
  };

  // --- WIDGET RENDERERS ---

  switch (widget.type) {
    case WidgetType.GENERATIVE_UI:
      return (
        <div className="h-full relative group">
           {/* Generative Badge */}
           <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-tech-purple/20 px-2 py-0.5 rounded text-[9px] font-mono text-tech-purple border border-tech-purple/20 pointer-events-none">
             <Cpu className="w-3 h-3" /> GEN_UI
           </div>
           <GenerativeWidget schema={widget.genUISchema!} />
        </div>
      );
    
    case WidgetType.EMAIL_CLIENT:
      return (
        <div className="h-full relative overflow-hidden">
           {/* In Dashboard View, we might show a mini-list, but let's assume full interactivity */}
           <EmailClient />
        </div>
      );

    case WidgetType.DIGITAL_PRESENCE:
      const { presenceScore, websiteUrl, googleMapsUrl, socialLinks, reviews, missingAssets } = widget.content;
      return (
        <GlassPane className="h-full p-6" hoverEffect>
           <div className="flex items-center gap-2 mb-6">
             <Globe className="w-4 h-4 text-tech-cyan" />
             <h3 className="text-white font-medium text-sm">{widget.title}</h3>
           </div>

           <div className="flex items-center gap-6 mb-6">
              <div className="relative w-20 h-20 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10" />
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" 
                       strokeDasharray={226}
                       strokeDashoffset={226 - (226 * (presenceScore || 0) / 100)}
                       className={`${(presenceScore || 0) > 70 ? 'text-tech-emerald' : 'text-tech-amber'} transition-all duration-1000`}
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-light text-white font-mono">{presenceScore || 0}</span>
                    <span className="text-[8px] text-white/40 uppercase">Score</span>
                 </div>
              </div>
              
              <div className="flex-1 space-y-2">
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Website</span>
                    {websiteUrl ? (
                       <a href={websiteUrl} target="_blank" className="flex items-center gap-1 text-tech-cyan hover:underline decoration-tech-cyan/30">
                          Active <ExternalLink className="w-3 h-3" />
                       </a>
                    ) : (
                       <span className="text-rose-400 font-mono text-[10px]">MISSING</span>
                    )}
                 </div>
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Google Maps</span>
                    {googleMapsUrl ? (
                       <a href={googleMapsUrl} target="_blank" className="flex items-center gap-1 text-tech-cyan hover:underline decoration-tech-cyan/30">
                          Claimed <CheckCircle2 className="w-3 h-3" />
                       </a>
                    ) : (
                       <span className="text-rose-400 font-mono text-[10px]">UNCLAIMED</span>
                    )}
                 </div>
                 {reviews && reviews.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                       <span className="text-white/60">Rating</span>
                       <span className="text-tech-amber flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> {reviews[0].rating} ({reviews[0].count})
                       </span>
                    </div>
                 )}
              </div>
           </div>

           {socialLinks && socialLinks.length > 0 && (
              <div className="mb-4">
                 <div className="text-[10px] text-white/30 uppercase font-mono mb-2">Social Graph</div>
                 <div className="flex gap-2">
                    {socialLinks.map((link: any, idx: number) => {
                       let Icon = Globe;
                       if (link.platform.toLowerCase().includes('linked')) Icon = Linkedin;
                       if (link.platform.toLowerCase().includes('twitter')) Icon = Twitter;
                       if (link.platform.toLowerCase().includes('instagram')) Icon = Instagram;
                       if (link.platform.toLowerCase().includes('facebook')) Icon = Facebook;
                       
                       return (
                          <a key={idx} href={link.url} target="_blank" title={link.platform} className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-tech-cyan/30 rounded-lg text-white/60 hover:text-white transition-all">
                             <Icon className="w-4 h-4" />
                          </a>
                       );
                    })}
                 </div>
              </div>
           )}

           {missingAssets && missingAssets.length > 0 && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg mt-auto">
                 <div className="text-[10px] text-rose-400 font-mono uppercase mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Missing Assets
                 </div>
                 <div className="flex flex-wrap gap-1">
                    {missingAssets.map((asset: string, i: number) => (
                       <span key={i} className="text-[10px] px-1.5 py-0.5 bg-rose-500/10 text-rose-300 rounded border border-rose-500/10">{asset}</span>
                    ))}
                 </div>
              </div>
           )}
        </GlassPane>
      );

    case WidgetType.METRIC_CARD:
      return (
        <GlassPane 
           className="h-full relative group cursor-pointer border-t-4 border-t-tech-cyan/50" 
           onClick={() => setIsFlipped(!isFlipped)} 
           hoverEffect
        >
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div 
                key="front"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full p-6 flex flex-col justify-between relative z-10"
              >
                <div className="flex justify-between items-start">
                  <span className="text-white/50 text-[10px] font-mono uppercase tracking-widest">{widget.title}</span>
                  <div className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${widget.content.trend === 'up' ? 'bg-tech-emerald/10 text-tech-emerald' : 'bg-tech-rose/10 text-tech-rose'}`}>
                    {widget.content.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {widget.content.trend === 'up' ? '+2.4%' : '-1.1%'}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-5xl font-mono font-light text-white tracking-tighter text-glow">{safeRender(widget.content.value)}</div>
                  <div className="text-xs text-white/30 mt-2 font-mono">{safeRender(widget.content.unit)}</div>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Maximize2 className="w-4 h-4 text-white/20 hover:text-tech-cyan transition-colors" />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="back"
                initial={{ opacity: 0, rotateX: 90 }} animate={{ opacity: 1, rotateX: 0 }} exit={{ opacity: 0 }}
                className="h-full p-6 flex flex-col items-center justify-center text-center bg-nebula-950/80"
              >
                <div className="text-[10px] font-mono text-tech-cyan mb-4 animate-pulse">AWAITING DEEP SCAN</div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeepDive(); }}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:border-tech-cyan text-white text-xs font-mono rounded-lg transition-all"
                >
                  [ INITIALIZE ]
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassPane>
      );

    case WidgetType.SWOT_TACTICAL:
      const { strengths, weaknesses, opportunities, threats } = widget.content;
      return (
        <GlassPane className="h-full p-0 flex flex-col" hoverEffect={false}>
          <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/5">
             <Scale className="w-4 h-4 text-tech-purple" />
             <h3 className="text-white text-sm font-medium">{widget.title}</h3>
          </div>
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px bg-white/10">
             {[
               { title: "Strengths", items: strengths, color: "text-emerald-400", bg: "bg-nebula-900" },
               { title: "Weaknesses", items: weaknesses, color: "text-rose-400", bg: "bg-nebula-900" },
               { title: "Opportunities", items: opportunities, color: "text-tech-cyan", bg: "bg-nebula-900" },
               { title: "Threats", items: threats, color: "text-tech-amber", bg: "bg-nebula-900" },
             ].map((quad, idx) => (
                <div key={idx} className={`p-4 ${quad.bg} overflow-y-auto custom-scrollbar group relative`}>
                   <div className={`text-[9px] font-mono uppercase tracking-widest mb-2 ${quad.color} flex justify-between`}>
                     {quad.title}
                   </div>
                   <ul className="space-y-2">
                     {Array.isArray(quad.items) && quad.items.map((item: any, i: number) => (
                       <li 
                         key={i} 
                         onClick={() => handleSwotDebate(safeRender(item), quad.title)}
                         className="text-[10px] text-white/70 hover:text-white cursor-pointer hover:underline decoration-white/20 underline-offset-2 leading-relaxed"
                       >
                         • {safeRender(item)}
                       </li>
                     ))}
                   </ul>
                </div>
             ))}
          </div>
        </GlassPane>
      );

    case WidgetType.INVENTORY_TRACKER:
      const inventoryItems = Array.isArray(widget.content.items) ? widget.content.items : [];
      return (
         <GlassPane className="h-full p-6" hoverEffect>
           <div className="flex items-center gap-2 mb-6">
             <ShoppingBag className="w-4 h-4 text-tech-emerald" />
             <h3 className="text-white font-medium text-sm">{widget.title}</h3>
           </div>
           <div className="space-y-4 overflow-y-auto max-h-[220px] custom-scrollbar pr-2">
             {inventoryItems.map((item: any, idx: number) => (
               <div key={idx} className="group">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-xs text-white">{safeRender(item.name)}</span>
                   <span className={`text-[9px] font-mono px-1.5 rounded ${item.status === 'Low' ? 'bg-rose-500/10 text-rose-400' : 'text-emerald-400'}`}>
                     {item.status === 'Low' ? 'RESTOCK' : 'HEALTHY'}
                   </span>
                 </div>
                 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                   <div 
                     className={`h-full rounded-full ${item.status === 'Low' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                     style={{ width: `${item.stockLevel}%` }} 
                   />
                 </div>
               </div>
             ))}
           </div>
         </GlassPane>
      );

    case WidgetType.SUBSCRIPTION_METRICS:
      return (
        <GlassPane className="h-full p-6 flex flex-col justify-between" hoverEffect>
           <div className="flex items-center gap-2 mb-4">
             <BarChart3 className="w-4 h-4 text-tech-cyan" />
             <h3 className="text-white font-medium text-sm">{widget.title}</h3>
           </div>
           
           <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="text-[9px] text-white/40 font-mono uppercase">MRR</div>
                <div className="text-xl text-white font-mono">{safeRender(widget.content.mrr)}</div>
                <div className="text-[9px] text-emerald-400 flex items-center gap-1"><TrendingUp className="w-2 h-2"/> {safeRender(widget.content.growth)}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="text-[9px] text-white/40 font-mono uppercase">Churn</div>
                <div className="text-xl text-white font-mono">{safeRender(widget.content.churn)}</div>
              </div>
           </div>

           <div className="p-3 bg-nebula-950/50 rounded-lg flex items-center justify-between">
              <span className="text-[10px] text-white/50">LTV Estimate</span>
              <span className="text-sm font-mono text-tech-cyan">{safeRender(widget.content.ltv)}</span>
           </div>
        </GlassPane>
      );

    case WidgetType.CLIENT_PIPELINE:
      const stages = Array.isArray(widget.content.stages) ? widget.content.stages : [];
      return (
        <GlassPane className="h-full p-6" hoverEffect>
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-4 h-4 text-tech-purple" />
            <h3 className="text-white font-medium text-sm">{widget.title}</h3>
          </div>
          <div className="space-y-4">
             {stages.map((stage: any, idx: number) => (
               <div key={idx} className="flex items-center gap-3">
                 <div className="w-24 text-[10px] font-mono text-white/40 text-right uppercase">{safeRender(stage.name)}</div>
                 <div className="flex-1 h-8 bg-white/5 rounded overflow-hidden relative group cursor-pointer border border-white/5 hover:border-tech-purple/30 transition-colors">
                    <div className="absolute inset-y-0 left-0 bg-tech-purple/20 group-hover:bg-tech-purple/30 transition-all" style={{ width: `${Math.min((stage.count || 0) * 10, 100)}%` }} />
                    <div className="absolute inset-0 flex items-center justify-between px-3">
                       <span className="text-xs font-medium text-white">{safeRender(stage.count)}</span>
                       <span className="text-[9px] font-mono text-white/60">{safeRender(stage.value)}</span>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </GlassPane>
      );

    case WidgetType.ALERT_PANEL:
      const severity = safeRender(widget.content.severity).toLowerCase();
      const isCritical = severity === 'high' || severity === 'critical';
      const themeColor = isCritical ? 'text-tech-rose' : 'text-tech-amber';
      const bgColor = isCritical ? 'bg-tech-rose/10' : 'bg-tech-amber/10';

      return (
        <GlassPane className={`h-full p-6 cursor-pointer ${isCritical ? 'border-tech-rose/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : ''}`} onClick={handleDeepDive} hoverEffect>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-1.5 rounded ${bgColor}`}>
              <ShieldAlert className={`w-4 h-4 ${themeColor} ${isCritical ? 'animate-pulse' : ''}`} />
            </div>
            <h3 className={`font-medium text-sm tracking-wide ${isCritical ? 'text-rose-100' : 'text-amber-100'}`}>{widget.title}</h3>
          </div>
          <p className={`${isCritical ? 'text-rose-200/80' : 'text-amber-200/80'} text-xs leading-relaxed font-mono`}>
            {safeRender(widget.content.message)}
          </p>
          <div className="mt-auto pt-4 flex gap-2">
             <div className={`text-[9px] font-mono uppercase border px-2 py-1 rounded ${isCritical ? 'border-tech-rose/30 text-tech-rose' : 'border-tech-amber/30 text-tech-amber'}`}>
              SEV: {safeRender(widget.content.severity)}
            </div>
             <div className="ml-auto flex items-center gap-1 text-[9px] font-mono opacity-60 group-hover:opacity-100 transition-opacity text-white">
               RESOLVE <ArrowRight className="w-3 h-3" />
             </div>
          </div>
        </GlassPane>
      );

    case WidgetType.GROWTH_TACTICS:
      const tactics = Array.isArray(widget.content.tactics) ? widget.content.tactics : [];
      return (
         <GlassPane className="h-full p-6" hoverEffect={false}>
            <div className="flex items-center gap-2 mb-6">
              <Rocket className="w-4 h-4 text-tech-purple" />
              <h3 className="text-white font-medium text-sm">{widget.title}</h3>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[240px] custom-scrollbar pr-2">
               {tactics.map((tactic: any, idx: number) => (
                 <motion.div 
                   key={idx}
                   whileHover={{ scale: 1.02 }}
                   className="bg-white/5 border border-white/5 rounded-lg p-4 group hover:bg-white/10 hover:border-tech-cyan/30 transition-all cursor-pointer"
                 >
                   <div className="flex justify-between items-start mb-2">
                     <h4 className="text-sm font-medium text-white group-hover:text-tech-cyan transition-colors">{safeRender(tactic.title)}</h4>
                     <div className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase border ${tactic.roi === 'High' ? 'border-tech-emerald/30 text-tech-emerald bg-tech-emerald/10' : 'border-white/20 text-white/50'}`}>
                       ROI: {safeRender(tactic.roi)}
                     </div>
                   </div>
                   <p className="text-xs text-white/60 mb-3 leading-relaxed">{safeRender(tactic.description)}</p>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="text-[9px] text-white/30 font-mono uppercase">Effort</div>
                        <div className="flex gap-0.5">
                          {[1,2,3].map(i => (
                             <div key={i} className={`w-3 h-1 rounded-full ${
                               (tactic.effort === 'High' && i<=3) || (tactic.effort === 'Med' && i<=2) || (tactic.effort === 'Low' && i===1) 
                               ? 'bg-tech-purple' : 'bg-white/10'
                             }`} />
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeployTactic(safeRender(tactic.title))}
                        className="text-[9px] flex items-center gap-1 text-white/40 hover:text-white transition-colors uppercase font-mono tracking-wider"
                      >
                        Deploy <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                   </div>
                 </motion.div>
               ))}
            </div>
         </GlassPane>
      );

    case WidgetType.KANBAN_BOARD:
      const kanbanColumns = Array.isArray(widget.content.columns) ? widget.content.columns : [];
      return (
        <GlassPane className="h-full p-0 flex flex-col" hoverEffect={false}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Layout className="w-4 h-4 text-tech-purple" />
               <h3 className="text-white text-sm font-medium">{widget.title}</h3>
             </div>
             <MoreHorizontal className="w-4 h-4 text-white/20" />
          </div>
          <div className="flex-1 p-4 grid grid-cols-3 gap-3 overflow-hidden">
             {kanbanColumns.slice(0,3).map((col: any, colIdx: number) => (
               <div key={colIdx} className="flex flex-col h-full bg-white/5 rounded-lg border border-white/5">
                 <div className="p-2 border-b border-white/5 bg-white/5">
                   <div className="text-[9px] font-mono text-white/50 uppercase tracking-wider">{safeRender(col.title)}</div>
                 </div>
                 <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                   {Array.isArray(col.tasks) && col.tasks.map((t: any, taskIdx: number) => {
                     const taskText = safeRender(t);
                     const isDone = taskText.startsWith("✅");
                     return (
                       <motion.div 
                         key={taskIdx} 
                         whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                         onClick={() => toggleTaskStatus(colIdx, taskIdx, taskText)}
                         className={`p-2 rounded border transition-colors cursor-pointer text-[10px] leading-relaxed
                           ${isDone ? 'bg-tech-emerald/10 border-tech-emerald/20 text-tech-emerald/70' : 'bg-nebula-900 border-white/10 text-white/80'}
                         `}
                       >
                         {taskText.replace("✅ ", "")}
                       </motion.div>
                     );
                   })}
                 </div>
               </div>
             ))}
          </div>
        </GlassPane>
      );

    case WidgetType.ROADMAP_STRATEGY:
        const roadmapSteps = Array.isArray(widget.content.steps) ? widget.content.steps : [];
        return (
           <GlassPane className="h-full p-6 cursor-pointer" onClick={handleDeepDive} hoverEffect>
            <div className="flex items-center gap-2 mb-6">
              <GitBranch className="w-4 h-4 text-tech-cyan" />
              <h3 className="text-white font-medium text-sm">{widget.title}</h3>
            </div>
            <div className="space-y-6 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
              {roadmapSteps.slice(0, 4).map((step: any, idx: number) => (
                <div key={idx} className="flex gap-4 relative z-10">
                  <div className="mt-0.5">
                    {step.status === 'completed' ? <div className="w-3.5 h-3.5 rounded-full bg-tech-emerald border border-tech-emerald shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> :
                     step.status === 'active' ? <div className="w-3.5 h-3.5 rounded-full bg-nebula-950 border border-tech-cyan animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]" /> :
                     <div className="w-3.5 h-3.5 rounded-full bg-nebula-950 border border-white/20" />}
                  </div>
                  <div>
                    <div className={`text-[9px] font-mono uppercase mb-0.5 tracking-wider ${step.status === 'active' ? 'text-tech-cyan' : 'text-white/30'}`}>
                      {safeRender(step.phase)}
                    </div>
                    <div className="text-xs text-white/90">{safeRender(step.action)}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassPane>
        );

    case WidgetType.INTEGRATION_HUB:
      const services = Array.isArray(widget.content.services) ? widget.content.services : [];
      return (
        <GlassPane className="h-full p-6 bg-tech-purple/5" hoverEffect={false}>
           <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt,.json" onChange={handleFileImport} />
           <div className="flex items-center gap-2 mb-6">
            <Plug className="w-4 h-4 text-tech-purple" />
            <h3 className="text-white font-medium text-sm">{widget.title}</h3>
          </div>
          <div className="space-y-3">
            {services.map((service: any, idx: number) => (
              <div key={idx} className="bg-nebula-900/50 border border-white/5 rounded-lg p-3 flex items-center justify-between group hover:border-white/10 transition-colors">
                <div>
                  <div className="text-xs font-medium text-white">{safeRender(service.name)}</div>
                  <div className="text-[9px] text-white/40 font-mono">{safeRender(service.reason)}</div>
                </div>
                <button 
                  onClick={() => handleConnect(safeRender(service.name))}
                  disabled={service.status === 'connected' || isAnalyzing}
                  className={`px-2 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5
                  ${service.status === 'connected' ? 'text-tech-emerald cursor-default' : 'bg-white/5 text-white/60 hover:bg-tech-purple hover:text-white'}
                `}>
                  <div className={`w-1.5 h-1.5 rounded-full ${service.status === 'connected' ? 'bg-tech-emerald' : 'bg-white/20'}`} />
                  {activeServiceId === service.name && isAnalyzing ? 'SYNCING...' : (service.status === 'connected' ? 'LINKED' : 'CONNECT')}
                </button>
              </div>
            ))}
             <div className="border border-dashed border-white/20 rounded-lg p-3 flex items-center justify-between group hover:border-white/40 transition-colors cursor-pointer" onClick={() => handleConnect("Sales Data Import")}>
                <div>
                  <div className="text-xs font-medium text-white">Sales Data Import</div>
                  <div className="text-[9px] text-white/40 font-mono">CSV / JSON / XLS</div>
                </div>
                {activeServiceId === "Sales Data Import" && isAnalyzing ? 
                  <Loader2 className="w-4 h-4 text-white/50 animate-spin" /> : 
                  <Upload className="w-4 h-4 text-white/50 group-hover:text-white" />
                }
              </div>
          </div>
        </GlassPane>
      );
      
    case WidgetType.COMPETITOR_RADAR:
      const competitors = Array.isArray(widget.content.competitors) ? widget.content.competitors : [];
      return (
        <GlassPane className="h-full p-6 cursor-pointer" onClick={handleDeepDive} hoverEffect>
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-4 h-4 text-tech-rose" />
            <h3 className="text-white font-medium text-sm">{widget.title}</h3>
          </div>
          <div className="space-y-5">
            {competitors.slice(0, 4).map((comp: any, idx: number) => {
              const shareVal = parseInt(comp.marketShare) || 0;
              return (
                <div key={idx} className="group">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-white">{safeRender(comp.name)}</span>
                    <span className={`text-[9px] px-1.5 rounded-sm uppercase tracking-wide font-mono ${comp.threatLevel === 'High' ? 'text-tech-rose bg-tech-rose/10' : 'text-tech-emerald bg-tech-emerald/10'}`}>
                      {safeRender(comp.threatLevel)}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${comp.threatLevel === 'High' ? 'bg-tech-rose' : 'bg-tech-cyan'}`} style={{ width: `${Math.min(shareVal, 100)}%` }} />
                  </div>
                  <div className="flex gap-3 text-[9px] font-mono text-white/40">
                     <span>SHA: {shareVal}%</span>
                     <span>FND: {safeRender(comp.funding) || 'N/A'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPane>
      );

    case WidgetType.LOCATION_MAP:
      const { address, rating, coordinates, mapUrl } = widget.content;
      return (
        <GlassPane className="h-full p-0 flex flex-col relative overflow-hidden" hoverEffect>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
           <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
           
           <div className="p-6 relative z-10 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-4 h-4 text-tech-cyan" />
                  <h3 className="text-white font-medium text-sm">{widget.title}</h3>
                </div>

                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                       <Navigation className="w-5 h-5 text-tech-cyan" />
                     </div>
                     <div>
                       <div className="text-[9px] text-white/40 uppercase font-mono tracking-wider mb-1">Coordinates</div>
                       <div className="text-xs text-white/90 font-mono">{coordinates?.lat || "37.7749"}° N, {coordinates?.lng || "122.4194"}° W</div>
                       <div className="text-[10px] text-white/50 mt-1 leading-tight">{safeRender(address)}</div>
                     </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 text-tech-amber" />
                      </div>
                      <div>
                        <div className="text-[9px] text-white/40 uppercase font-mono tracking-wider mb-1">Reputation</div>
                        <div className="flex items-baseline gap-2">
                           <span className="text-2xl font-light text-white font-mono">{safeRender(rating)}</span>
                           <span className="text-[10px] text-white/40">/ 5.0</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-6 w-full py-2 bg-tech-cyan/10 hover:bg-tech-cyan/20 border border-tech-cyan/30 text-tech-cyan text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 rounded transition-all">
                Access Satellite Feed
              </a>
           </div>
        </GlassPane>
      );
    
    default:
        return (
             <GlassPane className="h-full p-6 cursor-pointer" onClick={handleDeepDive} hoverEffect>
                <div className="flex items-center gap-2 mb-4">
                    <List className="w-4 h-4 text-white/50" />
                    <h3 className="text-white font-medium text-sm">{widget.title}</h3>
                </div>
             </GlassPane>
        );
  }
};
