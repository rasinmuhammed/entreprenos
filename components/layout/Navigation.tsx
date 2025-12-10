
import React from 'react';
import { useAppStore } from '../../store/appStore';
import { View } from '../../types';
import { LayoutDashboard, Users, BookMarked, Target, Command, Map, PieChart, Presentation, Megaphone, Gamepad2, Eye, Mail, MessageCircle, LogOut, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navigation: React.FC = () => {
  const { currentView, setView, setVisionModalOpen, logout } = useAppStore();

  const navItems = [
    { id: View.DASHBOARD, label: 'Command', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: View.LEAD_INTERCEPTOR, label: 'Leads', icon: <MessageCircle className="w-5 h-5" /> },
    { id: View.COMMUNICATIONS, label: 'Inbox', icon: <Mail className="w-5 h-5" /> },
    { id: View.FEATURE_LAB, label: 'R&D', icon: <FlaskConical className="w-5 h-5" /> }, // New Item
    { id: View.MARKETING, label: 'Growth', icon: <Megaphone className="w-5 h-5" /> },
    { id: View.SIMULATOR, label: 'Wargame', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: View.LOCAL_INTEL, label: 'Map', icon: <Map className="w-5 h-5" /> },
    { id: View.COMPETITORS, label: 'Intel', icon: <Target className="w-5 h-5" /> },
    { id: View.FINANCE, label: 'Finance', icon: <PieChart className="w-5 h-5" /> },
    { id: View.PITCH_DECK, label: 'Pitch', icon: <Presentation className="w-5 h-5" /> },
    { id: View.BOARDROOM, label: 'Board', icon: <Users className="w-5 h-5" /> },
    { id: View.JOURNAL, label: 'Logbook', icon: <BookMarked className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-20 z-50 flex flex-col items-center py-6 bg-nebula-900/40 backdrop-blur-xl border-r border-white/5">
      <div className="mb-10 p-3 bg-white/5 rounded-xl border border-white/10 shadow-glow cursor-default">
        <Command className="w-5 h-5 text-white" />
      </div>

      {/* Vision Trigger */}
      <button 
        onClick={() => setVisionModalOpen(true)}
        className="mb-6 p-3 rounded-xl bg-tech-purple/20 hover:bg-tech-purple/40 border border-tech-purple/30 text-tech-purple hover:text-white transition-all group relative"
        title="Omniscient Vision"
      >
        <Eye className="w-5 h-5" />
        <div className="absolute left-14 top-2 bg-nebula-950 px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
          VISION INPUT
        </div>
      </button>

      <div className="flex flex-col gap-6 w-full px-3 overflow-y-auto custom-scrollbar flex-1 pb-4">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="relative group flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className={`
                relative p-3 rounded-xl transition-all duration-300 z-10
                ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white'}
              `}>
                {/* Active Indicator Backdrop */}
                {isActive && (
                  <motion.div
                    layoutId="navActiveBg"
                    className="absolute inset-0 bg-white/10 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {/* Icon */}
                <div className="relative z-10">
                   {item.icon}
                </div>
              </div>
              
              {/* Label */}
              <span className={`text-[9px] font-mono tracking-wider uppercase transition-all duration-300 ${isActive ? 'text-tech-cyan opacity-100' : 'opacity-0 translate-y-[-5px] group-hover:opacity-100 group-hover:translate-y-0 text-white/50'}`}>
                {item.label}
              </span>

              {/* Active Sideline Indicator */}
              {isActive && (
                 <motion.div 
                    layoutId="navSideline"
                    className="absolute left-[-12px] top-3 bottom-3 w-[3px] rounded-r-full bg-tech-cyan shadow-[0_0_10px_#06b6d4]"
                 />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 w-full flex justify-center">
         <button 
           onClick={logout}
           className="p-3 rounded-xl text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
           title="Logout"
         >
           <LogOut className="w-5 h-5" />
         </button>
      </div>
    </div>
  );
};
