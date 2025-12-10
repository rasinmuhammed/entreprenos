
import { GoogleGenAI } from "@google/genai";
import { WidgetType, AgentPersona, EntityDossier, SentimentReport, ConsultationQuestion, BusinessProfile, CompetitorEntity, BusinessContext, LocationAnalysis, FinancialInputs, FinancialHealth, PitchDeck, MarketingCampaign, CrisisEvent, CrisisChoice, SimulationResult, VisionAnalysis, GenUIElement, AccessibilityMode, SaaSOnboardingData, Email, MicroTask, SpatialMessage, OracleAlert, WidgetData, MicroTaskPlan, Lead, LeadStatus, LeadChannel, FeatureProposal } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Robust JSON Extraction ---
const extractJSON = (text: string) => {
  if (!text) return null;
  // Remove markdown blocks if present
  let cleanText = text.replace(/```json/g, '').replace(/```/g, '');
  
  // Attempt to find the first '{' or '['
  const firstOpenBrace = cleanText.indexOf('{');
  const firstOpenBracket = cleanText.indexOf('[');
  
  let startIndex = -1;
  let isArray = false;

  if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
    startIndex = firstOpenBrace;
  } else if (firstOpenBracket !== -1) {
    startIndex = firstOpenBracket;
    isArray = true;
  }

  if (startIndex === -1) return null;

  cleanText = cleanText.substring(startIndex);

  // Simple attempt: try parsing the whole substring first
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // If that fails, try to find the matching closing brace/bracket
    let balance = 0;
    let inString = false;
    let escape = false;
    const openChar = isArray ? '[' : '{';
    const closeChar = isArray ? ']' : '}';

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      if (escape) { escape = false; continue; }
      if (char === '\\') { escape = true; continue; }
      if (char === '"') { inString = !inString; continue; }
      
      if (!inString) {
        if (char === openChar) balance++;
        else if (char === closeChar) {
          balance--;
          if (balance === 0) {
            try {
              return JSON.parse(cleanText.substring(0, i + 1));
            } catch (err) {
              console.error("JSON Parse Error on substring", err);
              return null;
            }
          }
        }
      }
    }
  }
  return null;
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const WIDGET_SCHEMA_INSTRUCTION = `
CRITICAL: Return JSON with this EXACT structure. The 'content' field is MANDATORY and must contain the data.
{
  "widgets": [
    {
      "id": "unique_id",
      "type": "METRIC_CARD", 
      "title": "Title",
      "content": {
        // Specific data fields go here
        "value": "...", 
        "unit": "...", 
        "trend": "up|down"
      }
    }
  ]
}

Supported Types & Content Schemas:
- METRIC_CARD: { "value": "10k", "unit": "MRR", "trend": "up" }
- ALERT_PANEL: { "severity": "high", "message": "Text" }
- GROWTH_TACTICS: { "tactics": [{ "title": "SEO", "roi": "High", "effort": "Med", "description": "..." }] }
- COMPETITOR_RADAR: { "competitors": [{ "name": "Comp A", "marketShare": 20, "threatLevel": "High" }] }
`;

// --- CORE SERVICES ---

