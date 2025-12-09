
import { create } from 'zustand';
import { BusinessContext, WidgetData, BoardRoomState, ChatMessage, ResearchGathered, ConsultationQuestion, BusinessProfile, View, LogEntry, CompetitorEntity, LocationAnalysis, FinancialInputs, FinancialHealth, PitchDeck, MarketingCampaign, SimulationState, CrisisEvent, SimulationResult, CrisisChoice, AccessibilityMode, LiveConnectionState, InventoryAlert, FocusSession, Email, MicroTask, SentimentFrame, BlindStrategistState, SpatialMessage, OracleAlert, MemoryFragment, ThemeMode, UIContext, LayoutConfig, AgentTask, MicroTaskPlan } from '../types';
import { calculateLayout } from '../services/layoutEngine';

interface AppState {
  hasStartedOnboarding: boolean;
  userRole: 'FOUNDER' | 'ALLY' | null;

  context: BusinessContext | null;
  widgets: WidgetData[];
  currentView: View;
  
  // --- NEW: UI ENGINE STATE ---
  uiContext: UIContext;
  layoutConfig: LayoutConfig | null;

  // --- NEW: AGENT TASKS ---
  agentTasks: AgentTask[];

  // Accessibility & Live State
  accessibilityMode: AccessibilityMode;
  themeMode: ThemeMode;
  liveState: LiveConnectionState;

  // Sentiment HUD (Deaf)
  sentimentStream: SentimentFrame[];

  // Blind Strategist (Blind)
  blindStrategist: BlindStrategistState;
  audioBriefs: Record<string, string>; 

  // Inventory Sonar
  inventoryAlerts: InventoryAlert[];

  // Focus Session (ADHD)
  focusSession: FocusSession;
  microTaskPlan: MicroTaskPlan | null; // NEW: Structured Plan
  lastActiveContext: string | null;

  // The Oracle (Predictive Alerts)
  oracleAlerts: OracleAlert[];

  // Memory Palace (Persistence)
  memories: MemoryFragment[];

  // Email Agent
  emails: Email[];
  isProcessingEmails: boolean;
  selectedEmailId: string | null;

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
  setThemeMode: (mode: ThemeMode) => void;
  setLiveState: (state: Partial<LiveConnectionState>) => void;

  setWidgets: (widgets: WidgetData[]) => void;
  appendWidgets: (newWidgets: WidgetData[]) => void;
  updateWidgetContent: (id: string, newContent: any) => void;
  setView: (view: View) => void;

  // Layout Actions
  updateUIContext: (updates: Partial<UIContext>) => void;

  // Sentiment Actions
  addSentimentFrame: (frame: SentimentFrame) => void;
  clearSentimentStream: () => void;

  // Blind Strategist Actions
  setBlindStrategistImage: (imageUrl: string) => void;
  addBlindStrategistMessage: (msg: SpatialMessage) => void;
  setBlindStrategistProcessing: (isProcessing: boolean) => void;
  setAudioBrief: (id: string, text: string) => void;

  // Inventory Actions
  setInventoryAlerts: (alerts: InventoryAlert[]) => void;

  // Focus Actions
  startFocusSession: (taskName: string, microSteps: MicroTask[]) => void;
  setMicroTaskPlan: (plan: MicroTaskPlan) => void;
  completeMicroStep: () => void;
  endFocusSession: () => void;
  setLastActiveContext: (ctx: string) => void;

  // Oracle Actions
  addOracleAlert: (alert: OracleAlert) => void;
  removeOracleAlert: (id: string) => void;

  // Memory Actions
  addMemory: (memory: MemoryFragment) => void;

  // Email Actions
  setEmails: (emails: Email[]) => void;
  setProcessingEmails: (isProcessing: boolean) => void;
  setSelectedEmailId: (id: string | null) => void;
  markEmailRead: (id: string) => void;
  archiveEmail: (id: string) => void;

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
  updateBoardRoomState: (updates: Partial<BoardRoomState>) => void;
  
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  hasStartedOnboarding: false,
  userRole: null,

  context: null,
  widgets: [],
  currentView: View.DASHBOARD,
  
