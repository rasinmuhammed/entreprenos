import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { LogEntry, LogType } from '../../types';
import { GlassPane } from '../ui/GlassPane';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Brain, CheckCircle, AlertOctagon, Lightbulb, Plus, Trash2, Tag } from 'lucide-react';

export const Journal: React.FC = () => {
  const { journal, addLogEntry, deleteLogEntry } = useAppStore();
  const [newEntryContent, setNewEntryContent] = useState('');
  const [selectedType, setSelectedType] = useState<LogType>(LogType.THOUGHT);
  const [filter, setFilter] = useState<LogType | 'ALL'>('ALL');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryContent.trim()) return;

    const entry: LogEntry = {
      id: Math.random().toString(),
      content: newEntryContent,
      type: selectedType,
      timestamp: Date.now(),
      tags: []
    };

    addLogEntry(entry);
    setNewEntryContent('');
  };

  const filteredJournal = filter === 'ALL' 
    ? journal 
    : journal.filter(entry => entry.type === filter);

  const getTypeIcon = (type: LogType) => {
    switch (type) {
      case LogType.DECISION: return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case LogType.MISTAKE: return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case LogType.LESSON: return <Lightbulb className="w-4 h-4 text-amber-400" />;
      default: return <Brain className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getTypeColor = (type: LogType) => {
    switch (type) {
      case LogType.DECISION: return "bg-emerald-500/10 border-emerald-500/20 text-emerald-200";
      case LogType.MISTAKE: return "bg-rose-500/10 border-rose-500/20 text-rose-200";
      case LogType.LESSON: return "bg-amber-500/10 border-amber-500/20 text-amber-200";
      default: return "bg-cyan-500/10 border-cyan-500/20 text-cyan-200";
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 p-6">
      
      {/* LEFT: LOG LIST */}
      <GlassPane className="flex-[2] flex flex-col overflow-hidden relative">
         <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
           <div className="flex items-center gap-3">
             <BookMarked className="w-6 h-6 text-indigo-400" />
             <h2 className="text-2xl font-light text-white">Founder's Log</h2>
           </div>
           
           <div className="flex gap-2">
             {['ALL', LogType.THOUGHT, LogType.DECISION, LogType.LESSON, LogType.MISTAKE].map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f as any)}
                 className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-colors border
                   ${filter === f ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'}
                 `}
               >
                 {f}
               </button>
             ))}
           </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
           <AnimatePresence>
             {filteredJournal.length > 0 ? filteredJournal.map(entry => (
               <motion.div
                 key={entry.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="group relative"
               >
                 <div className={`p-5 rounded-xl border backdrop-blur-sm ${getTypeColor(entry.type)}`}>
                   <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center gap-2">
                       {getTypeIcon(entry.type)}
                       <span className="text-xs font-mono font-bold uppercase opacity-70">{entry.type}</span>
                       <span className="text-[10px] opacity-40"> • {new Date(entry.timestamp).toLocaleString()}</span>
                     </div>
                     <button 
                       onClick={() => deleteLogEntry(entry.id)}
                       className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/20 rounded transition-all text-white/40 hover:text-rose-400"
                     >
                       <Trash2 className="w-3.5 h-3.5" />
                     </button>
                   </div>
                   <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                   {entry.tags.length > 0 && (
                     <div className="mt-3 flex gap-2">
                       {entry.tags.map(tag => (
                         <span key={tag} className="text-[10px] flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded text-white/50">
                           <Tag className="w-2.5 h-2.5" /> {tag}
                         </span>
                       ))}
                     </div>
                   )}
                 </div>
               </motion.div>
             )) : (
               <div className="text-center py-20 text-white/20">
                 <div className="text-4xl mb-2">📜</div>
                 <p>No entries found.</p>
               </div>
             )}
           </AnimatePresence>
         </div>
      </GlassPane>

      {/* RIGHT: ENTRY FORM */}
      <GlassPane className="flex-1 p-8 flex flex-col justify-center bg-indigo-950/20">
         <h3 className="text-lg text-white font-light mb-6">New Entry</h3>
         
         <form onSubmit={handleAdd} className="space-y-4">
           <div className="grid grid-cols-2 gap-2">
             {[LogType.THOUGHT, LogType.DECISION, LogType.LESSON, LogType.MISTAKE].map(type => (
               <button
                 key={type}
                 type="button"
                 onClick={() => setSelectedType(type)}
                 className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs font-mono uppercase
                   ${selectedType === type 
                     ? getTypeColor(type) + " shadow-glow"
                     : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10"}
                 `}
               >
                 {getTypeIcon(type)}
                 {type}
               </button>
             ))}
           </div>

           <textarea
             value={newEntryContent}
             onChange={(e) => setNewEntryContent(e.target.value)}
             placeholder="Log a key decision, a fleeting thought, or a critical lesson..."
             className="w-full h-48 bg-nebula-950/50 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 resize-none text-sm leading-relaxed"
           />

           <button
             type="submit"
             disabled={!newEntryContent.trim()}
             className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
           >
             <Plus className="w-4 h-4" />
             Add to Logbook
           </button>
         </form>
      </GlassPane>

    </div>
  );
};