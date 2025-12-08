
import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Calendar, Send, Sparkles, Instagram, Linkedin, Twitter, Mail, Copy, Image as ImageIcon } from 'lucide-react';
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
      <GlassPane className="w-80 flex flex-col p-6 bg-nebula-900/40">
         <div className="flex items-center gap-2 mb-6">
            <Megaphone className="w-5 h-5 text-tech-rose" />
            <h2 className="font-light tracking-wide text-white">Neural CMO</h2>
         </div>

         <form onSubmit={handleCreateCampaign} className="mb-8">
            <label className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2 block">New Campaign Goal</label>
            <div className="relative">
              <input 
                type="text" 
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. Black Friday Sale, Series A Announcement..."
                className="w-full bg-nebula-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-tech-rose/50 pr-10"
              />
              <button 
                type="submit"
                disabled={!goalInput.trim()}
                className="absolute right-2 top-2 p-1.5 bg-tech-rose/20 hover:bg-tech-rose text-tech-rose hover:text-white rounded-lg transition-colors disabled:opacity-0"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
         </form>

         <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-mono uppercase tracking-wider text-white/30 mb-4">Campaign History</div>
            <div className="space-y-2">
              {campaigns.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCampaignId(c.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    activeCampaign?.id === c.id 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-transparent border-transparent text-white/40 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-[10px] font-mono opacity-50 truncate">{c.goal}</div>
                </button>
              ))}
              {campaigns.length === 0 && (
                <div className="text-center py-10 text-white/20 text-xs italic">
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
             <GlassPane className="p-6 shrink-0 bg-gradient-to-r from-tech-rose/10 to-transparent">
                <div className="flex justify-between items-start">
                   <div>
                     <h1 className="text-2xl font-light text-white mb-2">{activeCampaign.name}</h1>
                     <p className="text-white/60 text-sm max-w-2xl leading-relaxed">{activeCampaign.strategySummary}</p>
                   </div>
                   <div className="px-3 py-1 bg-tech-rose/20 border border-tech-rose/30 text-tech-rose rounded-full text-xs font-mono uppercase tracking-wider">
                     Active Strategy
                   </div>
                </div>
             </GlassPane>

             {/* CONTENT GRID */}
             <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-20">
                   {activeCampaign.posts?.map((post) => (
                     <motion.div
                       key={post.id}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                     >
                       <GlassPane className="h-full p-0 flex flex-col group hover:border-white/20 transition-colors">
                          {/* Card Header */}
                          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                             <div className="flex items-center gap-2">
                                <ChannelIcon channel={post.channel} />
                                <span className="text-xs font-medium text-white">{post.channel}</span>
                             </div>
                             <span className="text-[10px] font-mono text-white/30 uppercase">Week {post.week}</span>
                          </div>

                          {/* Content */}
                          <div className="p-6 flex-1 space-y-4">
                             <div>
                               <div className="text-[10px] text-white/30 font-mono uppercase mb-2">Copy Draft</div>
                               <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-light">
                                 {post.copy}
                               </p>
                             </div>
                             
                             {post.hashtags && (
                               <div className="flex flex-wrap gap-2">
                                 {post.hashtags.map(tag => (
                                   <span key={tag} className="text-xs text-tech-cyan/80">{tag}</span>
                                 ))}
                               </div>
                             )}

                             {/* Visual Prompt */}
                             <div className="p-3 bg-nebula-950/50 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                  <ImageIcon className="w-3 h-3 text-tech-purple" />
                                  <span className="text-[10px] text-tech-purple font-mono uppercase">Visual Generator Prompt</span>
                                </div>
                                <p className="text-xs text-white/50 italic leading-snug">
                                  "{post.visualPrompt}"
                                </p>
                             </div>
                          </div>

                          {/* Footer */}
                          <div className="p-4 border-t border-white/5 flex justify-between items-center">
                             <button className="text-xs text-white/40 hover:text-white flex items-center gap-2 transition-colors">
                               <Copy className="w-3 h-3" /> Copy Text
                             </button>
                             <button className="px-3 py-1.5 bg-white/5 hover:bg-tech-rose hover:text-white text-white/60 rounded-lg text-xs transition-all">
                               Schedule Post
                             </button>
                          </div>
                       </GlassPane>
                     </motion.div>
                   ))}
                </div>
             </div>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <Megaphone className="w-24 h-24 text-tech-rose/20 mb-4" />
              <h3 className="text-xl text-white font-light">Neural CMO Standby</h3>
              <p className="text-white/40 max-w-sm mt-2">Enter a campaign goal to generate a multi-channel content strategy.</p>
           </div>
         )}
      </div>

    </div>
  );
};

const ChannelIcon: React.FC<{ channel: MarketingChannel }> = ({ channel }) => {
  switch (channel) {
    case 'LinkedIn': return <Linkedin className="w-4 h-4 text-blue-400" />;
    case 'Twitter': return <Twitter className="w-4 h-4 text-sky-400" />;
    case 'Instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
    case 'Email': return <Mail className="w-4 h-4 text-yellow-400" />;
    default: return <Sparkles className="w-4 h-4 text-gray-400" />;
  }
};