  // Init UI Context
  uiContext: {
    userId: 'guest',
    disabilityProfile: 'NEUROTYPICAL', // Default, updated on onboarding
    device: 'DESKTOP',
    cognitiveMode: 'STRATEGY_OVERVIEW'
  },
  layoutConfig: null,
  agentTasks: [],

  accessibilityMode: AccessibilityMode.STANDARD,
  themeMode: ThemeMode.NEBULA,
  liveState: {
    isConnected: false,
    isStreaming: false,
    isThinking: false,
    volumeLevel: 0
  },

  sentimentStream: [],

  blindStrategist: {
    isActive: false,
    imageUrl: null,
    messages: [],
    isProcessing: false
  },
  audioBriefs: {},

  inventoryAlerts: [],

  focusSession: {
    isActive: false,
    taskName: '',
    microSteps: [],
    currentStepIndex: 0,
    streak: 0,
    startTime: 0,
    lastStepChangeTime: 0
  },
  microTaskPlan: null,
  lastActiveContext: null,

  oracleAlerts: [],
  memories: [],

  emails: [],
  isProcessingEmails: false,
  selectedEmailId: null,
  
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
  
  setAccessibilityMode: (mode) => {
    // Map legacy AccessibilityMode to DisabilityProfile
    let profile: any = 'NEUROTYPICAL';
    if (mode === AccessibilityMode.SONIC_VIEW) profile = 'BLIND';
    if (mode === AccessibilityMode.FOCUS_SHIELD) profile = 'ADHD';
    if (mode === AccessibilityMode.SENTIMENT_HUD) profile = 'DEAF';

    set((state) => {
      const newContext = { ...state.uiContext, disabilityProfile: profile };
      return { 
        accessibilityMode: mode,
        uiContext: newContext,
        layoutConfig: calculateLayout(newContext)
      };
    });
  },

  setThemeMode: (mode) => set({ themeMode: mode }),
  setLiveState: (state) => set((prev) => ({ liveState: { ...prev.liveState, ...state } })),

  setWidgets: (widgets) => set({ widgets }),
  appendWidgets: (newWidgets) => set((state) => ({ widgets: [...state.widgets, ...newWidgets] })),
  
  updateWidgetContent: (id, newContent) => set((state) => ({
    widgets: state.widgets.map(w => w.id === id ? { ...w, content: newContent } : w)
  })),

  setView: (view) => set({ currentView: view }),

  updateUIContext: (updates) => set((state) => {
    const newCtx = { ...state.uiContext, ...updates };
    return {
      uiContext: newCtx,
      layoutConfig: calculateLayout(newCtx)
    };
  }),

  addSentimentFrame: (frame) => set((state) => ({
    sentimentStream: [...state.sentimentStream.slice(-5), frame]
  })),
  clearSentimentStream: () => set({ sentimentStream: [] }),

  setBlindStrategistImage: (imageUrl) => set((state) => ({
    blindStrategist: { ...state.blindStrategist, imageUrl, isActive: true }
  })),
  addBlindStrategistMessage: (msg) => set((state) => ({
    blindStrategist: { ...state.blindStrategist, messages: [...state.blindStrategist.messages, msg] }
  })),
  setBlindStrategistProcessing: (isProcessing) => set((state) => ({
    blindStrategist: { ...state.blindStrategist, isProcessing }
  })),
  setAudioBrief: (id, text) => set((state) => ({
    audioBriefs: { ...state.audioBriefs, [id]: text }
  })),

  setInventoryAlerts: (alerts) => set({ inventoryAlerts: alerts }),

  startFocusSession: (taskName, microSteps) => {
    const now = Date.now();
    // Also set UI context to Focus Mode
    get().updateUIContext({ cognitiveMode: 'FOCUS_SINGLE_TASK' });
    
    set({
      focusSession: {
        isActive: true,
        taskName,
        microSteps,
        currentStepIndex: 0,
        streak: 0,
        startTime: now,
        lastStepChangeTime: now
      },
      lastActiveContext: `Working on: ${taskName}`
    });
  },
  
  setMicroTaskPlan: (plan) => set({ microTaskPlan: plan }),

