
import { create } from 'zustand';
import { BusinessContext, WidgetData, BoardRoomState, ChatMessage, ResearchGathered, ConsultationQuestion, BusinessProfile, View, LogEntry, CompetitorEntity, LocationAnalysis, FinancialInputs, FinancialHealth, PitchDeck, MarketingCampaign, SimulationState, CrisisEvent, SimulationResult, CrisisChoice, AccessibilityMode, LiveConnectionState, InventoryAlert, FocusSession, Email, MicroTask, SentimentFrame, BlindStrategistState, SpatialMessage, OracleAlert, MemoryFragment, ThemeMode, UIContext, LayoutConfig, AgentTask, MicroTaskPlan, Lead, LeadMessage, LeadStatus, User, AuthState, FeatureProposal, AIEmployee, EntityDossier } from '../types';
import { calculateLayout } from '../services/layoutEngine';
import { authService } from '../services/authService';

interface AppState {
  // --- AUTH STATE ---
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;

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

  // --- NEW: TEAM STATE ---
  team: AIEmployee[];

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
  microTaskPlan: MicroTaskPlan | null;
  lastActiveContext: string | null;

  // The Oracle (Predictive Alerts)
  oracleAlerts: OracleAlert[];

  // Memory Palace (Persistence)
  memories: MemoryFragment[];

  // Email Agent
  emails: Email[];
  isProcessingEmails: boolean;
  selectedEmailId: string | null;

  // Lead Interceptor
  leadInterceptor: {
    leads: Lead[];
    stats: {
      total: number;
      converted: number;
      responseRate: number;
      waiting: number;
    };
    isSimulatingLead: boolean;
    autoResponseTemplate: string;
  };

  // Feature Lab (R&D)
  featureProposals: FeatureProposal[];
  isResearchingFeatures: boolean;

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
  updateWidget: (id: string, updates: Partial<WidgetData>) => void; // New action
  setView: (view: View) => void;

  // Layout Actions
  updateUIContext: (updates: Partial<UIContext>) => void;

  // Sentiment Actions
  addSentimentFrame: (frame: SentimentFrame) => void;

  // Blind Strategist Actions
  setBlindStrategistImage: (base64: string | null) => void;
  addBlindStrategistMessage: (msg: SpatialMessage) => void;
  setBlindStrategistProcessing: (isProcessing: boolean) => void;
  setAudioBrief: (widgetId: string, text: string) => void;

  // Inventory Actions
  setInventoryAlerts: (alerts: InventoryAlert[]) => void;

  // Focus Actions
  startFocusSession: (taskName: string, microSteps: MicroTask[]) => void;
  completeMicroStep: () => void;
  endFocusSession: () => void;
  setLastActiveContext: (ctx: string | null) => void;

  // Oracle Actions
  addOracleAlert: (alert: OracleAlert) => void;
  dismissOracleAlert: (id: string) => void;

  // Memory Actions
  addMemory: (memory: MemoryFragment) => void;

  // Email Actions
  setEmails: (emails: Email[]) => void;
  setProcessingEmails: (loading: boolean) => void;
  setSelectedEmailId: (id: string | null) => void;
  markEmailRead: (id: string) => void;
  archiveEmail: (id: string) => void;

  // Lead Interceptor Actions
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  addLeadMessage: (leadId: string, msg: LeadMessage) => void;
  setLeadSimulating: (loading: boolean) => void;

  // Feature Lab Actions
  setFeatureProposals: (proposals: FeatureProposal[]) => void;
  setResearchingFeatures: (loading: boolean) => void;

  // Team Actions
  setTeam: (team: AIEmployee[]) => void;

  // Boardroom Actions
  startBoardRoomSession: (topic: string) => void;
  setBoardRoomThinking: (thinking: boolean) => void;
  setBoardRoomConsensus: (consensus: string) => void;
  addBoardRoomMessage: (msg: ChatMessage) => void;
  updateBoardRoomState: (updates: Partial<BoardRoomState>) => void;

  // Journal Actions
  addLogEntry: (entry: LogEntry) => void;
  deleteLogEntry: (id: string) => void;

  // Competitor Actions
  setCompetitors: (competitors: CompetitorEntity[]) => void;
  setAnalyzingCompetitors: (analyzing: boolean) => void;

