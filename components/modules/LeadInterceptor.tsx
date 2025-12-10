
import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { GlassPane } from '../ui/GlassPane';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, Mail, Instagram, MapPin, Search, Send, CheckCircle2, AlertTriangle, Clock, RefreshCw, User, XCircle, Zap, MessageSquare } from 'lucide-react';
import { simulateIncomingLead, processLeadMessage } from '../../services/geminiService';
import { Lead, LeadChannel, LeadStatus } from '../../types';

export const LeadInterceptor: React.FC = () => {
  const { 
    leadInterceptor, 
    addLead, 
    updateLead, 
    addLeadMessage, 
    setLeadSimulating,
    context 
  } = useAppStore();

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | LeadStatus>('ALL');
  const [replyInput, setReplyInput] = useState('');

  const activeLead = leadInterceptor.leads.find(l => l.id === selectedLeadId);
  const filteredLeads = filter === 'ALL' 
    ? leadInterceptor.leads 
    : leadInterceptor.leads.filter(l => l.status === filter);

  // Auto-Simulate logic for demo purposes
  useEffect(() => {
    if (leadInterceptor.leads.length === 0 && !leadInterceptor.isSimulatingLead && context) {
       handleSimulateLead();
    }
  }, []);

  const handleSimulateLead = async () => {
    if (!context) return;
    setLeadSimulating(true);
    try {
      const lead = await simulateIncomingLead(context);
      addLead(lead);
      
      // Immediately process for auto-response
      const result = await processLeadMessage(lead, context, leadInterceptor.autoResponseTemplate);
      
      if (result.autoResponded) {
         addLeadMessage(lead.id, {
            id: Math.random().toString(),
            sender: 'ai',
            text: result.reply,
            timestamp: Date.now() + 1000
         });
         updateLead(lead.id, { status: 'AUTO_RESPONDED' });
      } else {
         updateLead(lead.id, { status: 'REQUIRES_ACTION' });
      }
      
    } catch (e) {
      console.error(e);
    } finally {
      setLeadSimulating(false);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedLeadId) return;

    addLeadMessage(selectedLeadId, {
       id: Math.random().toString(),
       sender: 'user',
       text: replyInput,
       timestamp: Date.now()
    });
    
    // Assume user interaction moves it to converted or handled state eventually, 
    // but for now let's just leave it or mark active
    updateLead(selectedLeadId, { status: 'CONVERTED' }); 
    setReplyInput('');
  };

  const getChannelIcon = (channel: LeadChannel) => {
    switch(channel) {
      case 'WHATSAPP': return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case 'INSTAGRAM': return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'EMAIL': return <Mail className="w-4 h-4 text-blue-400" />;
      case 'PHONE': return <Phone className="w-4 h-4 text-purple-400" />;
      case 'GOOGLE': return <MapPin className="w-4 h-4 text-red-400" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch(status) {
      case 'NEW': return <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-500/30 uppercase font-mono">New</span>;
      case 'AUTO_RESPONDED': return <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 uppercase font-mono">Auto-Replied</span>;
      case 'REQUIRES_ACTION': return <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-500/30 uppercase font-mono animate-pulse">Action Needed</span>;
      case 'CONVERTED': return <span className="bg-tech-purple/20 text-tech-purple text-[10px] px-2 py-0.5 rounded border border-tech-purple/30 uppercase font-mono">Converted</span>;
      case 'LOST': return <span className="bg-white/10 text-white/50 text-[10px] px-2 py-0.5 rounded border border-white/20 uppercase font-mono">Lost</span>;
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden flex gap-6 p-6">
       
       {/* LEFT: LIST & STATS */}
       <div className="w-96 flex flex-col gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 shrink-0">
             <GlassPane className="p-4 bg-emerald-500/5 border-emerald-500/10">
                <div className="text-[10px] text-emerald-400/60 font-mono uppercase tracking-wider mb-1">Converted</div>
                <div className="text-2xl font-light text-white">{leadInterceptor.stats.converted}</div>
             </GlassPane>
             <GlassPane className="p-4 bg-rose-500/5 border-rose-500/10">
                <div className="text-[10px] text-rose-400/60 font-mono uppercase tracking-wider mb-1">Waiting</div>
                <div className="text-2xl font-light text-white">{leadInterceptor.stats.waiting}</div>
             </GlassPane>
          </div>

          <GlassPane className="flex-1 flex flex-col overflow-hidden bg-nebula-900/40 p-0">
             <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <div className="flex gap-2">
                   <button onClick={() => setFilter('ALL')} className={`text-xs px-2 py-1 rounded ${filter === 'ALL' ? 'bg-white/10 text-white' : 'text-white/40'}`}>All</button>
                   <button onClick={() => setFilter('REQUIRES_ACTION')} className={`text-xs px-2 py-1 rounded ${filter === 'REQUIRES_ACTION' ? 'bg-rose-500/20 text-rose-300' : 'text-white/40'}`}>Urgent</button>
                </div>
                <button 
                  onClick={handleSimulateLead}
                  disabled={leadInterceptor.isSimulatingLead}
                  className="p-1.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors disabled:opacity-50"
                  title="Simulate Incoming Lead"
                >
                   <RefreshCw className={`w-4 h-4 ${leadInterceptor.isSimulatingLead ? 'animate-spin' : ''}`} />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredLeads.length === 0 ? (
                   <div className="p-8 text-center text-white/30 text-xs italic">
                      No leads found.
                   </div>
                ) : (
                   <div className="divide-y divide-white/5">
                      {filteredLeads.map(lead => (
                         <button
                           key={lead.id}
                           onClick={() => setSelectedLeadId(lead.id)}
                           className={`w-full text-left p-4 hover:bg-white/5 transition-colors relative group ${selectedLeadId === lead.id ? 'bg-white/5' : ''}`}
                         >
                            {selectedLeadId === lead.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-tech-cyan" />}
                            <div className="flex justify-between items-start mb-1">
                               <div className="flex items-center gap-2">
                                  {getChannelIcon(lead.channel)}
                                  <span className="font-medium text-sm text-white">{lead.name}</span>
                               </div>
                               <span className="text-[10px] text-white/30">{new Date(lead.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="flex justify-between items-end">
                               <div className="text-xs text-white/60 truncate max-w-[180px]">{lead.lastMessage}</div>
                               {getStatusBadge(lead.status)}
                            </div>
                         </button>
                      ))}
                   </div>
                )}
             </div>
          </GlassPane>
       </div>

       {/* RIGHT: CHAT / DETAIL */}
       <div className="flex-1 flex flex-col overflow-hidden">
          {activeLead ? (
             <GlassPane className="h-full flex flex-col p-0 relative">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                         {activeLead.name[0]}
                      </div>
                      <div>
                         <h2 className="text-lg font-medium text-white flex items-center gap-2">
                            {activeLead.name} 
                            <span className="text-xs font-normal text-white/40 bg-white/10 px-2 py-0.5 rounded-full">{activeLead.channel}</span>
                         </h2>
                         <div className="text-xs text-white/40 flex items-center gap-2">
                            Intent: <span className="text-tech-cyan uppercase">{activeLead.intent}</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex gap-2">
                      <button onClick={() => updateLead(activeLead.id, { status: 'LOST' })} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-rose-400" title="Mark Lost">
                         <XCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => updateLead(activeLead.id, { status: 'CONVERTED' })} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-emerald-400" title="Mark Converted">
                         <CheckCircle2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-nebula-900/30">
                   {activeLead.history.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                         <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${
                            msg.sender === 'customer' 
                               ? 'bg-white/10 text-white rounded-tl-none' 
                               : msg.sender === 'ai'
                                  ? 'bg-tech-purple/20 border border-tech-purple/30 text-white rounded-tr-none'
                                  : 'bg-tech-cyan text-nebula-950 rounded-tr-none'
                         }`}>
                            {msg.sender === 'ai' && (
                               <div className="flex items-center gap-1 text-[10px] text-tech-purple mb-1 font-mono uppercase">
                                  <Zap className="w-3 h-3" /> Auto-Response
                               </div>
                            )}
                            {msg.text}
                            <div className="text-[9px] opacity-40 mt-1 text-right">
                               {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSendReply} className="p-4 bg-nebula-950/50 border-t border-white/5">
                   <div className="relative">
                      <input 
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        placeholder="Type a reply..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-tech-cyan/50 transition-colors"
                      />
                      <button 
                        type="submit"
                        disabled={!replyInput.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-tech-cyan hover:bg-cyan-400 text-nebula-950 rounded-lg transition-colors disabled:opacity-50"
                      >
                         <Send className="w-4 h-4" />
                      </button>
                   </div>
                </form>
             </GlassPane>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <MessageCircle className="w-16 h-16 text-white/20 mb-4" />
                <h3 className="text-xl text-white font-light">Lead Interceptor</h3>
                <p className="text-white/40 max-w-sm mt-2">Select a conversation to view details or simulate a new lead.</p>
             </div>
          )}
       </div>

    </div>
  );
};
