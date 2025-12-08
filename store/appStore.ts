
import { create } from 'zustand';
import { BusinessContext, WidgetData, BoardRoomState, ChatMessage, AgentPersona, ResearchGathered, ConsultationQuestion, BusinessProfile, View, LogEntry, LogType, CompetitorEntity, LocationAnalysis, FinancialInputs, FinancialHealth, PitchDeck, MarketingCampaign, SimulationState, CrisisEvent, SimulationResult, CrisisChoice, AccessibilityMode, LiveConnectionState } from '../types';

interface AppState {
  hasStartedOnboarding: boolean;
  userRole: 'FOUNDER' | 'ALLY' | null;

  context: BusinessContext | null;
  widgets: WidgetData[];
  currentView: View;
  
  // Accessibility & Live State
  accessibilityMode: AccessibilityMode;
  liveState: LiveConnectionState;

  // Boardroom
  boardRoom: BoardRoomState;
  
  // Journal
  journal: LogEntry[];

  // Competitor Intelligence
  competitors: CompetitorEntity[];
  isAnalyzingCompetitors: boolean;

  // Local Intelligence
  locationAnalysis: LocationAnalysis | null;
  isAnalyzingLocation: boolean;

  // Financials
  financialInputs: FinancialInputs;
  financialHealth: FinancialHealth | null;
  isAnalyzingFinance: boolean;

  // Pitch Deck
  pitchDeck: PitchDeck | null;
  isGeneratingPitch: boolean;

  // Marketing Engine
  campaigns: MarketingCampaign[];
  isGeneratingCampaign: boolean;

  // Venture Simulator
  simulation: SimulationState;
  isSimulating: boolean;

  // Vision
  isVisionModalOpen: boolean;

  // Onboarding Research State
  research: ResearchGathered;
  
  // Actions
  startOnboarding: () => void;
  setUserRole: (role: 'FOUNDER' | 'ALLY') => void;

  setContext: (context: BusinessContext) => void;
  setAccessibilityMode: (mode: AccessibilityMode) => void;
  setLiveState: (state: Partial<LiveConnectionState>) => void;

  setWidgets: (widgets: WidgetData[]) => void;
  appendWidgets: (newWidgets: WidgetData[]) => void;
  updateWidgetContent: (id: string, newContent: any) => void;
  setView: (view: View) => void;

  // Journal Actions
  addLogEntry: (entry: LogEntry) => void;
  deleteLogEntry: (id: string) => void;
  
  // Competitor Actions
  setCompetitors: (competitors: CompetitorEntity[]) => void;
  setAnalyzingCompetitors: (isAnalyzing: boolean) => void;

  // Local Intel Actions
  setLocationAnalysis: (analysis: LocationAnalysis) => void;
  setAnalyzingLocation: (isAnalyzing: boolean) => void;

  // Financial Actions
  setFinancialInputs: (inputs: FinancialInputs) => void;
  setFinancialHealth: (health: FinancialHealth) => void;
  setAnalyzingFinance: (isAnalyzing: boolean) => void;

  // Pitch Deck Actions
  setPitchDeck: (deck: PitchDeck) => void;
  setGeneratingPitch: (isGenerating: boolean) => void;

  // Marketing Actions
  addCampaign: (campaign: MarketingCampaign) => void;
  setGeneratingCampaign: (isGenerating: boolean) => void;

  // Simulator Actions
  initSimulation: (initialCash: number) => void;
  setCrisisEvent: (event: CrisisEvent | null) => void;
  applySimulationResult: (result: SimulationResult, choice: CrisisChoice) => void;
  setSimulating: (isSimulating: boolean) => void;

  // Vision Actions
  setVisionModalOpen: (isOpen: boolean) => void;

  // Research Actions
  setDossier: (dossier: ResearchGathered['dossier']) => void;
  setSentiment: (sentiment: ResearchGathered['sentiment']) => void;
  setConsultationQuestions: (questions: ConsultationQuestion[]) => void;
  setBusinessProfile: (profile: BusinessProfile) => void;
  
  // Boardroom Actions
  startBoardRoomSession: (topic: string) => void; 
  addBoardRoomMessage: (message: ChatMessage) => void;
  clearBoardRoomMessages: () => void;
  setBoardRoomThinking: (isThinking: boolean) => void;
  setBoardRoomConsensus: (consensus: string | null) => void;
  
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  hasStartedOnboarding: false,
  userRole: null,

  context: null,
  widgets: [],
  currentView: View.DASHBOARD,
  accessibilityMode: AccessibilityMode.STANDARD,
  liveState: {
    isConnected: false,
    isStreaming: false,
    isThinking: false,
    volumeLevel: 0
  },
  
  boardRoom: {
    isActive: false,
    topic: '',
    consensus: null,
    messages: [],
    isThinking: false
  },
  
  journal: [],

  competitors: [],
  isAnalyzingCompetitors: false,

  locationAnalysis: null,
  isAnalyzingLocation: false,

  financialInputs: {
    cashOnHand: 0,
    monthlyBurn: 0,
    monthlyRevenue: 0,
    growthRate: 0
  },
  financialHealth: null,
  isAnalyzingFinance: false,

  pitchDeck: null,
  isGeneratingPitch: false,

  campaigns: [],
  isGeneratingCampaign: false,

  simulation: {
    isActive: false,
    currentEvent: null,
    history: [],
    cashBalance: 0,
    reputationScore: 100,
    month: 1
  },
  isSimulating: false,

