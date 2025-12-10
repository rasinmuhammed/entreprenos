
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
  EMAIL_CLIENT = "EMAIL_CLIENT",
  DIGITAL_PRESENCE = "DIGITAL_PRESENCE"
}

// --- AUTH TYPES ---
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'FOUNDER' | 'ALLY' | 'ADMIN';
  onboarded: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// --- 1. MORPHING UI TYPES ---
export type CognitiveMode = 'FOCUS_SINGLE_TASK' | 'STRATEGY_OVERVIEW' | 'CRISIS_ALERT' | 'MOBILE_QUICK_ACTIONS';
export type DisabilityProfile = 'BLIND' | 'DEAF' | 'ADHD' | 'MOTOR' | 'NEUROTYPICAL' | 'MULTIPLE';
export type DeviceType = 'DESKTOP' | 'MOBILE';

export interface UIContext {
  userId: string;
  disabilityProfile: DisabilityProfile;
  device: DeviceType;
  cognitiveMode: CognitiveMode;
  currentModule?: View;
}

export type LayoutComponentType = 'PANEL' | 'CARD' | 'HUD_OVERLAY' | 'AUDIO_STREAM' | 'TASK_LIST' | 'CHAT_STREAM' | 'NAVIGATION';

export interface LayoutComponent {
  id: string;
  type: LayoutComponentType;
  gridArea?: string; // CSS Grid Area
  props: Record<string, any>;
  children?: LayoutComponent[];
}

export interface LayoutConfig {
  layoutId: string;
  containerClass: string; // Tailwind classes for the main grid
  components: LayoutComponent[];
}

// --- 2. BOARDROOM AGENT TYPES ---
export type BoardRole = 'CEO' | 'CFO' | 'REALIST';

export interface BoardMessage {
  id: string;
  role: BoardRole | 'SYSTEM' | 'USER';
  content: string;
  timestamp: number;
}

export interface StrategyQuestion {
  id: string;
  userId: string;
  question: string;
  priorities: ('CASH_FLOW' | 'GROWTH' | 'RISK_REDUCTION')[];
  timeHorizon?: string;
  contextDocs?: string[];
}

export interface StrategyAnswer {
  questionId: string;
  boardTranscript: BoardMessage[];
  finalRecommendation: string;
  risks: string[];
  alternatives: string[];
}

// --- 3. AGENT ORCHESTRATION TYPES ---
export type AgentTaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type AgentTaskType = 'GEOSPATIAL_SCAN' | 'MARKET_INTEL' | 'DIGITAL_FOOTPRINT' | 'BOARD_DEBATE' | 'TASK_EXPLOSION';

export interface AgentTask {
  id: string;
  type: AgentTaskType;
  status: AgentTaskStatus;
  payload: any;
  result?: any;
  createdAt: number;
  updatedAt: number;
}

// --- 4. MICRO-TASK TYPES (ADHD) ---
export interface MicroTask {
  id: string;
  title: string;
  description?: string;
  estMinutes: number;
  dependencies: string[]; // IDs of tasks that must be done first
  isComplete: boolean;
  rewardPoints: number;
}

export interface MicroTaskPlan {
  taskId: string;
  title: string; // The high-level goal
  microTasks: MicroTask[];
  createdAt: number;
}

// --- LEAD INTERCEPTOR TYPES ---
export type LeadChannel = 'WHATSAPP' | 'INSTAGRAM' | 'GOOGLE' | 'EMAIL' | 'PHONE';
export type LeadStatus = 'NEW' | 'AUTO_RESPONDED' | 'REQUIRES_ACTION' | 'CONVERTED' | 'LOST';

export interface LeadMessage {
  id: string;
  sender: 'customer' | 'ai' | 'user';
  text: string;
  timestamp: number;
}

export interface Lead {
  id: string;
  name: string; // e.g., phone number or handle
  channel: LeadChannel;
  status: LeadStatus;
  lastMessage: string;
  timestamp: number; // Last activity
  history: LeadMessage[];
  intent?: 'INQUIRY' | 'ORDER' | 'COMPLAINT' | 'OTHER';
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  value?: number; // Potential value
}

// --- FEATURE LAB TYPES ---
export interface FeatureProposal {
  id: string;
  title: string;
  tagline: string;
  description: string;
  riceScore: number; // Reach, Impact, Confidence, Effort (0-100)
  feasibility: 'High' | 'Medium' | 'Low';
  competitorAdoption: string; // e.g., "Standard in industry" or "Blue Ocean"
  implementationSteps: string[];
  expectedROI: string;
}

// --- TEAM TYPES ---
export interface AIEmployee {
  id: string;
  role: string; // e.g., "Inventory Manager"
  name: string;
  specialty: string; // e.g. "Supply Chain Optimization"
  personality: string; // e.g. "Detail-oriented and cautious"
  activeTask: string | null;
  status: 'IDLE' | 'WORKING' | 'THINKING';
}

// --- EXISTING TYPES (Legacy Support) ---
export enum AccessibilityMode {
  STANDARD = "STANDARD",
  SONIC_VIEW = "SONIC_VIEW",       
  FOCUS_SHIELD = "FOCUS_SHIELD",   
  SENTIMENT_HUD = "SENTIMENT_HUD"  
}

export enum ThemeMode {
  NEBULA = "NEBULA", 
  EARTH = "EARTH"    
}

export interface LiveConnectionState {
  isConnected: boolean;
  isStreaming: boolean;
  isThinking: boolean;
  volumeLevel: number; 
  privacyMode: 'PUBLIC' | 'PRIVATE';
}

export type SentimentTone = 'positive' | 'negative' | 'neutral' | 'skeptical' | 'excited' | 'conflict';

export interface SentimentFrame {
  id: string;
  speaker: string;
  tone: SentimentTone;
  text: string;
  timestamp: number;
  intensity: number;
}

export interface SpatialMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface BlindStrategistState {
  isActive: boolean;
  imageUrl: string | null;
  messages: SpatialMessage[];
  isProcessing: boolean;
}

export interface FocusSession {
  isActive: boolean;
  taskName: string;
  microSteps: MicroTask[];
  currentStepIndex: number;
  streak: number;
  startTime: number;
  lastStepChangeTime: number; 
}

export interface InventoryAlert {
  item: string;
  currentCount: number;
  parLevel: number;
  status: 'OK' | 'LOW' | 'CRITICAL';
}

export interface OracleAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  action: string;
  timestamp: number;
}

export interface MemoryFragment {
  id: string;
  timestamp: number;
  event: 'decision' | 'insight' | 'crisis';
  summary: string;
}

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
  COMMUNICATIONS = "COMMUNICATIONS",
  LEAD_INTERCEPTOR = "LEAD_INTERCEPTOR",
  FEATURE_LAB = "FEATURE_LAB",
  TEAM = "TEAM"
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
  theme: ThemeMode;
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
  // New structured fields
  activeQuestionId?: string;
  transcript?: BoardMessage[];
  recommendation?: string;
  risks?: string[];
  alternatives?: string[];
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
  energyLevel?: string;
  // New Genesis Interview Fields
  revenueModel?: string;
  targetAudience?: string;
  differentiator?: string;
  bottleneck?: string;
}

export interface DigitalAudit {
  presenceScore: number;
  websiteStatus: "Active" | "Missing" | "Outdated";
  websiteUrl?: string;
  googleMapsStatus: "Claimed" | "Unclaimed" | "Missing";
  googleMapsUrl?: string;
  socialPresence: "Strong" | "Weak" | "None";
  socialLinks?: { platform: string; url: string; followers?: string }[];
  reviews?: { count: number; rating: number; source: string }[];
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