  // Local Intel Actions
  setLocationAnalysis: (analysis: LocationAnalysis) => void;
  setAnalyzingLocation: (analyzing: boolean) => void;

  // Financial Actions
  setFinancialInputs: (inputs: FinancialInputs) => void;
  setFinancialHealth: (health: FinancialHealth) => void;
  setAnalyzingFinance: (analyzing: boolean) => void;

  // Pitch Actions
  setPitchDeck: (deck: PitchDeck) => void;
  setGeneratingPitch: (generating: boolean) => void;

  // Marketing Actions
  addCampaign: (campaign: MarketingCampaign) => void;
  setGeneratingCampaign: (generating: boolean) => void;

  // Simulator Actions
  initSimulation: (initialCash: number) => void;
  setCrisisEvent: (event: CrisisEvent) => void;
  applySimulationResult: (result: SimulationResult, choice: CrisisChoice) => void;
  setSimulating: (simulating: boolean) => void;

  // Vision Modal
  setVisionModalOpen: (open: boolean) => void;

  // Research
  setDossier: (dossier: any) => void;
  updateDossier: (updates: Partial<EntityDossier>) => void;
  setSentiment: (sentiment: any) => void;

  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  auth: { user: null, isAuthenticated: false, isLoading: false, error: null },
  login: async (email, password) => {
    set(s => ({ auth: { ...s.auth, isLoading: true, error: null } }));
    try {
      const user = await authService.login(email, password);
      set(s => ({ auth: { ...s.auth, user, isAuthenticated: true, isLoading: false } }));
    } catch (e: any) {
      set(s => ({ auth: { ...s.auth, isLoading: false, error: e.message } }));
    }
  },
  register: async (name, email, password) => {
    set(s => ({ auth: { ...s.auth, isLoading: true, error: null } }));
    try {
      const user = await authService.register(name, email, password);
      set(s => ({ auth: { ...s.auth, user, isAuthenticated: true, isLoading: false } }));
    } catch (e: any) {
      set(s => ({ auth: { ...s.auth, isLoading: false, error: e.message } }));
    }
  },
  logout: async () => {
    await authService.logout();
    set(s => ({ auth: { ...s.auth, user: null, isAuthenticated: false } }));
  },
  checkSession: async () => {
    set(s => ({ auth: { ...s.auth, isLoading: true } }));
    const user = await authService.getSession();
    set(s => ({ auth: { ...s.auth, user, isAuthenticated: !!user, isLoading: false } }));
  },

  hasStartedOnboarding: false,
  userRole: null,

  context: null,
  widgets: [],
  currentView: View.DASHBOARD,
  
  uiContext: {
    userId: 'user',
    disabilityProfile: 'NEUROTYPICAL',
    device: 'DESKTOP',
    cognitiveMode: 'STRATEGY_OVERVIEW'
  },
  layoutConfig: null,

  agentTasks: [],
  team: [],

  accessibilityMode: AccessibilityMode.STANDARD,
  themeMode: ThemeMode.NEBULA,
  liveState: { isConnected: false, isStreaming: false, isThinking: false, volumeLevel: 0 },
  
  sentimentStream: [],
  
  blindStrategist: { isActive: false, imageUrl: null, messages: [], isProcessing: false },
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

  leadInterceptor: {
    leads: [],
    stats: { total: 0, converted: 0, responseRate: 0, waiting: 0 },
    isSimulatingLead: false,
    autoResponseTemplate: "Hi! Thanks for reaching out. We'll get back to you shortly."
  },

  featureProposals: [],
  isResearchingFeatures: false,

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

  research: { dossier: null, sentiment: null, questions: [], profile: null },

  startOnboarding: () => set({ hasStartedOnboarding: true }),
  setUserRole: (role) => set({ userRole: role }),

  setContext: (context) => set({ context }),
  setAccessibilityMode: (mode) => set((state) => ({ 
    accessibilityMode: mode, 
    uiContext: { ...state.uiContext, disabilityProfile: mapModeToProfile(mode) } 
  })),
  setThemeMode: (mode) => set({ themeMode: mode }),
  setLiveState: (liveState) => set((state) => ({ liveState: { ...state.liveState, ...liveState } })),
  
