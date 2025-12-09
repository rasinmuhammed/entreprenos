
import { UIContext, LayoutConfig, DisabilityProfile, CognitiveMode, View } from '../types';

/**
 * Morphing Layout Engine
 * 
 * Deterministically calculates the optimal UI layout based on:
 * 1. Disability Profile (BLIND, ADHD, etc.)
 * 2. Cognitive Mode (FOCUS, OVERVIEW)
 * 3. Device Context
 */
export const calculateLayout = (context: UIContext): LayoutConfig => {
  const { disabilityProfile, cognitiveMode, currentModule } = context;

  // --- DEFAULT LAYOUT (Standard) ---
  const defaultLayout: LayoutConfig = {
    layoutId: 'standard-grid',
    containerClass: 'grid grid-cols-1 md:grid-cols-6 gap-6 p-6 h-full',
    components: [
      { id: 'nav', type: 'NAVIGATION', props: {} },
      { id: 'main', type: 'PANEL', props: { className: 'col-span-5 h-full overflow-y-auto' } }
    ]
  };

  // --- 1. BLIND / SCREEN READER OPTIMIZED ---
  if (disabilityProfile === 'BLIND') {
    // Linearize everything. No complex grids. Audio-first focus.
    return {
      layoutId: 'linear-audio',
      containerClass: 'flex flex-col h-full p-4 bg-black text-yellow-400 space-y-6 overflow-y-auto',
      components: [
        // Sonic Dashboard is the primary interface here
        { 
          id: 'sonic-dashboard', 
          type: 'TASK_LIST', // Renders SonicDashboard
          props: { mode: 'audio-only', autoFocus: true } 
        },
        // Blind Strategist (Spatial Chat) always available
        { 
          id: 'blind-strategist', 
          type: 'CHAT_STREAM', 
          props: { label: 'Omniscient Strategist' } 
        }
      ]
    };
  }

  // --- 2. ADHD / NEURODIVERGENT ---
  if (disabilityProfile === 'ADHD') {
    if (cognitiveMode === 'FOCUS_SINGLE_TASK') {
      // Tunnel vision. Hide everything except the active task.
      return {
        layoutId: 'focus-shield',
        containerClass: 'h-full w-full bg-black flex items-center justify-center',
        components: [
          { 
            id: 'micro-step-view', 
            type: 'PANEL', 
            props: { minimal: true, showTimeHorizon: true } 
          }
        ]
      };
    } else {
      // Overview mode, but reduce clutter. No sidebars unless active.
      return {
        layoutId: 'clean-dashboard',
        containerClass: 'flex flex-col h-full p-8 max-w-4xl mx-auto',
        components: [
          { id: 'nav-top', type: 'NAVIGATION', props: { orientation: 'horizontal', simplified: true } },
          { id: 'main-content', type: 'PANEL', props: { className: 'flex-1 mt-8' } }
        ]
      };
    }
  }

  // --- 3. DEAF / HARD OF HEARING ---
  if (disabilityProfile === 'DEAF') {
    // Standard layout BUT with persistent HUD overlay
    return {
      layoutId: 'sentiment-hud-overlay',
      containerClass: 'relative h-full grid grid-cols-6 gap-6 p-6',
      components: [
        { id: 'nav', type: 'NAVIGATION', props: {} },
        { id: 'main', type: 'PANEL', props: { className: 'col-span-5' } },
        { 
          id: 'sentiment-hud', 
          type: 'HUD_OVERLAY', 
          props: { position: 'bottom-right', detailed: true } 
        }
      ]
    };
  }

  // Fallback
  return defaultLayout;
};