export const analyzeLocationLeverage = async (context: BusinessContext): Promise<LocationAnalysis> => {
  const ai = getClient();
  const prompt = `
    ROLE: Hyper-Local Business Strategist.
    CONTEXT: ${context.businessName} (${context.industry}) located at "${context.location}".
    
    TASK: Perform a geospatial analysis of the location.
    1. Identify 3-5 likely nearby traffic generators (e.g., "Central Station", "City Park", "University", "Mall").
    2. Assess the foot traffic score (0-100) based on typical density for this type of location.
    3. Generate specific strategies to leverage these neighbors.
    
    OUTPUT JSON:
    {
      "nearbyEntities": [
        { "name": "Name", "distance": "0.5km", "type": "Transport|Retail|Corporate", "impactLevel": "High|Medium|Low", "reasoning": "Why it matters" }
      ],
      "footTrafficScore": 85,
      "summary": "Strategic assessment of location leverage...",
      "strategies": [
        { "title": "Strategy Name", "description": "Actionable tactic", "targetAudience": "Audience segment" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const data = extractJSON(response.text);
    if (!data) throw new Error("No data returned");
    return data;
  } catch (e) {
    console.warn("Location Analysis Fallback", e);
    return {
      nearbyEntities: [
         { name: "Local Commerce Hub", distance: "< 1km", type: "Retail", impactLevel: "Medium", reasoning: "General commercial activity area." },
         { name: "Residential Zone", distance: "0.5km", type: "Community", impactLevel: "High", reasoning: "Core customer base." }
      ],
      footTrafficScore: 60,
      summary: "Precise geospatial data unavailable. Strategies based on general location profile.",
      strategies: [
         { title: "Community Outreach", description: "Engage with local residential associations.", targetAudience: "Locals" },
         { title: "Digital Geofencing", description: "Target ads to users within 1km radius.", targetAudience: "Mobile Users" }
      ]
    };
  }
};

export const processSaaSOnboarding = async (data: SaaSOnboardingData): Promise<EntityDossier> => {
  const ai = getClient();
  const prompt = `Convert this onboarding data into a business dossier: ${JSON.stringify(data)}`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return extractJSON(response.text) || { name: data.businessName, description: data.description, industry: data.industry, founders: [], coreProduct: "SaaS Platform" };
  } catch {
    return { name: data.businessName, description: data.description, industry: data.industry, founders: [], coreProduct: "SaaS Platform" };
  }
};

export const analyzeMultimodalPitch = async (audioBlob: Blob, videoBlob: Blob): Promise<EntityDossier> => {
  const ai = getClient();
  
  try {
    const base64Video = await blobToBase64(videoBlob);
    
    const prompt = `
      ROLE: Venture Capital Analyst & OCR Specialist.
      TASK: Analyze this video pitch. 
      1. Listen to the audio for business description and goals.
      2. VISUALLY SCAN for any business cards, logos, or products shown. EXTRACT TEXT ACCURATELY.
      3. Fuse audio and visual data to create a business dossier.

      OUTPUT JSON:
      {
        "name": "Detected Business Name (from card or audio)",
        "industry": "Industry Sector",
        "description": "2 sentence summary of what they do",
        "founders": ["Names detected"],
        "coreProduct": "Main product/service",
        "location": "City/Region detected"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
         { inlineData: { mimeType: "video/webm", data: base64Video } },
         { text: prompt }
      ],
      config: { responseMimeType: 'application/json' }
    });

    const data = extractJSON(response.text);
    if (!data) throw new Error("Analysis failed");

    return {
      name: data.name || "New Venture",
      industry: data.industry || "General",
      description: data.description || "No description detected.",
      founders: data.founders || ["You"],
      coreProduct: data.coreProduct || "Unknown",
      location: data.location || "Global"
    };

  } catch (err) {
    console.error("Multimodal analysis failed", err);
    return {
      name: "Detected Venture",
      industry: "Tech",
      description: "Analysis failed, please type details.",
      founders: ["You"],
      coreProduct: "Innovation",
      location: "Global"
    };
  }
};

export const performDeepResearch = async (dossier: EntityDossier): Promise<SentimentReport> => {
  const ai = getClient();
  const prompt = `Simulate a sentiment report for: ${dossier.name} (${dossier.industry}). Return JSON with overallSentiment, keyPraises, keyComplaints.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return extractJSON(response.text) || { overallSentiment: "Neutral", keyPraises: [], keyComplaints: [], recentEvents: [] };
  } catch {
    return { overallSentiment: "Neutral", keyPraises: [], keyComplaints: [], recentEvents: [] };
  }
};

export const constructDashboard = async (dossier: EntityDossier, sentiment: SentimentReport): Promise<{ widgets: WidgetData[] }> => {
  const ai = getClient();
  const prompt = `
    Create 5 dashboard widgets for: ${dossier.name}, Industry: ${dossier.industry}.
    Include types: METRIC_CARD, ALERT_PANEL, GROWTH_TACTICS, COMPETITOR_RADAR.
    
    ${WIDGET_SCHEMA_INSTRUCTION}
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return extractJSON(response.text) || { widgets: [] };
  } catch {
    return { widgets: [] };
  }
};

export const analyzeSalesData = async (text: string, context: BusinessContext): Promise<{ widgets: WidgetData[] }> => {
  const ai = getClient();
  const prompt = `Analyze this sales data for ${context.businessName}: ${text.substring(0, 1000)}. Return 2 widgets (METRIC_CARD, CHART) in JSON. ${WIDGET_SCHEMA_INSTRUCTION}`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return extractJSON(response.text) || { widgets: [] };
  } catch { return { widgets: [] }; }
};