  setWidgets: (widgets) => set({ widgets }),
  appendWidgets: (newWidgets) => set((state) => ({ widgets: [...state.widgets, ...newWidgets] })),
  updateWidgetContent: (id, newContent) => set((state) => ({
    widgets: state.widgets.map(w => w.id === id ? { ...w, content: newContent } : w)
  })),
  updateWidget: (id, updates) => set((state) => ({
    widgets: state.widgets.map(w => w.id === id ? { ...w, ...updates } : w)
  })),
  setView: (view) => set((state) => ({ 
    currentView: view,
    uiContext: { ...state.uiContext, currentModule: view }
  })),

  updateUIContext: (updates) => set((state) => ({ uiContext: { ...state.uiContext, ...updates } })),

  addSentimentFrame: (frame) => set((state) => ({ sentimentStream: [...state.sentimentStream, frame].slice(-5) })),
  
  setBlindStrategistImage: (base64) => set((state) => ({ blindStrategist: { ...state.blindStrategist, imageUrl: base64 } })),
  addBlindStrategistMessage: (msg) => set((state) => ({ blindStrategist: { ...state.blindStrategist, messages: [...state.blindStrategist.messages, msg] } })),
  setBlindStrategistProcessing: (isProcessing) => set((state) => ({ blindStrategist: { ...state.blindStrategist, isProcessing } })),
  setAudioBrief: (widgetId, text) => set((state) => ({ audioBriefs: { ...state.audioBriefs, [widgetId]: text } })),

  setInventoryAlerts: (alerts) => set({ inventoryAlerts: alerts }),

  startFocusSession: (taskName, microSteps) => set({ 
    focusSession: { isActive: true, taskName, microSteps, currentStepIndex: 0, streak: 0, startTime: Date.now(), lastStepChangeTime: Date.now() },
    uiContext: { ...get().uiContext, cognitiveMode: 'FOCUS_SINGLE_TASK' }
  }),
  completeMicroStep: () => set((state) => {
    const nextIndex = state.focusSession.currentStepIndex + 1;
    if (nextIndex >= state.focusSession.microSteps.length) {
      return { 
        focusSession: { ...state.focusSession, isActive: false, streak: state.focusSession.streak + 1 },
        uiContext: { ...state.uiContext, cognitiveMode: 'STRATEGY_OVERVIEW' }
      };
    }
    return { 
      focusSession: { ...state.focusSession, currentStepIndex: nextIndex, lastStepChangeTime: Date.now() }
    };
  }),
  endFocusSession: () => set((state) => ({ 
    focusSession: { ...state.focusSession, isActive: false },
    uiContext: { ...state.uiContext, cognitiveMode: 'STRATEGY_OVERVIEW' }
  })),
  setLastActiveContext: (ctx) => set({ lastActiveContext: ctx }),

  addOracleAlert: (alert) => set((state) => ({ oracleAlerts: [...state.oracleAlerts, alert] })),
  dismissOracleAlert: (id) => set((state) => ({ oracleAlerts: state.oracleAlerts.filter(a => a.id !== id) })),

  addMemory: (memory) => set((state) => ({ memories: [memory, ...state.memories] })),

  setEmails: (emails) => set({ emails }),
  setProcessingEmails: (loading) => set({ isProcessingEmails: loading }),
  setSelectedEmailId: (id) => set({ selectedEmailId: id }),
  markEmailRead: (id) => set(s => ({ emails: s.emails.map(e => e.id === id ? { ...e, isRead: true } : e) })),
  archiveEmail: (id) => set(s => ({ emails: s.emails.filter(e => e.id !== id) })),

  addLead: (lead) => set(s => ({ 
    leadInterceptor: { 
       ...s.leadInterceptor, 
       leads: [lead, ...s.leadInterceptor.leads],
       stats: { ...s.leadInterceptor.stats, total: s.leadInterceptor.stats.total + 1, waiting: s.leadInterceptor.stats.waiting + 1 }
    } 
  })),
  updateLead: (id, updates) => set(s => {
     const updatedLeads = s.leadInterceptor.leads.map(l => l.id === id ? { ...l, ...updates } : l);
     const waiting = updatedLeads.filter(l => l.status === 'NEW' || l.status === 'REQUIRES_ACTION').length;
     const converted = updatedLeads.filter(l => l.status === 'CONVERTED').length;
     return {
        leadInterceptor: {
           ...s.leadInterceptor,
           leads: updatedLeads,
           stats: { ...s.leadInterceptor.stats, waiting, converted }
        }
     };
  }),
  addLeadMessage: (leadId, msg) => set(s => ({
     leadInterceptor: {
        ...s.leadInterceptor,
        leads: s.leadInterceptor.leads.map(l => l.id === leadId ? { ...l, history: [...l.history, msg], lastMessage: msg.text, timestamp: msg.timestamp } : l)
     }
  })),
  setLeadSimulating: (loading) => set(s => ({ leadInterceptor: { ...s.leadInterceptor, isSimulatingLead: loading } })),