  completeMicroStep: () => set((state) => {
     const nextIndex = state.focusSession.currentStepIndex + 1;
     const isFinished = nextIndex >= state.focusSession.microSteps.length;
     const now = Date.now();
     
     const updatedSteps = [...state.focusSession.microSteps];
     updatedSteps[state.focusSession.currentStepIndex] = { ...updatedSteps[state.focusSession.currentStepIndex], isComplete: true };

     if (isFinished) {
       // Revert UI context on finish
       get().updateUIContext({ cognitiveMode: 'STRATEGY_OVERVIEW' });
       return {
         focusSession: {
           ...state.focusSession,
           microSteps: updatedSteps,
           isActive: false, 
           streak: state.focusSession.streak + 1,
           lastStepChangeTime: now
         },
         lastActiveContext: null
       };
     }

     return {
       focusSession: {
         ...state.focusSession,
         microSteps: updatedSteps,
         currentStepIndex: nextIndex,
         streak: state.focusSession.streak + 1,
         lastStepChangeTime: now
       }
     };
  }),
  endFocusSession: () => {
    get().updateUIContext({ cognitiveMode: 'STRATEGY_OVERVIEW' });
    set({ 
      focusSession: { 
        isActive: false, 
        taskName: '', 
        microSteps: [], 
        currentStepIndex: 0, 
        streak: 0,
        startTime: 0,
        lastStepChangeTime: 0
      },
      lastActiveContext: null
    });
  },
  setLastActiveContext: (ctx) => set({ lastActiveContext: ctx }),

  addOracleAlert: (alert) => set((state) => ({ oracleAlerts: [alert, ...state.oracleAlerts] })),
  removeOracleAlert: (id) => set((state) => ({ oracleAlerts: state.oracleAlerts.filter(a => a.id !== id) })),

  addMemory: (memory) => set((state) => ({ memories: [memory, ...state.memories] })),

  setEmails: (emails) => set({ emails }),
  setProcessingEmails: (isProcessing) => set({ isProcessingEmails: isProcessing }),
  setSelectedEmailId: (id) => set({ selectedEmailId: id }),
  markEmailRead: (id) => set((state) => ({
    emails: state.emails.map(e => e.id === id ? { ...e, isRead: true } : e)
  })),
  archiveEmail: (id) => set((state) => ({
    emails: state.emails.filter(e => e.id !== id),
    selectedEmailId: state.selectedEmailId === id ? null : state.selectedEmailId
  })),

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
    currentView: View.BOARDROOM,
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
      consensus: null,
      transcript: [], // clear structured transcript
      recommendation: undefined
    }
  })),

  setBoardRoomThinking: (isThinking) => set((state) => ({
    boardRoom: { ...state.boardRoom, isThinking }
  })),

  setBoardRoomConsensus: (consensus) => set((state) => ({
    boardRoom: { ...state.boardRoom, consensus }
  })),
  
  updateBoardRoomState: (updates) => set((state) => ({
    boardRoom: { ...state.boardRoom, ...updates }
  })),

  reset: () => set({
    hasStartedOnboarding: false,
    userRole: null,
    context: null,
    widgets: [],
    currentView: View.DASHBOARD,
    accessibilityMode: AccessibilityMode.STANDARD,
    themeMode: ThemeMode.NEBULA,
    research: { dossier: null, sentiment: null, questions: [], profile: null },
    boardRoom: { isActive: false, topic: '', consensus: null, messages: [], isThinking: false },
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
    isVisionModalOpen: false,
    inventoryAlerts: [],
    focusSession: { isActive: false, taskName: '', microSteps: [], currentStepIndex: 0, streak: 0, startTime: 0, lastStepChangeTime: 0 },
    microTaskPlan: null,
    emails: [],
    isProcessingEmails: false,
    selectedEmailId: null,
    sentimentStream: [],
    blindStrategist: { isActive: false, imageUrl: null, messages: [], isProcessing: false },
    audioBriefs: {},
    oracleAlerts: [],
    memories: [],
    lastActiveContext: null,
    uiContext: { userId: 'guest', disabilityProfile: 'NEUROTYPICAL', device: 'DESKTOP', cognitiveMode: 'STRATEGY_OVERVIEW' },
    layoutConfig: null,
    agentTasks: []
  })
}));