export const fetchBusinessProfileDetails = async (name: string): Promise<{ widgets: WidgetData[] }> => {
  // Simulation
  return {
    widgets: [{
      id: Math.random().toString(),
      type: WidgetType.DIGITAL_PRESENCE,
      title: "Digital Footprint",
      content: { presenceScore: 82, websiteStatus: "Active", googleMapsStatus: "Claimed", socialPresence: "Strong" }
    }]
  };
};

export const analyzeCompetitors = async (context: BusinessContext): Promise<{ competitors: CompetitorEntity[] }> => {
  const ai = getClient();
  const prompt = `Identify 3 competitors for a ${context.industry} business named ${context.businessName}. Return JSON array of competitors.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const data = extractJSON(response.text);
    return { competitors: Array.isArray(data) ? data : (data?.competitors || []) };
  } catch { return { competitors: [] }; }
};

export const analyzeFinancialHealth = async (inputs: FinancialInputs, context: BusinessContext): Promise<FinancialHealth> => {
  const ai = getClient();
  const prompt = `Analyze financial health for ${context.businessName} with inputs: ${JSON.stringify(inputs)}. Return JSON FinancialHealth object with scenarios.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return extractJSON(response.text) || { scenarios: [], cfoCritique: "Insufficient data.", burnRateAssessment: "Healthy" };
  } catch {
    return { scenarios: [], cfoCritique: "Analysis error.", burnRateAssessment: "Healthy" };
  }
};

export const generatePitchDeck = async (context: BusinessContext, dossier: any, competitors: any, financials: any): Promise<PitchDeck> => {
  const ai = getClient();
  const prompt = `Generate a 5-slide pitch deck for ${context.businessName}. Return JSON PitchDeck object.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return extractJSON(response.text) || { slides: [], generatedAt: Date.now() };
  } catch {
    return { slides: [], generatedAt: Date.now() };
  }
};

export const generateMarketingCampaign = async (context: BusinessContext, goal: string): Promise<MarketingCampaign> => {
  const ai = getClient();
  const prompt = `Create a marketing campaign for ${context.businessName} with goal: "${goal}". Return JSON MarketingCampaign.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return extractJSON(response.text) || { id: "err", name: "Error", goal, strategySummary: "Failed to generate", posts: [] };
  } catch {
    return { id: "err", name: "Error", goal, strategySummary: "Failed to generate", posts: [] };
  }
};

export const generateCrisisEvent = async (context: BusinessContext, month: number): Promise<CrisisEvent> => {
  const ai = getClient();
  const prompt = `Generate a business crisis event for month ${month} for a ${context.industry} startup. Return JSON CrisisEvent.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return extractJSON(response.text) || { id: "err", title: "Quiet Month", description: "Nothing happened.", type: "Neutral", choices: [] };
  } catch {
    return { id: "err", title: "Quiet Month", description: "Nothing happened.", type: "Neutral", choices: [] };
  }
};

export const resolveCrisis = async (event: CrisisEvent, choice: CrisisChoice, context: BusinessContext): Promise<SimulationResult> => {
  const ai = getClient();
  const prompt = `Resolve crisis "${event.title}" with choice "${choice.title}". Return JSON SimulationResult.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return extractJSON(response.text) || { outcomeTitle: "Resolved", outcomeDescription: "Done.", financialImpact: 0, reputationImpact: 0, survived: true };
  } catch {
    return { outcomeTitle: "Resolved", outcomeDescription: "Done.", financialImpact: 0, reputationImpact: 0, survived: true };
  }
};

export const analyzeMultimodalInput = async (base64: string, context: BusinessContext): Promise<VisionAnalysis> => {
  const ai = getClient();
  const prompt = `Analyze image for ${context.businessName}. Identify business objects. Return JSON VisionAnalysis.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ inlineData: { mimeType: "image/jpeg", data: base64 } }, { text: prompt }],
      config: { responseMimeType: 'application/json' }
    });
    return extractJSON(response.text) || { detectedType: "Unknown", summary: "Analysis failed", suggestedActions: [], dataPayload: {} };
  } catch {
    return { detectedType: "Unknown", summary: "Analysis failed", suggestedActions: [], dataPayload: {} };
  }
};

export const analyzeInbox = async (context: BusinessContext): Promise<Email[]> => {
  const ai = getClient();
  const prompt = `Generate 5 simulated business emails for ${context.businessName}. Return JSON array of Email objects.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const data = extractJSON(response.text);
    return Array.isArray(data) ? data : [];
  } catch { return []; }
};

