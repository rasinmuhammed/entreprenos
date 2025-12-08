
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
  SWOT_TACTICAL = "SWOT_TACTICAL",
  INVENTORY_TRACKER = "INVENTORY_TRACKER",
  SUBSCRIPTION_METRICS = "SUBSCRIPTION_METRICS",
  CLIENT_PIPELINE = "CLIENT_PIPELINE",
  GENERATIVE_UI = "GENERATIVE_UI",
  EMAIL_CLIENT = "EMAIL_CLIENT"
}

// --- ACCESSIBILITY MODES ---
export enum AccessibilityMode {
  STANDARD = "STANDARD",
  SONIC_VIEW = "SONIC_VIEW",       // Blind: Spatial Audio + Linear
  FOCUS_SHIELD = "FOCUS_SHIELD",   // ADHD: Tunnel Vision + Micro-Steps
  SENTIMENT_HUD = "SENTIMENT_HUD"  // Deaf: Subtext Visualization
}

export interface LiveConnectionState {
  isConnected: boolean;
  isStreaming: boolean;
  isThinking: boolean;
  volumeLevel: number; 
}

// --- SENTIMENT HUD TYPES ---
export type SentimentTone = 'positive' | 'negative' | 'neutral' | 'skeptical' | 'excited' | 'conflict';

export interface SentimentFrame {
  id: string;
  speaker: string;
  tone: SentimentTone;
  text: string;
  timestamp: number;
  intensity: number; // 0-1
}

// --- SPATIAL CHAT TYPES (Sonic View) ---
export interface SpatialMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface SpatialChatState {
  isActive: boolean;
  imageUrl: string | null;
  messages: SpatialMessage[];
  isProcessing: boolean;
}

// --- MICRO SPRINTER TYPES (Focus Shield) ---
export interface MicroTask {
  id: string;
  text: string;
  isComplete: boolean;
  durationMinutes?: number;
}

export interface FocusSession {
  isActive: boolean;
  taskName: string;
  microSteps: MicroTask[];
  currentStepIndex: number;
  streak: number;
  startTime: number;
}

// --- INVENTORY SONAR TYPES ---
export interface InventoryAlert {
  item: string;
  currentCount: number;
  parLevel: number;
  status: 'OK' | 'LOW' | 'CRITICAL';
}

// --- EMAIL AGENT TYPES ---
export interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  body: string;
  receivedAt: number;
  isRead: boolean;
  priority: 'High' | 'Normal' | 'Low';
  aiSummary: string;
  suggestedReply?: string;
  tags: string[];
}

// --- EXISTING TYPES ---
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
  LOCAL_INTEL = "LOCAL_INTEL",
  FINANCE = "FINANCE",
  PITCH_DECK = "PITCH_DECK",
  MARKETING = "MARKETING",
  SIMULATOR = "SIMULATOR",
  COMMUNICATIONS = "COMMUNICATIONS"
}

export enum LogType {
  THOUGHT = "THOUGHT",
  DECISION = "DECISION",
  LESSON = "LESSON",
  MISTAKE = "MISTAKE"
}

export type GenUIElementType = "layout" | "card" | "text" | "button" | "metric" | "chart" | "list" | "image" | "divider";

export interface GenUIElement {
  id: string;
  type: GenUIElementType;
  props?: Record<string, any>;
  children?: GenUIElement[];
}

export interface WidgetData {
  id: string;
  type: WidgetType;
  title: string;
  gridArea?: string;
  content: any;
  genUISchema?: GenUIElement;
}

export interface LogEntry {
  id: string;
  type: LogType;
  content: string;
  timestamp: number;
  tags: string[];
}

export interface BusinessContext {
  name: string;
  businessName: string;
  description: string;
  industry: string;
  stage: string;
  location?: string;
  generatedAt: number;
  accessibilityMode: AccessibilityMode;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system' | AgentPersona;
  text: string;
  timestamp: number;
  thoughtSignature?: string;
}

export interface BoardRoomState {
  isActive: boolean;
  topic: string;
  consensus: string | null;
  messages: ChatMessage[];
  isThinking: boolean;
  currentThought?: string;
}

export interface CompetitorEntity {
  name: string;
  website?: string;
  description: string;
  marketShare: number;
  threatLevel: "Low" | "Medium" | "High";
  strengths: string[];
  weaknesses: string[];
  pricingModel: string;
  strategicMove: string;
}

export interface EntityDossier {
  name: string;
  foundingDate?: string;
  founders: string[];
  coreProduct: string;
  industry: string;
  website?: string;
  description: string;
  location?: string;
}

export interface DigitalAudit {
  presenceScore: number;
  websiteStatus: "Active" | "Missing" | "Outdated";
  googleMapsStatus: "Claimed" | "Unclaimed" | "Missing";
  socialPresence: "Strong" | "Weak" | "None";
  missingAssets: string[];
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

export interface LocationAnalysis {
  nearbyEntities: any[];
  strategies: any[];
  footTrafficScore: number;
  summary: string;
}

export interface FinancialInputs {
  cashOnHand: number;
  monthlyBurn: number;
  monthlyRevenue: number;
  growthRate: number;
}

export interface FinancialScenario {
  name: string;
  runwayMonths: number;
  profitabilityDate: string;
  projectionData: number[];
  advice: string;
}

export interface FinancialHealth {
  scenarios: FinancialScenario[];
  cfoCritique: string;
  burnRateAssessment: "Healthy" | "High" | "Critical";
}

export interface PitchDeck {
  slides: any[];
  generatedAt: number;
}

export type MarketingChannel = 'LinkedIn' | 'Twitter' | 'Instagram' | 'Email' | 'Blog' | 'Other';

export interface MarketingPost {
  id: string;
  channel: MarketingChannel;
  week: number;
  copy: string;
  hashtags?: string[];
  visualPrompt?: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  goal: string;
  strategySummary: string;
  posts: MarketingPost[];
}

export interface SimulationState {
  isActive: boolean;
  currentEvent: any;
  history: any[];
  cashBalance: number;
  reputationScore: number;
  month: number;
}

export interface CrisisEvent {
  id: string;
  title: string;
  description: string;
  type: string;
  choices: CrisisChoice[];
}

export interface CrisisChoice {
  id: string;
  title: string;
  description: string;
  riskLevel: string;
}

export interface SimulationResult {
  outcomeTitle: string;
  outcomeDescription: string;
  financialImpact: number;
  reputationImpact: number;
  survived: boolean;
}

export interface VisionAnalysis {
  detectedType: string;
  summary: string;
  suggestedActions: string[];
  dataPayload: any;
}

export interface SaaSOnboardingData {
  businessName: string;
  industry: string;
  location: string;
  description: string;
  goals: string[];
  integrations: string[];
  operationalStyle: string;
  digitalMaturity: string;
}
