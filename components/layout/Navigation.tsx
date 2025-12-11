
import React from 'react';
import { useAppStore } from '../../store/appStore';
import { View } from '../../types';
import { LayoutDashboard, Users, BookMarked, Target, Command, Map, PieChart, Presentation, Megaphone, Gamepad2, Eye, Mail, MessageCircle, LogOut, FlaskConical, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navigation: React.FC = () => {
  const { currentView, setView, setVisionModalOpen, logout } = useAppStore();

  const navItems = [
    { id: View.DASHBOARD, label: 'Command', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: View.LEAD_INTERCEPTOR, label: 'Leads', icon: <MessageCircle className="w-5 h-5" /> },
    { id: View.COMMUNICATIONS, label: 'Inbox', icon: <Mail className="w-5 h-5" /> },
    { id: View.FEATURE_LAB, label: 'R&D', icon: <FlaskConical className="w-5 h-5" /> },
    { id: View.MARKETING, label: 'Growth', icon: <Megaphone className="w-5 h-5" /> },
    { id: View.SIMULATOR, label: 'Wargame', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: View.LOCAL_INTEL, label: 'Map', icon: <Map className="w-5 h-5" /> },
    { id: View.COMPETITORS, label: 'Intel', icon: <Target className="w-5 h-5" /> },
    { id: View.FINANCE, label: 'Finance', icon: <PieChart className="w-5 h-5" /> },
    { id: View.PITCH_DECK, label: 'Pitch', icon: <Presentation className="w-5 h-5" /> },
    { id: View.BOARDROOM, label: 'Board', icon: <Briefcase className="w-5 h-5" /> },
    { id: View.TEAM, label: 'Team', icon: <Users className="w-5 h-5" /> },
    { id: View.JOURNAL, label: 'Log', icon: <BookMarked className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 z-50 flex-col items-center py-6 bg-white/80 backdrop-blur-xl border-r border-slate-200">
        <div className="mb-8 p-3 bg-white rounded-xl shadow-crisp border border-slate-100 cursor-default text-tech-purple">
          <Command className="w-5 h-5" />
        </div>

        <button 
          onClick={() => setVisionModalOpen(true)}
          className="mb-6 p-3 rounded-xl bg-tech-purple text-white shadow-lg shadow-tech-purple/30 hover:scale-105 transition-all group relative"
          title="Omniscient Vision"
        >
          <Eye className="w-5 h-5" />
          <div className="absolute left-14 top-2 bg-ink-950 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-50 whitespace-nowrap">
            VISION INPUT
          </div>
        </button>

        <div className="flex flex-col gap-4 w-full px-3 flex-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
             <DesktopNavItem key={item.id} item={item} isActive={currentView === item.id} onClick={() => setView(item.id)} />
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 w-full flex justify-center">
           <button onClick={logout} className="p-3 rounded-xl text-ink-400 hover:text-rose-500 transition-colors"><LogOut className="w-5 h-5" /></button>
        </div>
      </div>

      {/* --- MOBILE BOTTOM BAR --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 z-[60] bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-xl flex items-center justify-between px-6 pb-2 safe-area-bottom">
         {navItems.slice(0, 2).map((item) => (
            <MobileNavItem key={item.id} item={item} isActive={currentView === item.id} onClick={() => setView(item.id)} />
         ))}
         
         {/* Central FAB */}
         <button 
           onClick={() => setVisionModalOpen(true)}
           className="relative -top-6 bg-tech-purple text-white p-4 rounded-full shadow-lg border-4 border-slate-50 active:scale-95 transition-transform shadow-tech-purple/30"
         >
            <Eye className="w-6 h-6" />
         </button>

         {navItems.slice(2, 4).map((item) => (
            <MobileNavItem key={item.id} item={item} isActive={currentView === item.id} onClick={() => setView(item.id)} />
         ))}
      </div>
    </>
  );
};

const DesktopNavItem: React.FC<{ item: any, isActive: boolean, onClick: () => void }> = ({ item, isActive, onClick }) => (
  <button onClick={onClick} className={`relative group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-white shadow-crisp border border-slate-100' : 'hover:bg-slate-50'}`}>
    <div className={`relative z-10 ${isActive ? 'text-tech-purple' : 'text-slate-400 group-hover:text-slate-600'}`}>
      {item.icon}
    </div>
    
    {/* Tooltip */}
    <div className="absolute left-16 top-2 bg-ink-950 text-white px-2 py-1 rounded-md text-[10px] font-bold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
      {item.label}
    </div>
  </button>
);

const MobileNavItem: React.FC<{ item: any, isActive: boolean, onClick: () => void }> = ({ item, isActive, onClick }) => (
   <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 ${isActive ? 'text-tech-purple' : 'text-slate-400'}`}>
      {item.icon}
      <span className="text-[9px] font-bold uppercase tracking-tight">{item.label}</span>
   </button>
);
    