export const generateEmailReply = async (email: Email, context: BusinessContext, tone: string): Promise<string> => {
  const ai = getClient();
  const prompt = `Write a ${tone} reply to email: "${email.body}" for ${context.businessName}.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return response.text || "";
  } catch { return "Could not draft reply."; }
};

export const analyzeSpatialQuery = async (base64: string, query: string, history: SpatialMessage[]): Promise<string> => {
  const ai = getClient();
  const prompt = `Image analysis. User asks: "${query}". Answer briefly.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ inlineData: { mimeType: "image/jpeg", data: base64 } }, { text: prompt }]
    });
    return response.text || "I see it.";
  } catch { return "I couldn't process the image."; }
};

export const generateResumeBrief = async (task: string, step: number, steps: MicroTask[]): Promise<string> => {
  const ai = getClient();
  const prompt = `Brief user on resuming task "${task}" at step ${step + 1}.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return response.text || "Let's get back to work.";
  } catch { return "Resume session."; }
};

export const scanEnvironment = async (context: BusinessContext): Promise<{ alerts: OracleAlert[] }> => {
  // Mock oracle scan
  return { alerts: [] };
};

// --- MICRO-TASK EXPLODER (ADHD) ---
export const generateMicroTaskPlan = async (taskTitle: string, context: string): Promise<MicroTaskPlan> => {
  const ai = getClient();
  const prompt = `
    ROLE: Executive Function Coach for ADHD Founders.
    TASK: Break "${taskTitle}" into atomic, gamified micro-tasks.
    USER CONTEXT: ${context}
    
    RULES:
    1. First step must be trivial (< 2 min) to break inertia (e.g. "Open laptop").
    2. Add 'dependencies' only if strictly necessary.
    3. Reward points should reflect difficulty.
    
    OUTPUT JSON:
    {
      "taskId": "unique_id",
      "title": "${taskTitle}",
      "microTasks": [
        { "id": "1", "title": "Open Tab", "estMinutes": 1, "dependencies": [], "isComplete": false, "rewardPoints": 10 },
        { "id": "2", "title": "Draft Outline", "estMinutes": 5, "dependencies": ["1"], "isComplete": false, "rewardPoints": 50 }
      ]
    }
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.3, responseMimeType: 'application/json' }
    });
    return extractJSON(response.text) || { taskId: "err", title: taskTitle, microTasks: [], createdAt: Date.now() };
  } catch {
    return { taskId: "err", title: taskTitle, microTasks: [], createdAt: Date.now() };
  }
};

