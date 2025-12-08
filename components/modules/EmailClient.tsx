
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Search, Inbox, Star, Archive, Send, Loader2, Sparkles, Check, ChevronRight } from 'lucide-react';
import { analyzeInbox, generateEmailReply } from '../../services/geminiService';
import { AccessibilityMode } from '../../types';

export const EmailClient: React.FC = () => {
  const { 
    emails, setEmails, 
    isProcessingEmails, setProcessingEmails, 
    selectedEmailId, setSelectedEmailId,
    markEmailRead, archiveEmail,
    context, accessibilityMode
  } = useAppStore();

  const [draftReply, setDraftReply] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [activeTab, setActiveTab] = useState<'Inbox' | 'Archived'>('Inbox');

  useEffect(() => {
    if (emails.length === 0 && !isProcessingEmails && context) {
      loadEmails();
    }
  }, []);

  const loadEmails = async () => {
    if (!context) return;
    setProcessingEmails(true);
    try {
      const fetchedEmails = await analyzeInbox(context);
      setEmails(fetchedEmails);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingEmails(false);
    }
  };

  const handleSelectEmail = async (id: string) => {
    setSelectedEmailId(id);
    markEmailRead(id);
    setDraftReply(''); // Reset
    
    // Auto-draft if feature enabled or in a "Speed Mode"
    // For now, let's auto-draft only if it has a suggested reply from the first pass
    const email = emails.find(e => e.id === id);
    if (email?.suggestedReply) {
       setDraftReply(email.suggestedReply);
    }
  };

  const handleGenerateFullReply = async (tone: 'Professional' | 'Casual' | 'Direct') => {
    const email = emails.find(e => e.id === selectedEmailId);
    if (!email || !context) return;
    
    setIsDrafting(true);
    try {
      const reply = await generateEmailReply(email, context, tone);
      setDraftReply(reply);
    } catch(e) { console.error(e) } finally { setIsDrafting(false); }
  };

  const handleSend = () => {
     if (selectedEmailId) {
        archiveEmail(selectedEmailId); // Simulate sending by archiving
        setSelectedEmailId(null);
     }
  };

  const isFocusMode = accessibilityMode === AccessibilityMode.FOCUS_SHIELD;

  // --- FOCUS MODE RENDERER (Single Card Stack) ---
  if (isFocusMode) {
    const activeEmail = emails.find(e => !e.isRead) || emails[0]; // Just show first unread or first
    
    if (!activeEmail) return (
       <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
             <Check className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Inbox Zero</h2>
          <p className="text-zinc-500">You are caught up.</p>
       </div>
    );

    return (
       <div className="h-full flex flex-col items-center justify-center p-8 max-w-3xl mx-auto">
          <div className="w-full mb-6 flex justify-between items-center text-zinc-500 font-mono text-sm uppercase">
             <span>Focus Inbox</span>
             <span>{emails.length} Remaining</span>
          </div>

          <motion.div 
             key={activeEmail.id}
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
             
             <div className="flex justify-between items-start mb-8">
                <div>
                   <h1 className="text-3xl font-bold text-white mb-2">{activeEmail.subject}</h1>
                   <div className="text-lg text-zinc-400">{activeEmail.sender}</div>
                </div>
                <div className={`px-4 py-2 rounded-full font-mono text-sm uppercase ${activeEmail.priority === 'High' ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                   {activeEmail.priority} Priority
                </div>
             </div>

             <div className="p-6 bg-black rounded-2xl border border-zinc-800 mb-8">
                <div className="text-zinc-500 text-xs font-mono uppercase mb-2">AI Summary</div>
                <p className="text-xl text-white leading-relaxed">{activeEmail.aiSummary}</p>
             </div>

             <div className="flex gap-4">
                <button onClick={() => archiveEmail(activeEmail.id)} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">
                   Archive & Next
                </button>
                <button onClick={() => {/* Open full reply modal */}} className="flex-1 py-4 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold transition-colors">
                   Reply
                </button>
             </div>
          </motion.div>
       </div>
    );
  }

  // --- STANDARD MODE RENDERER ---
  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6 p-6">
      
      {/* SIDEBAR: EMAIL LIST */}
      <GlassPane className="w-96 flex flex-col p-0 overflow-hidden bg-nebula-900/40">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-2 text-white">
              <Inbox className="w-5 h-5" />
              <span className="font-medium">Inbox</span>
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{emails.length}</span>
           </div>
           <button onClick={loadEmails} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
             {isProcessingEmails ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
           </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {isProcessingEmails && emails.length === 0 ? (
              <div className="p-8 text-center text-white/30 text-xs font-mono animate-pulse">
                 SYNCING WITH NEURAL NET...
              </div>
           ) : (
              <div className="divide-y divide-white/5">
                 {emails.map(email => (
                    <button
                      key={email.id}
                      onClick={() => handleSelectEmail(email.id)}
                      className={`w-full text-left p-4 hover:bg-white/5 transition-colors group relative ${selectedEmailId === email.id ? 'bg-white/5' : ''}`}
                    >
                       {selectedEmailId === email.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-tech-cyan" />}
                       <div className="flex justify-between items-start mb-1">
                          <span className={`text-sm font-medium truncate pr-2 ${email.isRead ? 'text-white/60' : 'text-white'}`}>{email.sender}</span>
                          <span className="text-[10px] text-white/30 whitespace-nowrap">2m ago</span>
                       </div>
                       <div className={`text-xs mb-1 truncate ${email.isRead ? 'text-white/50' : 'text-white font-medium'}`}>{email.subject}</div>
                       <div className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">{email.aiSummary || email.snippet}</div>
                       
                       {email.priority === 'High' && (
                          <div className="mt-2 flex">
                             <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20 font-mono uppercase">High Priority</span>
                          </div>
                       )}
                    </button>
                 ))}
              </div>
           )}
        </div>
      </GlassPane>

      {/* MAIN: READING PANE */}
      <div className="flex-1 flex flex-col overflow-hidden">
         {selectedEmailId ? (
            <GlassPane className="h-full flex flex-col p-0 relative">
               {(() => {
                  const email = emails.find(e => e.id === selectedEmailId)!;
                  return (
                    <>
                       {/* Header */}
                       <div className="p-6 border-b border-white/5">
                          <div className="flex justify-between items-start mb-4">
                             <h1 className="text-2xl font-light text-white leading-tight">{email.subject}</h1>
                             <div className="flex gap-2">
                                <button onClick={() => archiveEmail(email.id)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors" title="Archive">
                                   <Archive className="w-5 h-5" />
                                </button>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {email.sender[0]}
                             </div>
                             <div>
                                <div className="text-sm text-white font-medium">{email.sender}</div>
                                <div className="text-xs text-white/40">to me • {new Date(email.receivedAt).toLocaleTimeString()}</div>
                             </div>
                          </div>
                       </div>

                       {/* Body */}
                       <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                          {/* AI Context Card */}
                          <div className="mb-8 p-4 bg-tech-cyan/5 border border-tech-cyan/10 rounded-xl relative overflow-hidden">
                             <div className="flex items-center gap-2 mb-2 text-tech-cyan">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-xs font-mono uppercase tracking-widest">AI Analysis</span>
                             </div>
                             <p className="text-sm text-white/80">{email.aiSummary}</p>
                          </div>

                          <div className="text-white/80 text-sm leading-7 whitespace-pre-wrap font-light">
                             {email.body}
                          </div>
                       </div>

                       {/* Reply Area */}
                       <div className="p-6 bg-nebula-950/30 border-t border-white/5">
                          {draftReply ? (
                             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <div className="flex items-center justify-between text-xs text-white/40 font-mono uppercase">
                                   <span>Draft Reply (AI Generated)</span>
                                   <button onClick={() => setDraftReply('')} className="hover:text-white">Discard</button>
                                </div>
                                <textarea 
                                   value={draftReply}
                                   onChange={(e) => setDraftReply(e.target.value)}
                                   className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-tech-cyan/50 resize-none"
                                />
                                <div className="flex justify-end gap-3">
                                   <button className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-xs hover:bg-white/5">Edit</button>
                                   <button onClick={handleSend} className="px-6 py-2 bg-tech-cyan hover:bg-cyan-400 text-nebula-950 font-medium rounded-lg text-sm flex items-center gap-2">
                                      Send Reply <Send className="w-3 h-3" />
                                   </button>
                                </div>
                             </motion.div>
                          ) : (
                             <div className="flex gap-3">
                                <div className="text-xs text-white/30 py-2">Quick Reply:</div>
                                {['Professional', 'Casual', 'Direct'].map(tone => (
                                   <button 
                                      key={tone}
                                      onClick={() => handleGenerateFullReply(tone as any)}
                                      disabled={isDrafting}
                                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/70 transition-colors flex items-center gap-2"
                                   >
                                      {isDrafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-tech-purple" />}
                                      {tone}
                                   </button>
                                ))}
                             </div>
                          )}
                       </div>
                    </>
                  );
               })()}
            </GlassPane>
         ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
               <Mail className="w-16 h-16 text-white/20 mb-4" />
               <p className="text-white/40">Select an email to triage</p>
            </div>
         )}
      </div>

    </div>
  );
};
