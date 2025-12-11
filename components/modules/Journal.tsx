
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
      case LogType.DECISION: return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case LogType.MISTAKE: return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case LogType.LESSON: return <Lightbulb className="w-4 h-4 text-amber-600" />;
      default: return <Brain className="w-4 h-4 text-tech-purple" />;
    }
  };

  const getTypeColor = (type: LogType) => {
    switch (type) {
      case LogType.DECISION: return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case LogType.MISTAKE: return "bg-rose-50 border-rose-200 text-rose-800";
      case LogType.LESSON: return "bg-amber-50 border-amber-200 text-amber-800";
      default: return "bg-white border-slate-200 text-ink-900 shadow-sm";
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 p-6">
      
      {/* LEFT: LOG LIST */}
      <GlassPane className="flex-[2] flex flex-col overflow-hidden relative border-slate-200 bg-slate-50/50">
         <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 rounded-lg">
                <BookMarked className="w-5 h-5 text-tech-purple" />
             </div>
             <h2 className="text-xl font-bold text-ink-950">Founder's Log</h2>
           </div>
           
           <div className="flex gap-2">
             {['ALL', LogType.THOUGHT, LogType.DECISION, LogType.LESSON, LogType.MISTAKE].map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f as any)}
                 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border
                   ${filter === f ? 'bg-ink-950 text-white border-ink-950' : 'bg-white border-slate-200 text-ink-500 hover:text-ink-900'}
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
                 <div className={`p-5 rounded-xl border ${getTypeColor(entry.type)}`}>
                   <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center gap-2">
                       {getTypeIcon(entry.type)}
                       <span className="text-xs font-mono font-bold uppercase opacity-70">{entry.type}</span>
                       <span className="text-[10px] opacity-40 text-ink-900"> • {new Date(entry.timestamp).toLocaleString()}</span>
                     </div>
                     <button 
                       onClick={() => deleteLogEntry(entry.id)}
                       className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 rounded transition-all text-ink-300 hover:text-rose-500"
                     >
                       <Trash2 className="w-3.5 h-3.5" />
                     </button>
                   </div>
                   <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-700">{entry.content}</p>
                   {entry.tags.length > 0 && (
                     <div className="mt-3 flex gap-2">
                       {entry.tags.map(tag => (
                         <span key={tag} className="text-[10px] flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded text-ink-500 font-medium">
                           <Tag className="w-2.5 h-2.5" /> {tag}
                         </span>
                       ))}
                     </div>
                   )}
                 </div>
               </motion.div>
             )) : (
               <div className="text-center py-20 text-ink-300">
                 <div className="text-4xl mb-4 opacity-50">✍️</div>
                 <p className="font-medium">No entries found.</p>
                 <p className="text-sm mt-1">Log your decisions to track your growth.</p>
               </div>
             )}
           </AnimatePresence>
         </div>
      </GlassPane>

      {/* RIGHT: ENTRY FORM */}
      <GlassPane className="flex-1 p-8 flex flex-col justify-center bg-white border-slate-200 shadow-crisp">
         <h3 className="text-lg text-ink-900 font-bold mb-6">New Entry</h3>
         
         <form onSubmit={handleAdd} className="space-y-4">
           <div className="grid grid-cols-2 gap-2">
             {[LogType.THOUGHT, LogType.DECISION, LogType.LESSON, LogType.MISTAKE].map(type => (
               <button
                 key={type}
                 type="button"
                 onClick={() => setSelectedType(type)}
                 className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-xs font-bold uppercase
                   ${selectedType === type 
                     ? getTypeColor(type)
                     : "border-slate-100 bg-slate-50 text-ink-400 hover:bg-slate-100 hover:text-ink-600"}
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
             className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl p-4 text-ink-900 placeholder-ink-400 focus:outline-none focus:border-tech-purple focus:ring-1 focus:ring-tech-purple/20 resize-none text-sm leading-relaxed transition-all"
           />

           <button
             type="submit"
             disabled={!newEntryContent.trim()}
             className="w-full bg-tech-purple hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
           >
             <Plus className="w-4 h-4" />
             Add to Logbook
           </button>
         </form>
      </GlassPane>

    </div>
  );
};