// --- OMNISCIENT STRATEGIST (Blind Mode) ---
export const askOmniStrategist = async (query: string, imageContext: string | null, widgets: WidgetData[], context: BusinessContext): Promise<string> => {
  const ai = getClient();
  const widgetSummaries = widgets.map(w => `${w.title}: ${JSON.stringify(w.content).slice(0, 200)}...`).join('\n');
  
  const prompt = `
    ROLE: You are the "Omniscient Strategist" for a blind CEO running "${context.businessName}".
    CONTEXT:
    - Business Type: ${context.industry}
    - Dashboard Data: 
      ${widgetSummaries}
    
    USER QUERY: "${query}"
    
    VISUAL CONTEXT: ${imageContext ? "User has uploaded an image." : "No image provided."}
    
    INSTRUCTION:
    - Fuse the Visual Data (if any) with the Dashboard Data to give a strategic answer.
    - Example: If user asks "Can I afford this machine?", look at the machine in the image (vision) AND the cash balance (dashboard).
    - Be concise, professional, and audible-friendly (no markdown tables).
  `;

  try {
    const contents: any[] = [{ text: prompt }];
    if (imageContext) {
      contents.unshift({ inlineData: { mimeType: "image/jpeg", data: imageContext } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: { temperature: 0.3 }
    });

    return response.text || "I couldn't analyze the strategy.";
  } catch (err) {
    console.error(err);
    return "Service unavailable.";
  }
};

// --- LOCAL INTEL: GOOGLE REVIEWS ---
export const analyzeGoogleReviews = async (context: BusinessContext): Promise<{ 
  reviews: any[], 
  summary: string, 
  averageRating: number,
  commonThemes: string[],
  areasForImprovement: string[]
}> => {
  const ai = getClient();
  const prompt = `
    ROLE: Reputation Manager.
    CONTEXT: ${context.businessName}, ${context.location}.
    TASK: 
    1. Simulate finding 5 recent Google Reviews for this business (mix of 3-5 stars, maybe one 2 star for realism).
    2. Analyze the aggregate sentiment.
    3. Generate a summary.
    4. Extract 3-4 common themes (e.g. "Friendly Staff", "Slow Service", "Great Value").
    5. EXTRACT 3 specific areas for improvement based on the negative feedback.
    
    OUTPUT JSON:
    {
      "reviews": [
        { "id": "1", "author": "Name", "rating": 5, "text": "...", "date": "2 days ago", "sentiment": "Positive" },
        ...
      ],
      "summary": "Customers love the coffee but complain about parking...",
      "averageRating": 4.2,
      "commonThemes": ["Quality Products", "Long Wait Times", "Friendly Atmosphere"],
      "areasForImprovement": ["Fix the AC", "Hire more staff for weekends", "Clean the restrooms more often"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return extractJSON(response.text) || { reviews: [], summary: "No reviews found.", averageRating: 0, commonThemes: [], areasForImprovement: [] };
  } catch (e) {
    console.error("Review Analysis Error", e);
    return { reviews: [], summary: "Analysis failed.", averageRating: 0, commonThemes: [], areasForImprovement: [] };
  }
};

// --- LOCAL INTEL: SHOP BOARD CHAT ---
export const chatWithShopBoard = async (message: string, context: BusinessContext, history: any[]): Promise<string> => {
  const ai = getClient();
  const prompt = `
    ROLE: You are the "Board of Directors of the Shop".
    IDENTITY: You are NOT a generic AI. You are a council of local business veterans (The landlord, a veteran shopkeeper, a local marketing guru).
    CONTEXT: ${context.businessName} in ${context.location}.
    
    USER MESSAGE: "${message}"
    
    HISTORY: ${JSON.stringify(history.slice(-3))}
    
    INSTRUCTION:
    - Answer as if you are standing in the shop.
    - Be practical, sometimes gritty, always actionable.
    - Mention local context (weather, local events, street traffic) if relevant to the answer.
    - Short, punchy advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return response.text || "The board is deliberating...";
  } catch (e) {
    return "Board is offline.";
  }
};

// --- LEAD INTERCEPTOR ---

