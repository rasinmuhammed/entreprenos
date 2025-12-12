
import React, { useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { LayoutConfig, LayoutComponent } from '../../types';
import { calculateLayout } from '../../services/layoutEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { GoldenGrid } from '../layout/GoldenGrid';
import { Navigation } from '../layout/Navigation';
import { MicroStepView } from './MicroStepView';
import { SentimentHUD } from './SentimentHUD';
import { SonicDashboard } from './SonicDashboard';
import { BlindStrategistView } from './BlindStrategistView';
import { BoardRoom } from '../modules/BoardRoom';
import { Journal } from '../modules/Journal';
import { CompetitorIntelligence } from '../modules/CompetitorIntelligence';
import { LocalIntelligence } from '../modules/LocalIntelligence';
import { FinancialForecaster } from '../modules/FinancialForecaster';
import { PitchDeckGenerator } from '../modules/PitchDeckGenerator';
import { MarketingEngine } from '../modules/MarketingEngine';
import { VentureSimulator } from '../modules/VentureSimulator';
import { EmailClient } from '../modules/EmailClient';
import { LeadInterceptor } from '../modules/LeadInterceptor';
import { FeatureLab } from '../modules/FeatureLab';
import { TeamView } from '../modules/TeamView';
import { IntegrationsView } from '../modules/IntegrationsView';

export const AdaptiveRenderer: React.FC = () => {
  const { uiContext, widgets, currentView } = useAppStore();

  // Calculate layout deterministically based on context
  const layoutConfig = useMemo(() => {
    // Inject current module into context for calculations
    const ctxWithModule = { ...uiContext, currentModule: currentView };
    return calculateLayout(ctxWithModule);
  }, [uiContext, currentView]);

  const renderComponent = (comp: LayoutComponent) => {
    switch (comp.type) {
      case 'NAVIGATION':
        return <Navigation />;
      
      case 'HUD_OVERLAY':
        // If SentimentHUD is requested
        if (comp.id === 'sentiment-hud') return <div className="absolute bottom-4 right-4 z-50 pointer-events-none"><SentimentHUD /></div>;
        return null;

      case 'TASK_LIST':
        if (comp.id === 'sonic-dashboard') return <SonicDashboard />;
        return null;

      case 'CHAT_STREAM':
        if (comp.id === 'blind-strategist') return <BlindStrategistView />;
        return null;

      case 'PANEL':
        if (comp.id === 'micro-step-view') {
           // Tunnel Vision Effect for Focus Shield: Zoom In + Blur-to-Clear
           return (
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }} 
               animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }} 
               transition={{ duration: 0.5, ease: "circOut" }}
               className="h-full"
             >
                <MicroStepView />
             </motion.div>
           );
        }
        
        // Main Content Panel Logic
        if (comp.id === 'main' || comp.id === 'main-content') {
           switch (currentView) {
              case 'BOARDROOM': return <BoardRoom />;
              case 'JOURNAL': return <Journal />;
              case 'COMPETITORS': return <CompetitorIntelligence />;
              case 'LOCAL_INTEL': return <LocalIntelligence />;
              case 'FINANCE': return <FinancialForecaster />;
              case 'PITCH_DECK': return <PitchDeckGenerator />;
              case 'MARKETING': return <MarketingEngine />;
              case 'SIMULATOR': return <VentureSimulator />;
              case 'COMMUNICATIONS': return <EmailClient />;
              case 'LEAD_INTERCEPTOR': return <LeadInterceptor />;
              case 'FEATURE_LAB': return <FeatureLab />;
              case 'TEAM': return <TeamView />;
              case 'INTEGRATIONS': return <IntegrationsView />;
              case 'DASHBOARD': default: return <GoldenGrid widgets={widgets} />;
           }
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className={layoutConfig.containerClass}>
      {layoutConfig.components.map((comp) => (
        <div key={comp.id} className={comp.props.className || (comp.type === 'PANEL' ? 'flex-1 overflow-hidden' : '')} style={{ gridArea: comp.gridArea }}>
           {renderComponent(comp)}
        </div>
      ))}
    </div>
  );
};