  isVisionModalOpen: false,

  research: {
    dossier: null,
    sentiment: null,
    questions: [],
    profile: null
  },

  startOnboarding: () => set({ hasStartedOnboarding: true }),
  setUserRole: (role) => set({ userRole: role }),

  setContext: (context) => set({ context }),
  setAccessibilityMode: (mode) => set({ accessibilityMode: mode }),
  setLiveState: (state) => set((prev) => ({ liveState: { ...prev.liveState, ...state } })),

  setWidgets: (widgets) => set({ widgets }),
  appendWidgets: (newWidgets) => set((state) => ({ widgets: [...state.widgets, ...newWidgets] })),
  
  updateWidgetContent: (id, newContent) => set((state) => ({
    widgets: state.widgets.map(w => w.id === id ? { ...w, content: newContent } : w)
  })),

  setView: (view) => set({ currentView: view }),

  addLogEntry: (entry) => set((state) => ({ journal: [entry, ...state.journal] })),
  deleteLogEntry: (id) => set((state) => ({ journal: state.journal.filter(j => j.id !== id) })),

  setCompetitors: (competitors) => set({ competitors }),
  setAnalyzingCompetitors: (isAnalyzing) => set({ isAnalyzingCompetitors: isAnalyzing }),

  setLocationAnalysis: (analysis) => set({ locationAnalysis: analysis }),
  setAnalyzingLocation: (isAnalyzing) => set({ isAnalyzingLocation: isAnalyzing }),

  setFinancialInputs: (inputs) => set({ financialInputs: inputs }),
  setFinancialHealth: (health) => set({ financialHealth: health }),
  setAnalyzingFinance: (isAnalyzing) => set({ isAnalyzingFinance: isAnalyzing }),

  setPitchDeck: (deck) => set({ pitchDeck: deck }),
  setGeneratingPitch: (isGenerating) => set({ isGeneratingPitch: isGenerating }),

  addCampaign: (campaign) => set((state) => ({ campaigns: [campaign, ...state.campaigns] })),
  setGeneratingCampaign: (isGenerating) => set({ isGeneratingCampaign: isGenerating }),

  initSimulation: (initialCash) => set({
    simulation: {
      isActive: true,
      currentEvent: null,
      history: [],
      cashBalance: initialCash,
      reputationScore: 100,
      month: 1
    }
  }),

  setCrisisEvent: (event) => set((state) => ({
    simulation: { ...state.simulation, currentEvent: event }
  })),

  applySimulationResult: (result, choice) => set((state) => {
    if (!state.simulation.currentEvent) return state;
    return {
      simulation: {
        ...state.simulation,
        currentEvent: null,
        month: state.simulation.month + 1,
        cashBalance: state.simulation.cashBalance + result.financialImpact,
        reputationScore: Math.min(100, Math.max(0, state.simulation.reputationScore + result.reputationImpact)),
        history: [
          { event: state.simulation.currentEvent, choice, result },
          ...state.simulation.history
        ]
      }
    };
  }),

  setSimulating: (isSimulating) => set({ isSimulating }),
  
  setVisionModalOpen: (isOpen) => set({ isVisionModalOpen: isOpen }),

  setDossier: (dossier) => set((state) => ({ research: { ...state.research, dossier } })),
  setSentiment: (sentiment) => set((state) => ({ research: { ...state.research, sentiment } })),
  setConsultationQuestions: (questions) => set((state) => ({ research: { ...state.research, questions } })),
  setBusinessProfile: (profile) => set((state) => ({ research: { ...state.research, profile } })),

  startBoardRoomSession: (topic) => set({
    currentView: View.BOARDROOM, // Auto switch view
    boardRoom: {
      isActive: true,
      topic,
      consensus: null,
      messages: [],
      isThinking: false
    }
  }),

  addBoardRoomMessage: (message) => set((state) => ({
    boardRoom: {
      ...state.boardRoom,
      messages: [...state.boardRoom.messages, message]
    }
  })),

  clearBoardRoomMessages: () => set((state) => ({
    boardRoom: {
      ...state.boardRoom,
      messages: [],
      consensus: null
    }
  })),

  setBoardRoomThinking: (isThinking) => set((state) => ({
    boardRoom: { ...state.boardRoom, isThinking }
  })),

  setBoardRoomConsensus: (consensus) => set((state) => ({
    boardRoom: { ...state.boardRoom, consensus }
  })),

  reset: () => set({
    hasStartedOnboarding: false,
    userRole: null,
    context: null,
    widgets: [],
    currentView: View.DASHBOARD,
    accessibilityMode: AccessibilityMode.STANDARD,
    research: { dossier: null, sentiment: null, questions: [], profile: null },
    boardRoom: {
      isActive: false,
      topic: '',
      consensus: null,
      messages: [],
      isThinking: false
    },
    journal: [],
    competitors: [],
    isAnalyzingCompetitors: false,
    locationAnalysis: null,
    isAnalyzingLocation: false,
    financialInputs: { cashOnHand: 0, monthlyBurn: 0, monthlyRevenue: 0, growthRate: 0 },
    financialHealth: null,
    isAnalyzingFinance: false,
    pitchDeck: null,
    isGeneratingPitch: false,
    campaigns: [],
    isGeneratingCampaign: false,
    simulation: { isActive: false, currentEvent: null, history: [], cashBalance: 0, reputationScore: 100, month: 1 },
    isSimulating: false,
    isVisionModalOpen: false
  })
}));
