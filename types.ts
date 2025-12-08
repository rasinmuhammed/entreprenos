
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
  GENERATIVE_UI = "GENERATIVE_UI"
}

// --- NEW ACCESSIBILITY TYPES ---
export enum AccessibilityMode {
  STANDARD = "STANDARD",
  SONIC_VIEW = "SONIC_VIEW",       // For Blind Users (Linear, Audio-First)
  FOCUS_SHIELD = "FOCUS_SHIELD",   // For Neurodivergent (Minimalist, Tunnel Vision)
  SENTIMENT_HUD = "SENTIMENT_HUD"  // For Deaf (Visual Tone Indicators)
}

export interface LiveConnectionState {
  isConnected: boolean;
  isStreaming: boolean;
  isThinking: boolean;
  volumeLevel: number; // 0-1 for visualizer
}

export interface LiveConfig {
  voiceName: string;
  systemInstruction: string;
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
  SIMULATOR = "SIMULATOR"
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
  accessibilityMode: AccessibilityMode; // Added to context
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

export interface NearbyEntity {
  name: string;
  type: string;
  distance: string;
  impactLevel: "High" | "Medium" | "Low";
  reasoning: string;
}

export interface LocationStrategy {
  title: string;
  description: string;
  targetAudience: string;
}

export interface LocationAnalysis {
  nearbyEntities: NearbyEntity[];
  strategies: LocationStrategy[];
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
  name: "Conservative" | "Aggressive" | "Survival";
  runwayMonths: number;
  profitabilityDate: string | "Never";
  advice: string;
  projectionData: number[];
}

export interface FinancialHealth {
  scenarios: FinancialScenario[];
  cfoCritique: string;
  burnRateAssessment: "Healthy" | "High" | "Critical";
}

export interface PitchSlide {
  title: string;
  subtitle: string;
  contentPoints: string[];
  visualPrompt: string;
  speakerNotes: string;
}

export interface PitchDeck {
  slides: PitchSlide[];
  generatedAt: number;
}

export type MarketingChannel = "LinkedIn" | "Twitter" | "Instagram" | "Email" | "Blog";

export interface ContentPost {
  id: string;
  channel: MarketingChannel;
  week: number;
  title: string;
  copy: string;
  visualPrompt: string;
  hashtags: string[];
}

export interface MarketingCampaign {
  id: string;
  name: string;
  goal: string;
  generatedAt: number;
  strategySummary: string;
  posts: ContentPost[];
}

export interface CrisisChoice {
  id: "A" | "B" | "C";
  title: string;
  description: string;
  riskLevel: "Low" | "Medium" | "High";
}

export interface CrisisEvent {
  id: string;
  title: string;
  description: string;
  type: "Financial" | "PR" | "Market" | "Operational";
  choices: CrisisChoice[];
}

export interface SimulationResult {
  outcomeTitle: string;
  outcomeDescription: string;
  financialImpact: number;
  reputationImpact: number;
  survived: boolean;
}

export interface SimulationState {
  isActive: boolean;
  currentEvent: CrisisEvent | null;
  history: { event: CrisisEvent, choice: CrisisChoice, result: SimulationResult }[];
  cashBalance: number;
  reputationScore: number;
  month: number;
}

export interface VisionAnalysis {
  detectedType: "COMPETITOR_PRICING" | "SKETCH_WIREFRAME" | "PHYSICAL_INVENTORY" | "UNKNOWN";
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
}
