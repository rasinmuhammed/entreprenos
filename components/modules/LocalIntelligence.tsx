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
  
  // Board Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{sender: 'user'|'board', text: string}[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isEarth = themeMode === ThemeMode.EARTH;

  // --- ACTIONS ---

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

  // --- RENDERERS ---

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
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-glow relative ${isEarth ? 'bg-earth-accent/10' : 'bg-tech-cyan/10'}`}>
            <div className={`absolute inset-0 border rounded-full animate-ping opacity-20 ${isEarth ? 'border-earth-accent' : 'border-tech-cyan/30'}`} />
            <MapPin className={`w-12 h-12 ${isEarth ? 'text-earth-accent' : 'text-tech-cyan'}`} />
          </div>
          <h2 className={`text-3xl font-light mb-4 ${isEarth ? 'text-earth-900' : 'text-white'}`}>Geospatial Strategy Center</h2>
          <p className={`max-w-md mb-8 leading-relaxed ${isEarth ? 'text-earth-800/60' : 'text-white/40'}`}>
            Unlock the hidden potential of your location. EntreprenOS will scan {context?.location || 'Global'} for nearby hubs to generate leverage strategies.
          </p>
          <button 
            onClick={handleRunRadar}
            className={`px-8 py-4 rounded-xl font-medium tracking-wide flex items-center gap-3 transition-all hover:scale-105 shadow-xl ${isEarth ? 'bg-earth-accent text-white hover:bg-earth-secondary' : 'bg-tech-cyan text-nebula-950 hover:bg-cyan-400'}`}
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
          <GlassPane className="lg:col-span-2 p-8 relative overflow-hidden min-h-[400px]">
             {/* Background Effects */}
             <div className={`absolute inset-0 opacity-50 pointer-events-none ${isEarth ? 'bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.1)_0%,transparent_70%)]' : 'bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]'}`} />
             
             {/* Scanning Line */}
             <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                <div className={`w-full h-full animate-[spin_4s_linear_infinite] origin-center bg-gradient-to-r from-transparent via-transparent ${isEarth ? 'to-earth-accent/20' : 'to-tech-cyan/10'}`} style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }} />
             </div>
 
             {/* Entities Grid */}
             <div className="relative z-10 grid grid-cols-2 gap-4 h-full content-start">
                {locationAnalysis.nearbyEntities?.map((entity, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.2 }}
                      className={`backdrop-blur border p-4 rounded-xl transition-colors group ${isEarth ? 'bg-white/40 border-earth-800/10 hover:border-earth-accent/50' : 'bg-nebula-950/60 border-white/10 hover:border-tech-cyan/50'}`}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                             <Building2 className={`w-4 h-4 ${isEarth ? 'text-earth-800' : (entity.impactLevel === 'High' ? 'text-tech-cyan' : 'text-white/40')}`} />
                             <span className={`font-medium text-sm ${isEarth ? 'text-earth-900' : 'text-white'}`}>{entity.name}</span>
                          </div>
                          <span className={`text-[9px] font-mono ${isEarth ? 'text-earth-800/50' : 'text-white/40'}`}>{entity.distance}</span>
                       </div>
                       <div className={`text-xs mb-2 ${isEarth ? 'text-earth-800/70' : 'text-white/60'}`}>{entity.reasoning}</div>
                       <div className={`text-[9px] inline-block px-1.5 py-0.5 rounded font-mono uppercase ${
                          isEarth ? 'bg-earth-accent/10 text-earth-secondary' : (entity.impactLevel === 'High' ? 'bg-tech-cyan/10 text-tech-cyan' : 'bg-white/10 text-white/40')
                       }`}>
                          Impact: {entity.impactLevel}
                       </div>
                    </motion.div>
                  ))}
             </div>
          </GlassPane>
 
          {/* METRICS */}
          <div className="space-y-6">
             <GlassPane className={`p-6 ${isEarth ? 'bg-earth-accent/5 border-earth-accent/20' : 'bg-tech-cyan/5 border-tech-cyan/10'}`}>
                <div className="flex items-center gap-3 mb-2">
                   <Footprints className={`w-5 h-5 ${isEarth ? 'text-earth-accent' : 'text-tech-cyan'}`} />
                   <span className={`text-sm font-medium ${isEarth ? 'text-earth-secondary' : 'text-cyan-200'}`}>Foot Traffic Score</span>
                </div>
                <div className={`text-4xl font-light font-mono mb-2 ${isEarth ? 'text-earth-900' : 'text-white'}`}>
                   {locationAnalysis.footTrafficScore}<span className={`text-base ${isEarth ? 'text-earth-800/40' : 'text-white/30'}`}>/100</span>
                </div>
                <div className={`w-full h-1 rounded-full overflow-hidden ${isEarth ? 'bg-earth-800/10' : 'bg-white/10'}`}>
                   <div className={`h-full ${isEarth ? 'bg-earth-accent' : 'bg-tech-cyan'}`} style={{ width: `${locationAnalysis.footTrafficScore}%` }} />
                </div>
             </GlassPane>
 
             <GlassPane className="p-6">
                <div className="flex items-center gap-3 mb-4">
                   <Navigation className="w-5 h-5 text-purple-400" />
                   <span className={`text-sm font-medium ${isEarth ? 'text-earth-900' : 'text-purple-200'}`}>Strategic Analysis</span>
                </div>
                <p className={`text-sm leading-relaxed ${isEarth ? 'text-earth-800/80' : 'text-white/60'}`}>
                   {locationAnalysis.summary}
                </p>
             </GlassPane>
          </div>
        </div>

        {/* STRATEGIES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {locationAnalysis.strategies?.map((strategy, idx) => (
             <GlassPane key={idx} className="p-6 hover:border-opacity-50 transition-colors" hoverEffect>
                <div className="flex items-start justify-between mb-4">
                   <div className={`p-2 rounded-lg ${isEarth ? 'bg-earth-accent/10' : 'bg-tech-amber/10'}`}>
                      <Lightbulb className={`w-5 h-5 ${isEarth ? 'text-earth-accent' : 'text-tech-amber'}`} />
                   </div>
                   <span className={`text-[9px] font-mono uppercase tracking-wider border px-2 py-1 rounded ${isEarth ? 'border-earth-800/20 text-earth-800/60' : 'border-white/10 text-white/30'}`}>
                      Target: {strategy.targetAudience}
                   </span>
                </div>
                <h4 className={`font-medium mb-2 ${isEarth ? 'text-earth-900' : 'text-white'}`}>{strategy.title}</h4>
                <p className={`text-sm leading-relaxed ${isEarth ? 'text-earth-800/70' : 'text-white/60'}`}>{strategy.description}</p>
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
             <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4 ${isEarth ? 'border-earth-accent' : 'border-tech-cyan'}`} />
             <div className={`font-mono animate-pulse ${isEarth ? 'text-earth-800' : 'text-white/60'}`}>Syncing with Google Maps...</div>
          </div>
        </div>
      );
    }

    if (!reviewsData) {
       return (
         <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <MessageSquare className={`w-16 h-16 mb-4 ${isEarth ? 'text-earth-800/20' : 'text-white/20'}`} />
            <h3 className={`text-xl font-light mb-2 ${isEarth ? 'text-earth-900' : 'text-white'}`}>Reputation Management</h3>
            <p className={`max-w-md mb-6 ${isEarth ? 'text-earth-800/60' : 'text-white/40'}`}>
               Analyze recent reviews, detect sentiment patterns, and draft AI responses to improve your Google rating.
            </p>
            <button 
              onClick={handleRunReviews}
              className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-transform hover:scale-105 ${isEarth ? 'bg-earth-900 text-white' : 'bg-white text-black'}`}
            >
               <RefreshCw className="w-4 h-4" /> Sync Reviews
            </button>
         </div>
       );
    }

    return (
       <div className="h-full flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-6">
             <GlassPane className="p-6 flex flex-col items-center justify-center text-center">
                <div className={`text-4xl font-bold mb-1 ${isEarth ? 'text-earth-900' : 'text-white'}`}>{reviewsData.averageRating}</div>
                <div className="flex gap-1 mb-2">
                   {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= Math.round(reviewsData.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                   ))}
                </div>
                <div className={`text-xs uppercase font-mono ${isEarth ? 'text-earth-800/50' : 'text-white/40'}`}>Average Rating</div>
             </GlassPane>
             <GlassPane className="col-span-2 p-6">
                <h3 className={`text-sm font-medium mb-2 ${isEarth ? 'text-earth-900' : 'text-white'}`}>Sentiment Summary</h3>
                <p className={`text-sm leading-relaxed mb-4 ${isEarth ? 'text-earth-800/80' : 'text-white/70'}`}>
                   "{reviewsData.summary}"
                </p>
                
                <div className="flex gap-6 mt-4 pt-4 border-t border-white/5">
                   {/* COMMON THEMES */}
                   {reviewsData.commonThemes && reviewsData.commonThemes.length > 0 && (
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <Tag className={`w-4 h-4 ${isEarth ? 'text-teal-600' : 'text-tech-cyan'}`} />
                           <h4 className={`text-xs font-mono uppercase tracking-wider ${isEarth ? 'text-earth-800/60' : 'text-white/40'}`}>Common Themes</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {reviewsData.commonThemes.map((theme: string, i: number) => (
                            <span key={i} className={`text-xs px-2 py-1 rounded border ${isEarth ? 'bg-teal-500/10 border-teal-500/20 text-teal-700' : 'bg-tech-cyan/10 border-tech-cyan/20 text-cyan-300'}`}>
                              {theme}
                            </span>
                          ))}
                        </div>
                     </div>
                   )}

                   {/* AREAS FOR IMPROVEMENT */}
                   {reviewsData.areasForImprovement && reviewsData.areasForImprovement.length > 0 && (
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <TrendingUp className={`w-4 h-4 ${isEarth ? 'text-rose-600' : 'text-rose-400'}`} />
                           <h4 className={`text-xs font-mono uppercase tracking-wider ${isEarth ? 'text-earth-800/60' : 'text-white/40'}`}>Areas for Improvement</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {reviewsData.areasForImprovement.map((area: string, i: number) => (
                            <span key={i} className={`text-xs px-2 py-1 rounded border ${isEarth ? 'bg-rose-500/10 border-rose-500/20 text-rose-700' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
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
                <GlassPane key={idx} className="p-4" hoverEffect>
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isEarth ? 'bg-earth-200 text-earth-900' : 'bg-white/10 text-white'}`}>
                            {review.author[0]}
                         </div>
                         <div>
                            <div className={`text-sm font-medium ${isEarth ? 'text-earth-900' : 'text-white'}`}>{review.author}</div>
                            <div className="flex text-yellow-400 w-16">
                               {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                            </div>
                         </div>
                      </div>
                      <div className={`text-xs ${isEarth ? 'text-earth-800/40' : 'text-white/30'}`}>{review.date}</div>
                   </div>
                   <p className={`text-sm mt-2 mb-3 pl-10 ${isEarth ? 'text-earth-800/80' : 'text-white/70'}`}>
                      "{review.text}"
                   </p>
                   <div className="pl-10 flex gap-2">
                      <button className={`text-xs px-3 py-1 rounded border transition-colors ${isEarth ? 'border-earth-200 text-earth-800 hover:bg-earth-100' : 'border-white/10 text-white/50 hover:bg-white/5'}`}>
                         Suggest Reply
                      </button>
                      <button className={`text-xs px-3 py-1 rounded border transition-colors ${isEarth ? 'border-earth-200 text-earth-800 hover:bg-earth-100' : 'border-white/10 text-white/50 hover:bg-white/5'}`}>
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
      <div className="h-full flex flex-col relative">
         <div className={`p-4 rounded-xl mb-4 border flex items-center gap-3 ${isEarth ? 'bg-earth-100 border-earth-200' : 'bg-white/5 border-white/10'}`}>
            <Store className={`w-6 h-6 ${isEarth ? 'text-earth-accent' : 'text-tech-purple'}`} />
            <div>
               <h3 className={`text-sm font-bold ${isEarth ? 'text-earth-900' : 'text-white'}`}>Shop Council</h3>
               <p className={`text-xs ${isEarth ? 'text-earth-800/60' : 'text-white/40'}`}>
                  Local veterans advising on "{context?.businessName}"
               </p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 px-2 pb-4">
            {chatHistory.length === 0 && (
               <div className={`text-center py-10 opacity-50 ${isEarth ? 'text-earth-800' : 'text-white'}`}>
                  Ask about foot traffic, pricing, or local gossip.
               </div>
            )}
            {chatHistory.map((msg, i) => (
               <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                     msg.sender === 'user' 
                        ? (isEarth ? 'bg-earth-900 text-white rounded-tr-none' : 'bg-white text-nebula-950 rounded-tr-none')
                        : (isEarth ? 'bg-white border border-earth-200 text-earth-900 rounded-tl-none' : 'bg-white/10 text-white rounded-tl-none')
                  }`}>
                     {msg.text}
                  </div>
               </div>
            ))}
            {isChatting && (
               <div className="flex justify-start">
                  <div className={`p-4 rounded-2xl rounded-tl-none text-sm ${isEarth ? 'bg-white border border-earth-200' : 'bg-white/10'}`}>
                     <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce delay-200" />
                     </div>
                  </div>
               </div>
            )}
            <div ref={chatEndRef} />
         </div>

         <form onSubmit={handleBoardChat} className="mt-4 relative">
            <input 
               value={chatInput}
               onChange={(e) => setChatInput(e.target.value)}
               placeholder="Ask the board..."
               className={`w-full p-4 pr-12 rounded-xl border focus:outline-none transition-all ${
                  isEarth 
                     ? 'bg-white border-earth-200 text-earth-900 focus:border-earth-accent placeholder-earth-800/30' 
                     : 'bg-white/5 border-white/10 text-white focus:border-tech-purple placeholder-white/20'
               }`}
            />
            <button 
               type="submit" 
               disabled={!chatInput.trim() || isChatting}
               className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${
                  isEarth 
                     ? 'text-earth-accent hover:bg-earth-100 disabled:opacity-30' 
                     : 'text-tech-purple hover:bg-white/10 disabled:opacity-30'
               }`}
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
            <h2 className={`text-2xl font-light flex items-center gap-3 ${isEarth ? 'text-earth-900' : 'text-white'}`}>
               <Map className={`w-6 h-6 ${isEarth ? 'text-earth-accent' : 'text-tech-cyan'}`} />
               Local Intelligence
               <span className={`text-xs font-mono px-2 py-1 rounded uppercase ${isEarth ? 'bg-earth-200 text-earth-800' : 'bg-white/5 text-white/40'}`}>
                  {context?.location || 'Global'}
               </span>
            </h2>
            <p className={`text-sm mt-1 ml-9 ${isEarth ? 'text-earth-800/60' : 'text-white/40'}`}>
               Geospatial Leverage & Reputation Management
            </p>
          </div>
          
          <div className={`flex p-1 rounded-xl ${isEarth ? 'bg-earth-200' : 'bg-white/5'}`}>
             {[
               { id: 'RADAR', icon: Radar, label: 'Radar Scan' },
               { id: 'REVIEWS', icon: Star, label: 'Reviews' },
               { id: 'BOARD', icon: Users, label: 'Shop Board' },
             ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                     activeTab === tab.id 
                        ? (isEarth ? 'bg-white text-earth-900 shadow-sm' : 'bg-white/10 text-white shadow-inner-light')
                        : (isEarth ? 'text-earth-800/60 hover:text-earth-900' : 'text-white/40 hover:text-white')
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