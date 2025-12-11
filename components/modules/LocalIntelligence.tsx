
import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Navigation, MapPin, Building2, Footprints, Lightbulb, Radar, Scan, Zap, AlertTriangle, MessageSquare, Star, Users, Send, RefreshCw, ThumbsUp, ThumbsDown, Store, TrendingUp, Tag } from 'lucide-react';
import { analyzeLocationLeverage, analyzeGoogleReviews, chatWithShopBoard } from '../../services/geminiService';
import { SearchVisualizer } from '../ui/SearchVisualizer';
import { ThemeMode } from '../../types';

type Tab = 'RADAR' | 'REVIEWS' | 'BOARD';

export const LocalIntelligence: React.FC = () => {
  const { 
    context, 
    locationAnalysis, 
    setLocationAnalysis, 
    isAnalyzingLocation, 
    setAnalyzingLocation,
    themeMode
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<Tab>('RADAR');
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [isAnalyzingReviews, setIsAnalyzingReviews] = useState(false);
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{sender: 'user'|'board', text: string}[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleRunRadar = async () => {
    if (!context) return;
    setAnalyzingLocation(true);
    try {
      const result = await analyzeLocationLeverage(context);
      setLocationAnalysis(result);
    } catch (e) { console.error(e); } finally { setAnalyzingLocation(false); }
  };

  const handleRunReviews = async () => {
    if (!context) return;
    setIsAnalyzingReviews(true);
    try {
      const result = await analyzeGoogleReviews(context);
      setReviewsData(result);
    } catch (e) { console.error(e); } finally { setIsAnalyzingReviews(false); }
  };

  const handleBoardChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !context) return;
    
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatting(true);

    try {
      const response = await chatWithShopBoard(userMsg, context, chatHistory);
      setChatHistory(prev => [...prev, { sender: 'board', text: response }]);
    } catch (e) {
       console.error(e);
    } finally {
       setIsChatting(false);
       chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderRadar = () => {
    if (isAnalyzingLocation) {
      return (
        <div className="h-full flex items-center justify-center p-12">
          <SearchVisualizer 
            query={`Geospatial Scan: ${context?.location}`} 
            steps={[
              "Triangulating physical coordinates...",
              "Identifying nearby traffic magnets...",
              "Analyzing pedestrian vectors...",
              "Calculating proximity leverage scores...",
              "Formulating hyper-local strategies..."
            ]} 
          />
        </div>
      );
    }

    if (!locationAnalysis) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl relative bg-white border border-slate-100">
            <div className="absolute inset-0 border-2 border-tech-purple/20 rounded-full animate-ping opacity-50" />
            <MapPin className="w-12 h-12 text-tech-purple" />
          </div>
          <h2 className="text-3xl font-bold text-ink-950 mb-4 tracking-tight">Geospatial Strategy Center</h2>
          <p className="max-w-md mb-8 leading-relaxed text-ink-500">
            Unlock the hidden potential of your location. EntreprenOS will scan {context?.location || 'Global'} for nearby hubs to generate leverage strategies.
          </p>
          <button 
            onClick={handleRunRadar}
            className="px-8 py-4 rounded-xl font-bold tracking-wide flex items-center gap-3 transition-all hover:scale-105 shadow-lg bg-tech-purple text-white hover:bg-indigo-600"
          >
            <Radar className="w-5 h-5" />
            Initiate Radar Scan
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RADAR VISUALIZATION */}
          <GlassPane className="lg:col-span-2 p-8 relative overflow-hidden min-h-[400px] border-slate-200">
             {/* Map Grid Background */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-100 pointer-events-none" />
             
             {/* Scanning Line */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full animate-[spin_4s_linear_infinite] origin-center bg-gradient-to-r from-transparent via-transparent to-tech-purple/10" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }} />
             </div>
 
             {/* Entities Grid */}
             <div className="relative z-10 grid grid-cols-2 gap-4 h-full content-start">
                {locationAnalysis.nearbyEntities?.map((entity, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.2 }}
                      className="backdrop-blur-sm border p-4 rounded-xl transition-colors group bg-white/80 border-slate-200 hover:border-tech-purple/50 shadow-sm hover:shadow-md"
                    >
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                             <div className={`p-1.5 rounded-lg ${entity.impactLevel === 'High' ? 'bg-tech-purple/10 text-tech-purple' : 'bg-slate-100 text-slate-500'}`}>
                                <Building2 className="w-4 h-4" />
                             </div>
                             <span className="font-bold text-sm text-ink-900">{entity.name}</span>
                          </div>
                          <span className="text-[10px] font-mono font-medium text-ink-400 bg-slate-50 px-2 py-1 rounded">{entity.distance}</span>
                       </div>
                       <div className="text-xs mb-3 text-ink-600 leading-snug">{entity.reasoning}</div>
                       <div className={`text-[9px] inline-block px-2 py-1 rounded font-bold uppercase tracking-wide ${
                          entity.impactLevel === 'High' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                       }`}>
                          Impact: {entity.impactLevel}
                       </div>
                    </motion.div>
                  ))}
             </div>
          </GlassPane>
 
          {/* METRICS */}
          <div className="space-y-6">
             <GlassPane className="p-6 bg-white border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-indigo-50 rounded-lg">
                      <Footprints className="w-5 h-5 text-tech-purple" />
                   </div>
                   <span className="text-sm font-bold text-ink-900">Foot Traffic Score</span>
                </div>
                <div className="text-5xl font-bold font-mono mb-4 text-ink-950 tracking-tighter">
                   {locationAnalysis.footTrafficScore}<span className="text-xl text-ink-300 font-light">/100</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100">
                   <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${locationAnalysis.footTrafficScore}%` }} />
                </div>
             </GlassPane>
 
             <GlassPane className="p-6 bg-slate-50 border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                   <Navigation className="w-5 h-5 text-tech-cyan" />
                   <span className="text-sm font-bold text-ink-900">Strategic Analysis</span>
                </div>
                <p className="text-sm leading-relaxed text-ink-600 font-medium">
                   {locationAnalysis.summary}
                </p>
             </GlassPane>
          </div>
        </div>

        {/* STRATEGIES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {locationAnalysis.strategies?.map((strategy, idx) => (
             <GlassPane key={idx} className="p-6 hover:border-tech-purple/30 transition-colors" hoverEffect>
                <div className="flex items-start justify-between mb-4">
                   <div className="p-2 rounded-lg bg-amber-50">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                   </div>
                   <span className="text-[9px] font-bold uppercase tracking-wider border px-2 py-1 rounded bg-white border-slate-100 text-ink-400">
                      Target: {strategy.targetAudience}
                   </span>
                </div>
                <h4 className="font-bold mb-2 text-ink-900 text-sm">{strategy.title}</h4>
                <p className="text-sm leading-relaxed text-ink-500">{strategy.description}</p>
             </GlassPane>
           ))}
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    if (isAnalyzingReviews) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center">
             <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4 border-tech-purple" />
             <div className="font-mono animate-pulse text-ink-500 font-bold uppercase">Syncing with Google Maps...</div>
          </div>
        </div>
      );
    }

    if (!reviewsData) {
       return (
         <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
               <MessageSquare className="w-10 h-10 text-ink-300" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-ink-900">Reputation Management</h3>
            <p className="max-w-md mb-8 text-ink-500">
               Analyze recent reviews, detect sentiment patterns, and draft AI responses to improve your Google rating.
            </p>
            <button 
              onClick={handleRunReviews}
              className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105 bg-white border border-slate-200 shadow-sm hover:shadow-md text-ink-900"
            >
               <RefreshCw className="w-4 h-4" /> Sync Reviews
            </button>
         </div>
       );
    }

    return (
       <div className="h-full flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-6">
             <GlassPane className="p-6 flex flex-col items-center justify-center text-center bg-white border-slate-200">
                <div className="text-5xl font-bold mb-2 text-ink-900 tracking-tighter">{reviewsData.averageRating}</div>
                <div className="flex gap-1 mb-3">
                   {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-5 h-5 ${i <= Math.round(reviewsData.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                   ))}
                </div>
                <div className="text-xs uppercase font-bold tracking-widest text-ink-400">Average Rating</div>
             </GlassPane>
             <GlassPane className="col-span-2 p-6 bg-slate-50 border-slate-200">
                <h3 className="text-sm font-bold mb-3 text-ink-900 uppercase tracking-wide">Sentiment Summary</h3>
                <p className="text-sm leading-relaxed mb-6 text-ink-600">
                   "{reviewsData.summary}"
                </p>
                
                <div className="flex gap-6 mt-4 pt-4 border-t border-slate-200">
                   {/* COMMON THEMES */}
                   {reviewsData.commonThemes && reviewsData.commonThemes.length > 0 && (
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                           <Tag className="w-4 h-4 text-tech-cyan" />
                           <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400">Common Themes</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {reviewsData.commonThemes.map((theme: string, i: number) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-md border bg-white border-slate-200 text-ink-600 font-medium shadow-sm">
                              {theme}
                            </span>
                          ))}
                        </div>
                     </div>
                   )}

                   {/* AREAS FOR IMPROVEMENT */}
                   {reviewsData.areasForImprovement && reviewsData.areasForImprovement.length > 0 && (
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                           <TrendingUp className="w-4 h-4 text-rose-500" />
                           <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400">To Improve</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {reviewsData.areasForImprovement.map((area: string, i: number) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-md border bg-rose-50 border-rose-100 text-rose-700 font-medium">
                              {area}
                            </span>
                          ))}
                        </div>
                     </div>
                   )}
                </div>
             </GlassPane>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
             {reviewsData.reviews?.map((review: any, idx: number) => (
                <GlassPane key={idx} className="p-5" hoverEffect>
                   <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold bg-slate-100 text-ink-600 text-sm">
                            {review.author[0]}
                         </div>
                         <div>
                            <div className="text-sm font-bold text-ink-900">{review.author}</div>
                            <div className="flex text-amber-400 w-20">
                               {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                            </div>
                         </div>
                      </div>
                      <div className="text-xs text-ink-400 font-medium">{review.date}</div>
                   </div>
                   <p className="text-sm mt-2 mb-4 pl-12 text-ink-600 leading-relaxed">
                      "{review.text}"
                   </p>
                   <div className="pl-12 flex gap-2">
                      <button className="text-xs px-3 py-1.5 rounded border border-slate-200 text-ink-600 hover:bg-slate-50 font-medium transition-colors">
                         Suggest Reply
                      </button>
                      <button className="text-xs px-3 py-1.5 rounded border border-slate-200 text-ink-400 hover:bg-slate-50 hover:text-ink-600 font-medium transition-colors">
                         Ignore
                      </button>
                   </div>
                </GlassPane>
             ))}
          </div>
       </div>
    );
  };

  const renderBoard = () => {
    return (
      <div className="h-full flex flex-col relative bg-white rounded-2xl border border-slate-200 overflow-hidden">
         <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className="p-2 bg-purple-100 rounded-lg">
               <Store className="w-5 h-5 text-purple-600" />
            </div>
            <div>
               <h3 className="text-sm font-bold text-ink-900">Shop Council</h3>
               <p className="text-xs text-ink-500">Local veterans advising on "{context?.businessName}"</p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 px-4 py-6">
            {chatHistory.length === 0 && (
               <div className="text-center py-20 opacity-50">
                  <p className="text-ink-400 text-sm font-medium">Ask about foot traffic, pricing, or local gossip.</p>
               </div>
            )}
            {chatHistory.map((msg, i) => (
               <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                     msg.sender === 'user' 
                        ? 'bg-tech-purple text-white rounded-tr-none'
                        : 'bg-slate-50 border border-slate-200 text-ink-700 rounded-tl-none'
                  }`}>
                     {msg.text}
                  </div>
               </div>
            ))}
            {isChatting && (
               <div className="flex justify-start">
                  <div className="p-4 rounded-2xl rounded-tl-none text-sm bg-slate-50 border border-slate-200">
                     <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 bg-ink-400 rounded-full animate-bounce delay-200" />
                     </div>
                  </div>
               </div>
            )}
            <div ref={chatEndRef} />
         </div>

         <form onSubmit={handleBoardChat} className="p-4 bg-white border-t border-slate-200 relative">
            <input 
               value={chatInput}
               onChange={(e) => setChatInput(e.target.value)}
               placeholder="Ask the board..."
               className="w-full p-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-tech-purple focus:ring-1 focus:ring-tech-purple/20 transition-all text-ink-900 placeholder-ink-400"
            />
            <button 
               type="submit" 
               disabled={!chatInput.trim() || isChatting}
               className="absolute right-6 top-6 text-tech-purple hover:text-indigo-600 disabled:opacity-30 transition-colors"
            >
               <Send className="w-5 h-5" />
            </button>
         </form>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden flex flex-col p-6">
       {/* HEADER & TABS */}
       <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 shrink-0">
          <div>
            <h2 className="text-2xl font-light flex items-center gap-3 text-ink-900 tracking-tight">
               <Map className="w-6 h-6 text-tech-purple" />
               Local Intelligence
               <span className="text-xs font-bold font-mono px-2 py-1 rounded uppercase bg-slate-100 text-ink-500 border border-slate-200">
                  {context?.location || 'Global'}
               </span>
            </h2>
            <p className="text-sm mt-1 ml-9 text-ink-500">
               Geospatial Leverage & Reputation Management
            </p>
          </div>
          
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200">
             {[
               { id: 'RADAR', icon: Radar, label: 'Radar Scan' },
               { id: 'REVIEWS', icon: Star, label: 'Reviews' },
               { id: 'BOARD', icon: Users, label: 'Shop Board' },
             ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                     activeTab === tab.id 
                        ? 'bg-white text-ink-900 shadow-sm'
                        : 'text-ink-400 hover:text-ink-600'
                  }`}
                >
                   <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
             ))}
          </div>
       </div>

       {/* CONTENT AREA */}
       <div className="flex-1 overflow-hidden">
          {activeTab === 'RADAR' && <div className="h-full overflow-y-auto custom-scrollbar">{renderRadar()}</div>}
          {activeTab === 'REVIEWS' && <div className="h-full overflow-y-auto custom-scrollbar">{renderReviews()}</div>}
          {activeTab === 'BOARD' && <div className="h-full">{renderBoard()}</div>}
       </div>
    </div>
  );
};
