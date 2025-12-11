
import React, { useState, useRef } from 'react';
import { WidgetData, WidgetType } from '../../types';
import { GlassPane } from '../ui/GlassPane';
import { TrendingUp, TrendingDown, AlertTriangle, List, Layout, MapPin, Globe, ShieldAlert, GitBranch, CheckCircle2, Circle, ArrowRight, Plug, Flag, ChevronDown, ChevronUp, MessageSquare, Loader2, Upload, Maximize2, Target, Coins, Scale, Star, Navigation, MoreHorizontal, Rocket, Lightbulb, Zap, Users, ShoppingBag, BarChart3, PieChart, Briefcase, Cpu, Mail, ExternalLink, Linkedin, Twitter, Instagram, Facebook, MoreVertical, ChevronRight, Wand2, X, Check } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeSalesData, fetchBusinessProfileDetails, transformToGenerativeUI, refineGenerativeUI } from '../../services/geminiService';
import { GenerativeWidget } from './GenerativeWidget';
import { EmailClient } from './EmailClient';

export const DynamicWidget: React.FC<{ widget: WidgetData }> = ({ widget }) => {
  const { startBoardRoomSession, context, appendWidgets, updateWidgetContent, updateWidget } = useAppStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- UI EDITING STATE ---
  const [isEditingUI, setIsEditingUI] = useState(false);
  const [uiPrompt, setUiPrompt] = useState('');
  const [isFixingUI, setIsFixingUI] = useState(false);

  // --- DATA RECOVERY LAYER ---
  let safeContent = widget?.content;
  if (widget && !safeContent && widget.type !== WidgetType.EMAIL_CLIENT && widget.type !== WidgetType.GENERATIVE_UI) {
     const { id, type, title, gridArea, genUISchema, ...rest } = widget as any;
     if (Object.keys(rest).length > 0) {
        safeContent = rest;
     }
  }

  // --- ACTIONS ---

  const handleDeepDive = () => {
    startBoardRoomSession(`Deep dive analysis on: ${widget.title}`);
  };

  const handleSwotDebate = (point: string, category: string) => {
    startBoardRoomSession(`Strategic debate on ${category}: "${point}". How do we address this?`);
  };

  const handleFixUI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uiPrompt.trim()) return;

    setIsFixingUI(true);
    try {
      let newSchema;
      if (widget.type === WidgetType.GENERATIVE_UI && widget.genUISchema) {
         newSchema = await refineGenerativeUI(widget.genUISchema, uiPrompt);
      } else {
         const baseSchema = await transformToGenerativeUI(widget);
         newSchema = await refineGenerativeUI(baseSchema, uiPrompt);
      }
      updateWidget(widget.id, {
         type: WidgetType.GENERATIVE_UI,
         genUISchema: newSchema
      });
      setIsEditingUI(false);
      setUiPrompt('');
    } catch (err) {
      console.error("UI Fix Failed", err);
    } finally {
      setIsFixingUI(false);
    }
  };

  if (!widget) return null;
  
  if (!safeContent && !widget.genUISchema && widget.type !== WidgetType.EMAIL_CLIENT) {
     return (
        <GlassPane className="h-full p-6 flex flex-col items-center justify-center text-center border-dashed border-slate-200 bg-slate-50">
           <AlertTriangle className="w-8 h-8 text-slate-300 mb-3" />
           <div className="text-sm text-ink-400 font-mono">Data Signal Lost</div>
           <button onClick={() => updateWidgetContent(widget.id, {})} className="mt-4 px-3 py-1 bg-white border border-slate-200 rounded text-[10px] text-ink-500 hover:text-ink-900 transition-colors">Retry</button>
        </GlassPane>
     );
  }
  
  const safeRender = (val: any) => {
    if (typeof val === 'object' && val !== null) {
      return val.label || val.value || val.text || val.toString();
    }
    return val;
  };

  const renderUIEditor = () => {
     if (!isEditingUI) return null;
     return (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col p-4 rounded-2xl border border-tech-purple/20 shadow-xl">
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-tech-purple">
                 <Wand2 className="w-4 h-4" />
                 <span className="text-xs font-mono uppercase tracking-widest font-bold">UI Alchemist</span>
              </div>
              <button onClick={() => setIsEditingUI(false)} className="text-ink-400 hover:text-ink-900"><X className="w-4 h-4" /></button>
           </div>
           <div className="flex-1 flex flex-col justify-center gap-4">
              <p className="text-sm text-ink-600 text-center">
                 Describe how you want this widget to look.
                 <br/><span className="text-xs text-ink-400 opacity-50">"Make it minimal" • "Use a list layout" • "Highlight key metrics"</span>
              </p>
              <form onSubmit={handleFixUI} className="relative">
                 <input 
                   autoFocus
                   value={uiPrompt}
                   onChange={e => setUiPrompt(e.target.value)}
                   placeholder="Enter your design prompt..."
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-ink-900 focus:border-tech-purple focus:outline-none transition-colors"
                 />
                 <button 
                   type="submit"
                   disabled={isFixingUI || !uiPrompt.trim()}
                   className="absolute right-2 top-2 p-1.5 bg-tech-purple text-white rounded-lg disabled:opacity-50"
                 >
                   {isFixingUI ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                 </button>
              </form>
           </div>
        </div>
     );
  };

  const renderContent = () => {
    switch (widget.type) {
      case WidgetType.GENERATIVE_UI:
        return (
          <div className="h-full relative group">
             <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-2 py-1 rounded-full text-[9px] font-mono text-tech-purple border border-tech-purple/20 shadow-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
               <Cpu className="w-3 h-3" /> <span className="tracking-widest opacity-80">GEN_UI</span>
             </div>
             <GenerativeWidget schema={widget.genUISchema!} />
          </div>
        );
      
      case WidgetType.EMAIL_CLIENT:
        return (
          <div className="h-full relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
             <EmailClient />
          </div>
        );

      case WidgetType.DIGITAL_PRESENCE:
        const { presenceScore, websiteUrl, googleMapsUrl, socialLinks, reviews, missingAssets } = safeContent;
        return (
          <GlassPane className="h-full p-6 flex flex-col hover:border-tech-purple/30 transition-colors">
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2.5">
                 <div className="p-1.5 rounded-lg bg-tech-cyan/10">
                   <Globe className="w-4 h-4 text-tech-cyan" />
                 </div>
                 <h3 className="text-ink-900 font-semibold text-sm tracking-tight">{widget.title}</h3>
               </div>
               <MoreVertical className="w-4 h-4 text-ink-300" />
             </div>
  
             <div className="flex items-center gap-8 mb-8">
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                      <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" 
                         strokeDasharray={264}
                         strokeDashoffset={264 - (264 * (presenceScore || 0) / 100)}
                         strokeLinecap="round"
                         className={`${(presenceScore || 0) > 70 ? 'text-tech-emerald' : (presenceScore || 0) > 40 ? 'text-tech-amber' : 'text-tech-rose'} transition-all duration-1000`}
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-ink-900 tracking-tighter">{presenceScore || 0}</span>
                      <span className="text-[9px] text-ink-400 uppercase font-mono tracking-wider">Score</span>
                   </div>
                </div>
                
                <div className="flex-1 space-y-3">
                   <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-ink-500">Website</span>
                      {websiteUrl ? (
                         <a href={websiteUrl} target="_blank" className="flex items-center gap-1.5 text-tech-cyan hover:text-tech-purple transition-colors font-medium">
                            Online <ExternalLink className="w-3 h-3" />
                         </a>
                      ) : (
                         <span className="text-rose-500 font-mono text-[10px] bg-rose-50 px-1.5 py-0.5 rounded">MISSING</span>
                      )}
                   </div>
                   <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-ink-500">Maps</span>
                      {googleMapsUrl ? (
                         <a href={googleMapsUrl} target="_blank" className="flex items-center gap-1.5 text-tech-cyan hover:text-tech-purple transition-colors font-medium">
                            Verified <CheckCircle2 className="w-3 h-3" />
                         </a>
                      ) : (
                         <span className="text-rose-500 font-mono text-[10px] bg-rose-50 px-1.5 py-0.5 rounded">UNCLAIMED</span>
                      )}
                   </div>
                   {reviews && reviews.length > 0 && (
                      <div className="flex items-center justify-between text-xs py-1">
                         <span className="text-ink-500">Rating</span>
                         <span className="text-ink-900 flex items-center gap-1.5 font-bold">
                            <Star className="w-3 h-3 fill-tech-amber text-tech-amber" /> 
                            <span className="font-mono">{reviews[0].rating}</span>
                            <span className="text-ink-400 text-[10px] font-normal">({reviews[0].count})</span>
                         </span>
                      </div>
                   )}
                </div>
             </div>
  
             <div className="mt-auto space-y-4">
               {socialLinks && socialLinks.length > 0 && (
                  <div className="flex gap-2">
                     {socialLinks.map((link: any, idx: number) => {
                        let Icon = Globe;
                        if (link.platform.toLowerCase().includes('linked')) Icon = Linkedin;
                        if (link.platform.toLowerCase().includes('twitter')) Icon = Twitter;
                        if (link.platform.toLowerCase().includes('instagram')) Icon = Instagram;
                        if (link.platform.toLowerCase().includes('facebook')) Icon = Facebook;
                        
                        return (
                           <a key={idx} href={link.url} target="_blank" className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-ink-500 hover:text-ink-900 transition-all hover:scale-105">
                              <Icon className="w-4 h-4" />
                           </a>
                        );
                     })}
                  </div>
               )}
  
               {missingAssets && missingAssets.length > 0 && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex flex-wrap gap-2 items-center">
                     <AlertTriangle className="w-4 h-4 text-rose-500" />
                     {missingAssets.map((asset: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white text-rose-600 rounded-full border border-rose-100 font-medium">{asset}</span>
                     ))}
                  </div>
               )}
             </div>
          </GlassPane>
        );
  
      case WidgetType.METRIC_CARD:
        return (
          <GlassPane 
             className="h-full relative group cursor-pointer overflow-hidden bg-white hover:border-tech-purple/30 transition-colors" 
             onClick={() => setIsFlipped(!isFlipped)} 
          >
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div 
                  key="front"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full p-6 flex flex-col justify-between relative z-10"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-ink-400 text-[10px] font-mono uppercase tracking-widest font-bold">{widget.title}</span>
                    <div className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-full border ${safeContent.trend === 'up' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                      {safeContent.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span className="font-bold">{safeContent.trend === 'up' ? '+2.4%' : '-1.1%'}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-4xl lg:text-5xl font-bold text-ink-950 tracking-tighter leading-tight">{safeRender(safeContent.value)}</div>
                    <div className="text-xs text-ink-400 mt-1 font-mono uppercase tracking-wide">{safeRender(safeContent.unit)}</div>
                  </div>
                  
                  {/* Micro Chart Visualization */}
                  <div className="h-8 flex items-end gap-1 mt-4">
                    {[40, 60, 45, 70, 50, 80, 65, 85].map((h, i) => (
                      <div key={i} className={`flex-1 rounded-t-sm opacity-80 ${safeContent.trend === 'up' ? 'bg-tech-emerald' : 'bg-tech-rose'}`} style={{ height: `${h}%`, opacity: 0.2 + (i * 0.1) }} />
                    ))}
                  </div>
  
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                     <Maximize2 className="w-4 h-4 text-ink-400 hover:text-tech-purple transition-colors" />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="back"
                  initial={{ opacity: 0, rotateX: 90 }} animate={{ opacity: 1, rotateX: 0 }} exit={{ opacity: 0 }}
                  className="h-full p-6 flex flex-col items-center justify-center text-center bg-slate-50"
                >
                  <Target className="w-8 h-8 text-tech-cyan mb-3" />
                  <div className="text-xs font-mono text-ink-500 mb-4 tracking-wide font-bold">DEEP DIVE ANALYSIS</div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeepDive(); }}
                    className="px-5 py-2.5 bg-white border border-slate-200 hover:border-tech-cyan/50 text-tech-cyan text-xs font-mono rounded-lg transition-all hover:shadow-md font-bold"
                  >
                    INITIALIZE
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassPane>
        );
  
      case WidgetType.SWOT_TACTICAL:
        const { strengths, weaknesses, opportunities, threats } = safeContent;
        return (
          <GlassPane className="h-full p-0 flex flex-col hover:border-tech-purple/30 transition-colors">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-2.5">
                 <div className="p-1.5 rounded-lg bg-tech-purple/10">
                    <Scale className="w-4 h-4 text-tech-purple" />
                 </div>
                 <h3 className="text-ink-900 text-sm font-semibold tracking-tight">{widget.title}</h3>
               </div>
               <div className="flex gap-1">
                  {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-slate-300" />)}
               </div>
            </div>
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-px bg-slate-200 border-collapse">
               {[
                 { title: "Strengths", items: strengths, color: "text-emerald-600", bg: "bg-white", icon: <Zap className="w-3 h-3" /> },
                 { title: "Weaknesses", items: weaknesses, color: "text-rose-600", bg: "bg-white", icon: <AlertTriangle className="w-3 h-3" /> },
                 { title: "Opportunities", items: opportunities, color: "text-tech-cyan", bg: "bg-white", icon: <Lightbulb className="w-3 h-3" /> },
                 { title: "Threats", items: threats, color: "text-tech-amber", bg: "bg-white", icon: <ShieldAlert className="w-3 h-3" /> },
               ].map((quad, idx) => (
                  <div key={idx} className={`p-4 ${quad.bg} overflow-y-auto custom-scrollbar group relative hover:bg-slate-50 transition-colors`}>
                     <div className={`text-[10px] font-mono uppercase tracking-widest mb-3 ${quad.color} flex items-center gap-2 opacity-80 group-hover:opacity-100 font-bold`}>
                       {quad.icon} {quad.title}
                     </div>
                     <ul className="space-y-2.5">
                       {Array.isArray(quad.items) && quad.items.map((item: any, i: number) => (
                         <li 
                           key={i} 
                           onClick={() => handleSwotDebate(safeRender(item), quad.title)}
                           className="text-[11px] text-ink-600 hover:text-ink-900 cursor-pointer leading-relaxed pl-2 border-l-2 border-slate-100 hover:border-tech-purple/50 transition-all"
                         >
                           {safeRender(item)}
                         </li>
                       ))}
                     </ul>
                  </div>
               ))}
            </div>
          </GlassPane>
        );
  
      case WidgetType.INVENTORY_TRACKER:
        const inventoryItems = Array.isArray(safeContent.items) ? safeContent.items : [];
        return (
           <GlassPane className="h-full p-6 flex flex-col hover:border-tech-purple/30 transition-colors">
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2.5">
                 <div className="p-1.5 rounded-lg bg-emerald-500/10">
                   <ShoppingBag className="w-4 h-4 text-emerald-500" />
                 </div>
                 <h3 className="text-ink-900 font-semibold text-sm tracking-tight">{widget.title}</h3>
               </div>
               <span className="text-[10px] text-ink-400 font-mono font-bold bg-slate-100 px-2 py-1 rounded">{inventoryItems.length} SKUs</span>
             </div>
             
             <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
               {inventoryItems.map((item: any, idx: number) => {
                 const stock = item.stockLevel || 0;
                 const isLow = item.status === 'Low' || stock < 30;
                 return (
                   <div key={idx} className="group p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all">
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-semibold text-ink-900">{safeRender(item.name)}</span>
                       <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${isLow ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                         {isLow ? 'RESTOCK' : 'HEALTHY'}
                       </span>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${Math.min(stock, 100)}%` }}
                           className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                         />
                       </div>
                       <span className="text-[10px] text-ink-500 font-mono w-8 text-right font-medium">{stock}%</span>
                     </div>
                   </div>
                 );
               })}
             </div>
           </GlassPane>
        );
  
      case WidgetType.SUBSCRIPTION_METRICS:
        return (
          <GlassPane className="h-full p-6 flex flex-col hover:border-tech-purple/30 transition-colors">
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2.5">
                 <div className="p-1.5 rounded-lg bg-tech-cyan/10">
                   <BarChart3 className="w-4 h-4 text-tech-cyan" />
                 </div>
                 <h3 className="text-ink-900 font-semibold text-sm tracking-tight">{widget.title}</h3>
               </div>
               <MoreVertical className="w-4 h-4 text-ink-300" />
             </div>
             
             <div className="grid grid-cols-2 gap-4 mb-4 flex-1">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div className="text-[10px] text-ink-400 font-mono uppercase tracking-wider mb-2 font-bold">MRR</div>
                  <div>
                    <div className="text-2xl font-bold text-ink-900 tracking-tight">{safeRender(safeContent.mrr)}</div>
                    <div className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1 bg-emerald-50 w-fit px-1.5 py-0.5 rounded font-medium"><TrendingUp className="w-2.5 h-2.5"/> {safeRender(safeContent.growth)}</div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div className="text-[10px] text-ink-400 font-mono uppercase tracking-wider mb-2 font-bold">Churn</div>
                  <div>
                    <div className="text-2xl font-bold text-ink-900 tracking-tight">{safeRender(safeContent.churn)}</div>
                    <div className="text-[10px] text-ink-400 mt-1 font-medium">vs last mo</div>
                  </div>
                </div>
             </div>
  
             <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
                <span className="text-[10px] text-indigo-400 font-mono uppercase font-bold">LTV Estimate</span>
                <span className="text-sm font-bold text-indigo-700 tracking-wide">{safeRender(safeContent.ltv)}</span>
             </div>
          </GlassPane>
        );
  
      case WidgetType.CLIENT_PIPELINE:
        const stages = Array.isArray(safeContent.stages) ? safeContent.stages : [];
        return (
          <GlassPane className="h-full p-6 hover:border-tech-purple/30 transition-colors">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-1.5 rounded-lg bg-tech-purple/10">
                <Users className="w-4 h-4 text-tech-purple" />
              </div>
              <h3 className="text-ink-900 font-semibold text-sm tracking-tight">{widget.title}</h3>
            </div>
            <div className="space-y-5">
               {stages.map((stage: any, idx: number) => (
                 <div key={idx} className="flex items-center gap-4 group">
                   <div className="w-20 text-[10px] font-mono text-ink-400 text-right uppercase tracking-wider font-bold group-hover:text-ink-600 transition-colors">{safeRender(stage.name)}</div>
                   <div className="flex-1 relative h-8">
                      {/* Background Track */}
                      <div className="absolute inset-0 bg-slate-100 rounded-md border border-slate-200" />
                      {/* Fill */}
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((stage.count || 0) * 10, 100)}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-tech-purple to-indigo-500 rounded-md opacity-80 group-hover:opacity-100 transition-all" 
                      />
                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex items-center justify-between px-3">
                         <span className="text-xs font-bold text-white relative z-10 drop-shadow-md">{safeRender(stage.count)}</span>
                         <span className="text-[10px] font-mono text-ink-500 relative z-10 bg-white/80 px-1 rounded backdrop-blur-sm">{safeRender(stage.value)}</span>
                      </div>
                   </div>
                 </div>
               ))}
            </div>
          </GlassPane>
        );
  
      case WidgetType.ALERT_PANEL:
        const severity = safeRender(safeContent.severity).toLowerCase();
        const isCritical = severity === 'high' || severity === 'critical';
        const themeColor = isCritical ? 'text-rose-700' : 'text-amber-700';
        const borderClass = isCritical ? 'border-rose-200' : 'border-amber-200';
        const bgClass = isCritical ? 'bg-rose-50' : 'bg-amber-50';
        
        return (
           <GlassPane className={`h-full p-6 flex flex-col justify-between border ${borderClass} ${bgClass}`} hoverEffect>
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-5 h-5 ${isCritical ? 'text-rose-600' : 'text-amber-600'} animate-pulse`} />
                    <span className={`text-xs font-mono uppercase tracking-widest font-bold ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>{isCritical ? 'CRITICAL ALERT' : 'WARNING'}</span>
                 </div>
                 <div className="text-[10px] text-ink-400 font-medium">{new Date().toLocaleTimeString()}</div>
              </div>
              
              <div className={`text-lg font-medium leading-relaxed ${themeColor}`}>
                 {safeRender(safeContent.message)}
              </div>
              
              <div className="flex gap-2 mt-4">
                 <button className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors shadow-sm ${isCritical ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-white'}`}>
                    Take Action
                 </button>
                 <button className="px-4 py-2 rounded-lg text-xs font-bold uppercase border border-slate-200 bg-white text-ink-500 hover:text-ink-900 transition-colors">
                    Dismiss
                 </button>
              </div>
           </GlassPane>
        );

      default:
        // Default generic renderer for unknown types
        return (
          <GlassPane className="h-full p-6 flex flex-col" hoverEffect>
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-ink-900 font-semibold">{widget.title}</h3>
               <span className="text-[9px] font-mono text-ink-400 bg-slate-100 px-2 py-1 rounded">{widget.type}</span>
             </div>
             <div className="flex-1 overflow-auto text-sm text-ink-600 font-mono bg-slate-50 p-4 rounded-xl border border-slate-200">
               <pre>{JSON.stringify(safeContent, null, 2)}</pre>
             </div>
          </GlassPane>
        );
    }
  };

  return (
    <div className="w-full h-full relative" style={{ gridArea: widget.gridArea }}>
      {renderUIEditor()}
      
      {/* UI Fix Trigger (Visible on Hover) */}
      <div className="absolute top-2 right-2 z-40 opacity-0 hover:opacity-100 transition-opacity">
         <button 
           onClick={(e) => { e.stopPropagation(); setIsEditingUI(true); }}
           className="p-1.5 bg-white hover:bg-tech-purple text-ink-400 hover:text-white rounded-lg shadow-sm border border-slate-200 transition-all"
           title="Fix/Edit UI with AI"
         >
            <Wand2 className="w-3 h-3" />
         </button>
      </div>

      {renderContent()}
    </div>
  );
};
