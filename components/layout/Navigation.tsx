
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
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 z-50 flex-col items-center py-6 bg-white/60 backdrop-blur-xl border-r border-white/60 shadow-soft">
        <div className="mb-10 p-3 bg-white/50 rounded-2xl border border-white/50 shadow-sm cursor-default text-ink-900">
          <Command className="w-5 h-5" />
        </div>

        <button 
          onClick={() => setVisionModalOpen(true)}
          className="mb-6 p-3 rounded-2xl bg-soft-primary/10 hover:bg-soft-primary/20 text-soft-primary border border-soft-primary/20 transition-all group relative"
          title="Omniscient Vision"
        >
          <Eye className="w-5 h-5" />
          <div className="absolute left-14 top-2 bg-white px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wide text-ink-900 opacity-0 group-hover:opacity-100 transition-opacity border border-black/5 shadow-soft z-50 whitespace-nowrap">
            VISION INPUT
          </div>
        </button>

        <div className="flex flex-col gap-6 w-full px-3 overflow-y-auto custom-scrollbar flex-1 pb-4">
          {navItems.map((item) => (
             <DesktopNavItem key={item.id} item={item} isActive={currentView === item.id} onClick={() => setView(item.id)} />
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-black/5 w-full flex justify-center">
           <button onClick={logout} className="p-3 rounded-xl text-ink-400 hover:text-soft-rose transition-colors"><LogOut className="w-5 h-5" /></button>
        </div>
      </div>

      {/* --- MOBILE BOTTOM BAR --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 z-[60] bg-white/90 backdrop-blur-xl border-t border-white/50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] flex items-center justify-between px-6 pb-2 safe-area-bottom">
         {navItems.slice(0, 2).map((item) => (
            <MobileNavItem key={item.id} item={item} isActive={currentView === item.id} onClick={() => setView(item.id)} />
         ))}
         
         {/* Central FAB */}
         <button 
           onClick={() => setVisionModalOpen(true)}
           className="relative -top-6 bg-ink-900 text-white p-4 rounded-full shadow-lg border-4 border-paper-50 active:scale-95 transition-transform"
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
  <button onClick={onClick} className="relative group flex flex-col items-center gap-1.5 shrink-0">
    <div className={`relative p-3 rounded-2xl transition-all duration-300 z-10 ${isActive ? 'text-soft-primary bg-soft-primary/10' : 'text-ink-400 hover:text-ink-900 hover:bg-black/5'}`}>
      {isActive && <motion.div layoutId="navActiveBg" className="absolute inset-0 bg-soft-primary/10 rounded-2xl" />}
      <div className="relative z-10">{item.icon}</div>
    </div>
    <span className={`text-[9px] font-bold tracking-wider uppercase transition-all duration-300 ${isActive ? 'text-soft-primary opacity-100' : 'opacity-0 translate-y-[-5px] group-hover:opacity-100 group-hover:translate-y-0 text-ink-400'}`}>{item.label}</span>
    {isActive && <motion.div layoutId="navSideline" className="absolute left-[-12px] top-3 bottom-3 w-[3px] rounded-r-full bg-soft-primary" />}
  </button>
);

const MobileNavItem: React.FC<{ item: any, isActive: boolean, onClick: () => void }> = ({ item, isActive, onClick }) => (
   <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 ${isActive ? 'text-soft-primary' : 'text-ink-400'}`}>
      {item.icon}
      <span className="text-[9px] font-bold uppercase tracking-tight">{item.label}</span>
   </button>
);