export const simulateIncomingLead = async (context: BusinessContext): Promise<Lead> => {
  const ai = getClient();
  const prompt = `
    ROLE: Customer Simulator.
    CONTEXT: Local Business "${context.businessName}" (${context.industry}).
    TASK: Generate a realistic incoming customer inquiry/message.
    
    OUTPUT JSON:
    {
      "text": "The message text (e.g. 'Do you have vegan cake today?')",
      "sender": "Customer Name",
      "channel": "WHATSAPP | INSTAGRAM | GOOGLE | EMAIL | PHONE",
      "intent": "INQUIRY | ORDER | COMPLAINT"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const data = extractJSON(response.text);
    
    if (!data) throw new Error("Failed to simulate lead");

    const lead: Lead = {
      id: Math.random().toString(),
      name: data.sender || "Unknown Customer",
      channel: data.channel as LeadChannel || "WHATSAPP",
      status: 'NEW',
      lastMessage: data.text,
      timestamp: Date.now(),
      history: [
        { id: Math.random().toString(), sender: 'customer', text: data.text, timestamp: Date.now() }
      ],
      intent: (data.intent as any) || 'INQUIRY'
    };
    return lead;

  } catch (e) {
    console.error(e);
    // Fallback
    return {
       id: Math.random().toString(),
       name: "Rajesh Kumar",
       channel: "WHATSAPP",
       status: 'NEW',
       lastMessage: "Hi, are you open right now?",
       timestamp: Date.now(),
       history: [{ id: Math.random().toString(), sender: 'customer', text: "Hi, are you open right now?", timestamp: Date.now() }],
       intent: 'INQUIRY'
    };
  }
};

export const processLeadMessage = async (lead: Lead, context: BusinessContext, template: string): Promise<{
   reply: string;
   autoResponded: boolean;
   newStatus: LeadStatus;
}> => {
   const ai = getClient();
   const prompt = `
     ROLE: Sales & Support AI.
     CONTEXT: "${context.businessName}" (${context.industry}).
     AUTO-REPLY TEMPLATE: "${template}"
     CUSTOMER MESSAGE: "${lead.lastMessage}"
     INTENT: ${lead.intent}
     
     TASK:
     1. Decide if we can Auto-Respond. 
        - YES if it's a simple inquiry about hours, location, or stock that fits the template or general knowledge.
        - NO if it's a complaint, complex order, or requires human judgment.
     2. Draft the reply.
     
     OUTPUT JSON:
     {
       "autoResponded": boolean,
       "reply": "The message to send back",
       "newStatus": "AUTO_RESPONDED | REQUIRES_ACTION | CONVERTED"
     }
   `;

   try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const data = extractJSON(response.text);
    return data || { reply: "I'll check on that.", autoResponded: false, newStatus: 'REQUIRES_ACTION' };
   } catch (e) {
     return { reply: "System error. Please reply manually.", autoResponded: false, newStatus: 'REQUIRES_ACTION' };
   }
};

// --- FEATURE LAB (R&D) ---

export const researchStrategicFeatures = async (context: BusinessContext): Promise<FeatureProposal[]> => {
  const ai = getClient();
  const prompt = `
    ROLE: Chief Product Officer & Innovation Strategist.
    CONTEXT: ${context.businessName} (${context.industry}).
    GOAL: Perform a rigorous R&D analysis to identify high-impact features or service expansions.
    
    METHODOLOGY: RICE Framework (Reach, Impact, Confidence, Effort).
    
    TASK:
    1. Brainstorm 3 strategic proposals.
    2. Score them.
    3. Analyze feasibility and competitor adoption.
    
    OUTPUT JSON ARRAY:
    [
      {
        "id": "1",
        "title": "Name of feature",
        "tagline": "Short pitch",
        "description": "Detailed explanation",
        "riceScore": 85, // 0-100
        "feasibility": "High", // High/Medium/Low
        "competitorAdoption": "Blue Ocean | Standard | Catch-up",
        "implementationSteps": ["Step 1", "Step 2", "Step 3"],
        "expectedROI": "High"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const data = extractJSON(response.text);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Feature Research Failed", e);
    return [];
  }
};

// --- ON-THE-SPOT UI FIXING ---

export const transformToGenerativeUI = async (widgetData: WidgetData): Promise<GenUIElement> => {
  const ai = getClient();
  const prompt = `
    ROLE: UI Engineer & Designer.
    TASK: Convert this static widget data into a Generative UI Schema (JSON).
    INPUT DATA: ${JSON.stringify(widgetData)}
    
    REQUIREMENTS:
    1. Create a schema that visually represents the data (e.g., if it's a list, use a 'list' element; if metrics, use 'layout' with 'metric' children).
    2. Use 'card', 'layout', 'text', 'button', 'metric', 'chart', 'list', 'divider' types.
    3. Return ONLY the JSON object for the schema.
  `;
  
  try {
     const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: 'application/json' }
     });
     return extractJSON(response.text) || { id: "error-ui", type: 'text', props: { content: 'Conversion failed' } };
  } catch (e) {
     return { id: "error-ui", type: 'text', props: { content: 'Conversion error' } };
  }
};

export const refineGenerativeUI = async (currentSchema: GenUIElement, userInstruction: string): Promise<GenUIElement> => {
  const ai = getClient();
  const prompt = `
    ROLE: Expert UI Designer.
    TASK: Modify the existing UI Schema based on the user's instruction.
    CURRENT SCHEMA: ${JSON.stringify(currentSchema)}
    USER INSTRUCTION: "${userInstruction}"
    
    REQUIREMENTS:
    1. Apply the user's requested changes (e.g., "change color to red", "add a button", "make text bigger").
    2. Maintain valid JSON structure for the GenUIElement type.
    3. Return ONLY the updated JSON object.
  `;

  try {
     const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: 'application/json' }
     });
     return extractJSON(response.text) || currentSchema;
  } catch (e) {
     return currentSchema;
  }
};
