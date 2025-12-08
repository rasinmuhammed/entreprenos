import { create } from 'zustand';
import { BusinessContext, WidgetData, BoardRoomState, ChatMessage, AgentPersona, ResearchGathered, ConsultationQuestion, BusinessProfile, View, LogEntry, LogType, CompetitorEntity, LocationAnalysis } from '../types';

interface AppState {
  context: BusinessContext | null;
  widgets: WidgetData[];
  currentView: View;
  
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

  // Onboarding Research State
  research: ResearchGathered;
  
  // Actions
  setContext: (context: BusinessContext) => void;
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
  context: null,
  widgets: [],
  currentView: View.DASHBOARD,
  
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

  research: {
    dossier: null,
    sentiment: null,
    questions: [],
    profile: null
  },

  setContext: (context) => set({ context }),
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
    context: null,
    widgets: [],
    currentView: View.DASHBOARD,
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
    isAnalyzingLocation: false
  })
}));