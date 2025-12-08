
export enum WidgetType {
  METRIC_CARD = "METRIC_CARD",
  KANBAN_BOARD = "KANBAN_BOARD",
  DATA_LIST = "DATA_LIST",
  ALERT_PANEL = "ALERT_PANEL",
  ROADMAP_STRATEGY = "ROADMAP_STRATEGY",
  COMPETITOR_RADAR = "COMPETITOR_RADAR",
  INTEGRATION_HUB = "INTEGRATION_HUB",
  STARTUP_JOURNEY = "STARTUP_JOURNEY",
  LOCATION_MAP = "LOCATION_MAP",
  GROWTH_TACTICS = "GROWTH_TACTICS",
  // New Adaptive Widgets
  SWOT_TACTICAL = "SWOT_TACTICAL",
  INVENTORY_TRACKER = "INVENTORY_TRACKER",
  SUBSCRIPTION_METRICS = "SUBSCRIPTION_METRICS",
  CLIENT_PIPELINE = "CLIENT_PIPELINE"
}

export enum AgentPersona {
  CEO = "CEO",
  CFO = "CFO",
  REALIST = "MARKET_REALIST"
}

export enum View {
  DASHBOARD = "DASHBOARD",
  BOARDROOM = "BOARDROOM",
  JOURNAL = "JOURNAL",
  COMPETITORS = "COMPETITORS",
  LOCAL_INTEL = "LOCAL_INTEL"
}

export enum LogType {
  THOUGHT = "THOUGHT",
  DECISION = "DECISION",
  LESSON = "LESSON",
  MISTAKE = "MISTAKE"
}

export interface LogEntry {
  id: string;
  type: LogType;
  content: string;
  timestamp: number;
  tags: string[];
}

export interface WidgetData {
  id: string;
  type: WidgetType;
  title: string;
  gridArea?: string;
  content: any;
}

export interface BusinessContext {
  name: string;
  businessName: string;
  description: string;
  industry: string;
  stage: string;
  location?: string;
  generatedAt: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system' | AgentPersona;
  text: string;
  timestamp: number;
}

export interface BoardRoomState {
  isActive: boolean;
  topic: string;
  consensus: string | null;
  messages: ChatMessage[];
  isThinking: boolean;
}

export interface CompetitorEntity {
  name: string;
  website?: string;
  description: string;
  marketShare: number; // 0-100 estimate
  threatLevel: "Low" | "Medium" | "High";
  strengths: string[];
  weaknesses: string[];
  pricingModel: string;
  strategicMove: string; // "Launching AI features", "Aggressive hiring", etc.
}

// -- New Intelligence Gathering Types --

export interface EntityDossier {
  name: string;
  foundingDate?: string;
  founders: string[];
  coreProduct: string;
  industry: string;
  website?: string;
  description: string;
  location?: string; // e.g. "Brooklyn, NY" or "Global"
}

export interface DigitalAudit {
  presenceScore: number; // 0-100
  websiteStatus: "Active" | "Missing" | "Outdated";
  googleMapsStatus: "Claimed" | "Unclaimed" | "Missing";
  socialPresence: "Strong" | "Weak" | "None";
  missingAssets: string[]; // ["Google Business Profile", "Instagram"]
}

export interface SentimentReport {
  overallSentiment: "Positive" | "Neutral" | "Negative" | "Mixed";
  keyPraises: string[];
  keyComplaints: string[];
  recentEvents: string[];
  audit?: DigitalAudit;
}

export interface ConsultationQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface BusinessProfile {
  answers: { question: string; answer: string }[];
}

export interface ResearchGathered {
  dossier: EntityDossier | null;
  sentiment: SentimentReport | null;
  questions: ConsultationQuestion[];
  profile: BusinessProfile | null;
}

// -- Local Intelligence Types --

export interface NearbyEntity {
  name: string;
  type: string; // e.g., "Hospital", "University"
  distance: string;
  impactLevel: "High" | "Medium" | "Low";
  reasoning: string; // "Hospital staff need quick coffee/lunch"
}

export interface LocationStrategy {
  title: string;
  description: string;
  targetAudience: string;
}

export interface LocationAnalysis {
  nearbyEntities: NearbyEntity[];
  strategies: LocationStrategy[];
  footTrafficScore: number; // 0-100
  summary: string;
}
