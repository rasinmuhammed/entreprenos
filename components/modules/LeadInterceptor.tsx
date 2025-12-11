
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
    
    updateLead(selectedLeadId, { status: 'CONVERTED' }); 
    setReplyInput('');
  };

  const getChannelIcon = (channel: LeadChannel) => {
    switch(channel) {
      case 'WHATSAPP': return <MessageCircle className="w-4 h-4 text-emerald-500" />;
      case 'INSTAGRAM': return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'EMAIL': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'PHONE': return <Phone className="w-4 h-4 text-purple-500" />;
      case 'GOOGLE': return <MapPin className="w-4 h-4 text-rose-500" />;
      default: return <MessageSquare className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch(status) {
      case 'NEW': return <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded border border-blue-100 uppercase font-mono font-bold">New</span>;
      case 'AUTO_RESPONDED': return <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded border border-emerald-100 uppercase font-mono font-bold">Auto-Replied</span>;
      case 'REQUIRES_ACTION': return <span className="bg-rose-50 text-rose-600 text-[10px] px-2 py-0.5 rounded border border-rose-100 uppercase font-mono animate-pulse font-bold">Action Needed</span>;
      case 'CONVERTED': return <span className="bg-purple-50 text-purple-600 text-[10px] px-2 py-0.5 rounded border border-purple-100 uppercase font-mono font-bold">Converted</span>;
      case 'LOST': return <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded border border-slate-200 uppercase font-mono font-bold">Lost</span>;
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden flex gap-6 p-6">
       
       {/* LEFT: LIST & STATS */}
       <div className="w-96 flex flex-col gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 shrink-0">
             <GlassPane className="p-4 bg-emerald-50 border-emerald-100">
                <div className="text-[10px] text-emerald-600 font-mono uppercase tracking-wider mb-1 font-bold">Converted</div>
                <div className="text-2xl font-bold text-ink-900">{leadInterceptor.stats.converted}</div>
             </GlassPane>
             <GlassPane className="p-4 bg-rose-50 border-rose-100">
                <div className="text-[10px] text-rose-600 font-mono uppercase tracking-wider mb-1 font-bold">Waiting</div>
                <div className="text-2xl font-bold text-ink-900">{leadInterceptor.stats.waiting}</div>
             </GlassPane>
          </div>

          <GlassPane className="flex-1 flex flex-col overflow-hidden bg-slate-50 border-slate-200 p-0">
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                <div className="flex gap-2">
                   <button onClick={() => setFilter('ALL')} className={`text-xs px-2 py-1 rounded font-bold ${filter === 'ALL' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-slate-100'}`}>All</button>
                   <button onClick={() => setFilter('REQUIRES_ACTION')} className={`text-xs px-2 py-1 rounded font-bold ${filter === 'REQUIRES_ACTION' ? 'bg-rose-100 text-rose-700' : 'text-ink-500 hover:bg-slate-100'}`}>Urgent</button>
                </div>
                <button 
                  onClick={handleSimulateLead}
                  disabled={leadInterceptor.isSimulatingLead}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-ink-400 hover:text-tech-purple transition-colors disabled:opacity-50"
                  title="Simulate Incoming Lead"
                >
                   <RefreshCw className={`w-4 h-4 ${leadInterceptor.isSimulatingLead ? 'animate-spin' : ''}`} />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredLeads.length === 0 ? (
                   <div className="p-8 text-center text-ink-400 text-xs italic">
                      No leads found.
                   </div>
                ) : (
                   <div className="divide-y divide-slate-100">
                      {filteredLeads.map(lead => (
                         <button
                           key={lead.id}
                           onClick={() => setSelectedLeadId(lead.id)}
                           className={`w-full text-left p-4 hover:bg-white transition-colors relative group ${selectedLeadId === lead.id ? 'bg-white z-10 shadow-sm' : ''}`}
                         >
                            {selectedLeadId === lead.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-tech-purple" />}
                            <div className="flex justify-between items-start mb-1">
                               <div className="flex items-center gap-2">
                                  {getChannelIcon(lead.channel)}
                                  <span className="font-bold text-sm text-ink-900">{lead.name}</span>
                               </div>
                               <span className="text-[10px] text-ink-400 font-medium">{new Date(lead.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="flex justify-between items-end">
                               <div className="text-xs text-ink-500 truncate max-w-[180px] font-medium">{lead.lastMessage}</div>
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
             <GlassPane className="h-full flex flex-col p-0 relative bg-white shadow-crisp">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-ink-600 font-bold text-lg border border-slate-300">
                         {activeLead.name[0]}
                      </div>
                      <div>
                         <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                            {activeLead.name} 
                            <span className="text-xs font-bold text-ink-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{activeLead.channel}</span>
                         </h2>
                         <div className="text-xs text-ink-500 flex items-center gap-2 font-medium">
                            Intent: <span className="text-tech-purple uppercase font-bold">{activeLead.intent}</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex gap-2">
                      <button onClick={() => updateLead(activeLead.id, { status: 'LOST' })} className="p-2 hover:bg-rose-50 rounded-lg text-ink-400 hover:text-rose-500 border border-transparent hover:border-rose-200 transition-all" title="Mark Lost">
                         <XCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => updateLead(activeLead.id, { status: 'CONVERTED' })} className="p-2 hover:bg-emerald-50 rounded-lg text-ink-400 hover:text-emerald-500 border border-transparent hover:border-emerald-200 transition-all" title="Mark Converted">
                         <CheckCircle2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30">
                   {activeLead.history.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                         <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.sender === 'customer' 
                               ? 'bg-white border border-slate-200 text-ink-900 rounded-tl-none' 
                               : msg.sender === 'ai'
                                  ? 'bg-purple-50 border border-purple-100 text-purple-900 rounded-tr-none'
                                  : 'bg-tech-purple text-white rounded-tr-none'
                         }`}>
                            {msg.sender === 'ai' && (
                               <div className="flex items-center gap-1 text-[10px] text-purple-700 mb-1 font-mono uppercase font-bold">
                                  <Zap className="w-3 h-3 fill-current" /> Auto-Response
                               </div>
                            )}
                            {msg.text}
                            <div className={`text-[9px] mt-1 text-right font-medium ${msg.sender === 'user' ? 'text-white/60' : 'text-ink-400'}`}>
                               {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-slate-100">
                   <div className="relative">
                      <input 
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        placeholder="Type a reply..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-ink-900 focus:outline-none focus:border-tech-purple focus:ring-1 focus:ring-tech-purple/20 transition-all shadow-inner"
                      />
                      <button 
                        type="submit"
                        disabled={!replyInput.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-tech-purple hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                      >
                         <Send className="w-4 h-4" />
                      </button>
                   </div>
                </form>
             </GlassPane>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-50 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                <div className="p-6 bg-slate-100 rounded-full mb-4">
                   <MessageCircle className="w-12 h-12 text-ink-300" />
                </div>
                <h3 className="text-xl text-ink-900 font-bold">Lead Interceptor</h3>
                <p className="text-ink-500 max-w-sm mt-2 font-medium">Select a conversation to view details or simulate a new lead.</p>
             </div>
          )}
       </div>

    </div>
  );
};
