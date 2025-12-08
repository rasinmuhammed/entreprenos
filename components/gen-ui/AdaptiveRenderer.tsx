
import React from 'react';
import { useAppStore } from '../../store/appStore';
import { AccessibilityMode, View } from '../../types';
import { GoldenGrid } from '../layout/GoldenGrid';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Bell } from 'lucide-react';

// Specialized Views
import { MicroStepView } from './MicroStepView';
import { SentimentHUD } from './SentimentHUD';
import { SpatialChat } from './SpatialChat';

// Module Imports
import { BoardRoom } from '../modules/BoardRoom';
import { Journal } from '../modules/Journal';
import { CompetitorIntelligence } from '../modules/CompetitorIntelligence';
import { LocalIntelligence } from '../modules/LocalIntelligence';
import { FinancialForecaster } from '../modules/FinancialForecaster';
import { PitchDeckGenerator } from '../modules/PitchDeckGenerator';
import { MarketingEngine } from '../modules/MarketingEngine';
import { VentureSimulator } from '../modules/VentureSimulator';
import { EmailClient } from '../modules/EmailClient';

export const AdaptiveRenderer: React.FC = () => {
  const { accessibilityMode, widgets, currentView, oracleAlerts, removeOracleAlert } = useAppStore();

  const renderStandardContent = () => {
    switch (currentView) {
      case View.BOARDROOM: return <BoardRoom />;
      case View.JOURNAL: return <Journal />;
      case View.COMPETITORS: return <CompetitorIntelligence />;
      case View.LOCAL_INTEL: return <LocalIntelligence />;
      case View.FINANCE: return <FinancialForecaster />;
      case View.PITCH_DECK: return <PitchDeckGenerator />;
      case View.MARKETING: return <MarketingEngine />;
      case View.SIMULATOR: return <VentureSimulator />;
      case View.COMMUNICATIONS: return <div className="h-full p-6"><EmailClient /></div>;
      case View.DASHBOARD:
      default:
        // Defensive check for widgets in standard view
        return widgets && widgets.length > 0 ? <GoldenGrid widgets={widgets} /> : null;
    }
  };

  const variants = {
    // STANDARD: Regular OS
    [AccessibilityMode.STANDARD]: renderStandardContent(),
    
    // BLIND: Sonic View + Spatial Chat
    [AccessibilityMode.SONIC_VIEW]: (
      <div className="h-full bg-black text-white p-4">
         {/* Split Screen: Standard Linear List + Spatial Chat */}
         <div className="grid grid-cols-1 md:grid-cols-2 h-full gap-4">
            <div className="overflow-y-auto space-y-8 p-4">
               <div className="bg-yellow-400 text-black p-4 font-bold text-xl uppercase border-4 border-black flex items-center gap-2">
                 <Volume2 className="w-8 h-8" /> Active Screen Reader Feed
               </div>
               
               {/* Defensive map for inventory alerts */}
               {useAppStore.getState().inventoryAlerts?.length > 0 && (
                  <div role="alert" className="border-4 border-red-500 p-4">
                     <h2 className="text-2xl font-bold text-red-500 mb-2">ALERTS</h2>
                     {useAppStore.getState().inventoryAlerts.map((a, i) => (
                        <div key={i} className="text-xl">{a.item}: {a.status}</div>
                     ))}
                  </div>
               )}

               {/* Defensive map for widgets */}
               {widgets?.map(w => (
                  <div key={w.id} className="border-b-2 border-white/20 pb-4">
                     <h2 className="text-3xl font-bold mb-2">{w.title}</h2>
                     <p className="text-xl opacity-80">{(JSON.stringify(w.content) || "").slice(0, 100)}...</p>
                  </div>
               ))}
            </div>
            <div className="h-full">
               <SpatialChat />
            </div>
         </div>
      </div>
    ),

    // ADHD: Focus Shield (Micro-Steps)
    [AccessibilityMode.FOCUS_SHIELD]: (
      <div className="h-full bg-black">
         <MicroStepView /> 
      </div>
    ),

    // DEAF: Sentiment HUD
    [AccessibilityMode.SENTIMENT_HUD]: (
      <SentimentHUD />
    )
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={accessibilityMode + (accessibilityMode === AccessibilityMode.STANDARD ? currentView : '')}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.5 }}
          className="h-full w-full overflow-hidden"
        >
          {variants[accessibilityMode]}
        </motion.div>
      </AnimatePresence>

      {/* THE ORACLE OVERLAY */}
      <div className="fixed bottom-24 right-8 z-50 flex flex-col gap-2">
         <AnimatePresence>
            {oracleAlerts.map(alert => (
               <motion.div
                 key={alert.id}
                 initial={{ opacity: 0, x: 50 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl w-80 cursor-pointer ${
                    alert.severity === 'high' ? 'bg-rose-500/20 border-rose-500/50 text-white' : 'bg-tech-cyan/20 border-tech-cyan/50 text-white'
                 }`}
                 onClick={() => removeOracleAlert(alert.id)}
               >
                  <div className="flex items-center gap-2 mb-1">
                     <Bell className="w-4 h-4 animate-pulse" />
                     <span className="text-[10px] font-mono uppercase tracking-wider">Oracle Insight</span>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                  <p className="text-xs opacity-80">{alert.action}</p>
               </motion.div>
            ))}
         </AnimatePresence>
      </div>
    </>
  );
};