  setFeatureProposals: (proposals) => set({ featureProposals: proposals }),
  setResearchingFeatures: (loading) => set({ isResearchingFeatures: loading }),

  setTeam: (team) => set({ team }),

  startBoardRoomSession: (topic) => set((state) => ({ boardRoom: { ...state.boardRoom, isActive: true, topic, messages: [] } })),
  setBoardRoomThinking: (thinking) => set((state) => ({ boardRoom: { ...state.boardRoom, isThinking: thinking } })),
  setBoardRoomConsensus: (consensus) => set((state) => ({ boardRoom: { ...state.boardRoom, consensus } })),
  addBoardRoomMessage: (msg) => set((state) => ({ boardRoom: { ...state.boardRoom, messages: [...state.boardRoom.messages, msg] } })),
  updateBoardRoomState: (updates) => set(state => ({ boardRoom: { ...state.boardRoom, ...updates } })),

  addLogEntry: (entry) => set((state) => ({ journal: [entry, ...state.journal] })),
  deleteLogEntry: (id) => set((state) => ({ journal: state.journal.filter(e => e.id !== id) })),

  setCompetitors: (competitors) => set({ competitors }),
  setAnalyzingCompetitors: (analyzing) => set({ isAnalyzingCompetitors: analyzing }),

  setLocationAnalysis: (analysis) => set({ locationAnalysis: analysis }),
  setAnalyzingLocation: (analyzing) => set({ isAnalyzingLocation: analyzing }),

  setFinancialInputs: (inputs) => set({ financialInputs: inputs }),
  setFinancialHealth: (health) => set({ financialHealth: health }),
  setAnalyzingFinance: (analyzing) => set({ isAnalyzingFinance: analyzing }),

  setPitchDeck: (deck) => set({ pitchDeck: deck }),
  setGeneratingPitch: (generating) => set({ isGeneratingPitch: generating }),

  addCampaign: (campaign) => set((state) => ({ campaigns: [campaign, ...state.campaigns] })),
  setGeneratingCampaign: (generating) => set({ isGeneratingCampaign: generating }),

  initSimulation: (cash) => set({ simulation: { isActive: true, currentEvent: null, history: [], cashBalance: cash, reputationScore: 100, month: 1 } }),
  setCrisisEvent: (event) => set((state) => ({ simulation: { ...state.simulation, currentEvent: event } })),
  applySimulationResult: (result, choice) => set((state) => ({ 
    simulation: { 
      ...state.simulation, 
      currentEvent: null, 
      history: [{ event: state.simulation.currentEvent, choice, result }, ...state.simulation.history],
      cashBalance: state.simulation.cashBalance + result.financialImpact,
      reputationScore: Math.min(100, Math.max(0, state.simulation.reputationScore + result.reputationImpact)),
      month: state.simulation.month + 1
    } 
  })),
  setSimulating: (simulating) => set({ isSimulating: simulating }),

  setVisionModalOpen: (open) => set({ isVisionModalOpen: open }),

  setDossier: (dossier) => set((state) => ({ research: { ...state.research, dossier } })),
  updateDossier: (updates) => set((state) => ({ research: { ...state.research, dossier: { ...state.research.dossier!, ...updates } } })),
  setSentiment: (sentiment) => set((state) => ({ research: { ...state.research, sentiment } })),

  reset: () => set({ context: null, hasStartedOnboarding: false, widgets: [] })
}));

function mapModeToProfile(mode: AccessibilityMode): 'BLIND' | 'DEAF' | 'ADHD' | 'NEUROTYPICAL' {
  switch (mode) {
    case AccessibilityMode.SONIC_VIEW: return 'BLIND';
    case AccessibilityMode.SENTIMENT_HUD: return 'DEAF';
    case AccessibilityMode.FOCUS_SHIELD: return 'ADHD';
    default: return 'NEUROTYPICAL';
  }
}
