
import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Calendar, Send, Sparkles, Instagram, Linkedin, Twitter, Mail, Copy, Image as ImageIcon, RefreshCcw } from 'lucide-react';
import { generateMarketingCampaign } from '../../services/geminiService';
import { SearchVisualizer } from '../ui/SearchVisualizer';
import { MarketingChannel } from '../../types';

export const MarketingEngine: React.FC = () => {
  const { 
    context, 
    campaigns, 
    addCampaign, 
    isGeneratingCampaign, 
    setGeneratingCampaign 
  } = useAppStore();

  const [goalInput, setGoalInput] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context || !goalInput.trim()) return;
    
    setGeneratingCampaign(true);
    try {
      const campaign = await generateMarketingCampaign(context, goalInput);
      campaign.id = Math.random().toString();
      addCampaign(campaign);
      setSelectedCampaignId(campaign.id);
      setGoalInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingCampaign(false);
    }
  };

  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  if (isGeneratingCampaign) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <SearchVisualizer 
          query={`Neural Marketing Engine: ${goalInput}`} 
          steps={[
            "Analyzing audience demographics...",
            "Synthesizing creative strategy...",
            "Drafting high-conversion copy...",
            "Generating visual prompts...",
            "Scheduling multi-channel timeline..."
          ]} 
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6 p-6 overflow-hidden">
      
      {/* LEFT: CONTROL & HISTORY */}
      <GlassPane className="w-80 flex flex-col p-6 bg-slate-50/50 border-slate-200">
         <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-rose-50 rounded-lg">
               <Megaphone className="w-5 h-5 text-rose-500" />
            </div>
            <h2 className="font-bold tracking-wide text-ink-900">Neural CMO</h2>
         </div>

         <form onSubmit={handleCreateCampaign} className="mb-8">
            <label className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-2 block font-bold">New Campaign Goal</label>
            <div className="relative">
              <input 
                type="text" 
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. Black Friday Sale..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-100 transition-all pr-10 shadow-sm"
              />
              <button 
                type="submit"
                disabled={!goalInput.trim()}
                className="absolute right-2 top-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors disabled:opacity-0 shadow-md"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
         </form>

         <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ink-400 mb-4 font-bold">Campaign History</div>
            <div className="space-y-2">
              {campaigns.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCampaignId(c.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    activeCampaign?.id === c.id 
                    ? 'bg-white border-rose-200 text-ink-900 shadow-sm ring-1 ring-rose-100' 
                    : 'bg-transparent border-transparent text-ink-500 hover:bg-white hover:text-ink-900 hover:border-slate-200'
                  }`}
                >
                  <div className="text-sm font-bold truncate">{c.name}</div>
                  <div className="text-[10px] font-mono text-ink-400 truncate mt-1">{c.goal}</div>
                </button>
              ))}
              {campaigns.length === 0 && (
                <div className="text-center py-10 text-ink-300 text-xs italic bg-white rounded-xl border border-slate-100 border-dashed">
                  No campaigns generated yet.
                </div>
              )}
            </div>
         </div>
      </GlassPane>

      {/* RIGHT: CAMPAIGN DASHBOARD */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
         {activeCampaign ? (
           <>
             {/* HEADER */}
             <GlassPane className="p-6 shrink-0 bg-white border-slate-200 shadow-crisp">
                <div className="flex justify-between items-start">
                   <div>
                     <h1 className="text-2xl font-bold text-ink-900 mb-2">{activeCampaign.name}</h1>
                     <p className="text-ink-500 text-sm max-w-2xl leading-relaxed font-medium">{activeCampaign.strategySummary}</p>
                   </div>
                   <div className="px-3 py-1 bg-rose-50 border border-rose-100 text-rose-600 rounded-full text-xs font-mono uppercase tracking-wider font-bold">
                     Active Strategy
                   </div>
                </div>
             </GlassPane>

             {/* CONTENT GRID */}
             <div className="flex-1 overflow-y-auto custom-scrollbar">
                {(!activeCampaign.posts || activeCampaign.posts.length === 0) ? (
                   <div className="flex flex-col items-center justify-center h-64 text-ink-400 text-sm">
                      <Sparkles className="w-10 h-10 mb-4 opacity-50 text-rose-300" />
                      <p>Strategy generated, but post content is pending.</p>
                      <button className="mt-4 text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
                         <RefreshCcw className="w-3 h-3" /> Retry Generation
                      </button>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-20">
                      {activeCampaign.posts.map((post) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <GlassPane className="h-full p-0 flex flex-col group hover:border-tech-purple/30 transition-colors" hoverEffect>
                             {/* Card Header */}
                             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                   <ChannelIcon channel={post.channel} />
                                   <span className="text-xs font-bold text-ink-900">{post.channel}</span>
                                </div>
                                <span className="text-[10px] font-mono text-ink-400 uppercase font-bold bg-white px-2 py-1 rounded border border-slate-100">Week {post.week}</span>
                             </div>

                             {/* Content */}
                             <div className="p-6 flex-1 space-y-4 bg-white">
                                <div>
                                  <div className="text-[10px] text-ink-400 font-mono uppercase mb-2 font-bold">Copy Draft</div>
                                  <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap font-medium">
                                    {post.copy}
                                  </p>
                                </div>
                                
                                {post.hashtags && (
                                  <div className="flex flex-wrap gap-2">
                                    {post.hashtags.map(tag => (
                                      <span key={tag} className="text-xs text-tech-cyan font-semibold bg-cyan-50 px-2 py-0.5 rounded">{tag}</span>
                                    ))}
                                  </div>
                                )}

                                {/* Visual Prompt */}
                                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 group-hover:border-indigo-200 transition-colors">
                                   <div className="flex items-center gap-2 mb-1">
                                     <ImageIcon className="w-3 h-3 text-tech-purple" />
                                     <span className="text-[10px] text-tech-purple font-mono uppercase font-bold">Visual Prompt</span>
                                   </div>
                                   <p className="text-xs text-ink-600 italic leading-snug">
                                     "{post.visualPrompt}"
                                   </p>
                                </div>
                             </div>

                             {/* Footer */}
                             <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
                                <button className="text-xs text-ink-500 hover:text-ink-900 flex items-center gap-2 transition-colors font-medium">
                                  <Copy className="w-3 h-3" /> Copy Text
                                </button>
                                <button className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-ink-600 hover:text-rose-600 rounded-lg text-xs transition-all font-bold">
                                  Schedule Post
                                </button>
                             </div>
                          </GlassPane>
                        </motion.div>
                      ))}
                   </div>
                )}
             </div>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <Megaphone className="w-24 h-24 text-rose-200 mb-4" />
              <h3 className="text-xl text-ink-900 font-bold">Neural CMO Standby</h3>
              <p className="text-ink-500 max-w-sm mt-2">Enter a campaign goal to generate a multi-channel content strategy.</p>
           </div>
         )}
      </div>

    </div>
  );
};

const ChannelIcon: React.FC<{ channel: MarketingChannel }> = ({ channel }) => {
  switch (channel) {
    case 'LinkedIn': return <Linkedin className="w-4 h-4 text-blue-600" />;
    case 'Twitter': return <Twitter className="w-4 h-4 text-sky-500" />;
    case 'Instagram': return <Instagram className="w-4 h-4 text-pink-600" />;
    case 'Email': return <Mail className="w-4 h-4 text-yellow-500" />;
    default: return <Sparkles className="w-4 h-4 text-slate-400" />;
  }
};
