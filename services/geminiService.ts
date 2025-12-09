
import { GoogleGenAI } from "@google/genai";
import { WidgetType, AgentPersona, EntityDossier, SentimentReport, ConsultationQuestion, BusinessProfile, CompetitorEntity, BusinessContext, LocationAnalysis, FinancialInputs, FinancialHealth, PitchDeck, MarketingCampaign, CrisisEvent, CrisisChoice, SimulationResult, VisionAnalysis, GenUIElement, AccessibilityMode, SaaSOnboardingData, Email, MicroTask, SpatialMessage, OracleAlert, WidgetData, MicroTaskPlan } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Robust JSON Extraction ---
const extractJSON = (text: string) => {
  if (!text) return null;
  const cleanText = text.replace(/```json/g, '').replace(/```/g, '');
  let startIndex = cleanText.indexOf('{');
  let arrayStartIndex = cleanText.indexOf('[');
  
  let isObject = true;
  if (startIndex === -1) {
     if (arrayStartIndex === -1) return null; // No JSON found
     startIndex = arrayStartIndex;
     isObject = false;
  } else if (arrayStartIndex !== -1 && arrayStartIndex < startIndex) {
     startIndex = arrayStartIndex;
     isObject = false;
  }

  let openChar = isObject ? '{' : '[';
  let closeChar = isObject ? '}' : ']';
  
  let balance = 0;
  let endIndex = -1;
  let inString = false;
  let escape = false;

  for (let i = startIndex; i < cleanText.length; i++) {
    const char = cleanText[i];
    if (escape) { escape = false; continue; }
    if (char === '\\') { escape = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    
    if (!inString) {
      if (char === openChar) balance++;
      else if (char === closeChar) {
        balance--;
        if (balance === 0) {
          endIndex = i;
          break;
        }
      }
    }
  }

  if (endIndex === -1) endIndex = cleanText.lastIndexOf(closeChar);

  const jsonStr = cleanText.substring(startIndex, endIndex + 1);
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON Parse Error", e);
    return null;
  }
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
    console.error("Omni Strategist Error", err);
    return "I am currently unable to process that request.";
  }
};

// --- CONTEXT RESURRECTOR ---
export const generateResumeBrief = async (taskName: string, lastStepIndex: number, microSteps: MicroTask[]): Promise<string> => {
  const ai = getClient();
  const lastStep = microSteps[lastStepIndex]?.title || "Getting started";
  
  const prompt = `
    TASK: Write a 1-sentence "Welcome Back" hook.
    CONTEXT: The user was working on "${taskName}" but got distracted at step: "${lastStep}".
    TONE: Jarvis meets Ted Lasso. Encouraging, precise, warm.
    GOAL: Remind them of the *next* immediate action to get them back in flow.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.7 }
    });
    return response.text || "Welcome back. Let's pick up where we left off.";
  } catch {
    return "Welcome back. Ready to resume?";
  }
};

export const explodeTask = async (taskName: string): Promise<MicroTask[]> => {
  const plan = await generateMicroTaskPlan(taskName, "General Business");
  return plan.microTasks;
};

export const analyzeSpatialQuery = async (base64Image: string, query: string, history: SpatialMessage[]): Promise<string> => {
  const ai = getClient();
  const historyText = history.map(m => `${m.sender}: ${m.text}`).join('\n');
  const prompt = `ROLE: Spatial Analyst. HISTORY: ${historyText}. QUERY: "${query}". Answer with spatial precision.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ inlineData: { mimeType: "image/jpeg", data: base64Image } }, { text: prompt }]
    });
    return response.text || "Analysis failed.";
  } catch { return "I couldn't analyze the image."; }
};

export const analyzeInbox = async (context: BusinessContext): Promise<Email[]> => {
  const ai = getClient();
  const rawEmails = [
    { sender: "Sarah Jenkins (VC)", subject: "Follow up on Seed Round", body: "Hi, we loved the pitch. Can you send over the updated financial model by EOD? We have a partner meeting tomorrow." },
    { sender: "Stripe Support", subject: "Payment Failed: Invoice #9921", body: "Your recurring payment for AWS failed. Please update your card to avoid service interruption." },
    { sender: "Mark from Sales", subject: "Big lead in pipeline", body: "Just got off the phone with Acme Corp. They want a demo next Tuesday. Who should I bring?" },
    { sender: "Newsletter", subject: "Top 10 AI Tools", body: "Here are the best tools for 2025..." }
  ];
  const prompt = `Act as Executive Assistant. Prioritize and Summarize these emails: ${JSON.stringify(rawEmails)}. OUTPUT JSON ARRAY of Email objects.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    return extractJSON(response.text) || [];
  } catch { return []; }
};

export const generateEmailReply = async (email: Email, context: BusinessContext, tone: 'Professional' | 'Casual' | 'Direct'): Promise<string> => {
  const ai = getClient();
  const prompt = `Write a ${tone} reply to "${email.subject}" for ${context.businessName}. Body: "${email.body}". Output body text only.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return response.text || "";
  } catch { return "Error generating reply."; }
};

export const analyzeMultimodalPitch = async (audioBlob: Blob, videoBlob: Blob): Promise<EntityDossier> => {
  const ai = getClient();
  const prompt = `
    ROLE: Venture Capitalist & Business Analyst.
    TASK: Analyze the user's pitch. Extract a structured Entity Dossier.
    CRITICAL: 
    - If the input is just an image (e.g., a room, a product), INFER the business type. 
    - DETECT LOCATION if mentioned or visible.
    
    OUTPUT JSON:
    {
      "name": "Business Name",
      "industry": "Specific Niche",
      "location": "City, State (or 'Global')",
      "description": "Core value prop...",
      "founders": ["Names"],
      "coreProduct": "Main selling item",
      "energyLevel": "High/Low/Nervous"
    }
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }], 
      config: { temperature: 0.2 }
    });
    return extractJSON(response.text) || { name: "New Venture", founders: [], coreProduct: "Idea", industry: "Startup", description: "A new business idea." };
  } catch { 
    return { name: "New Venture", founders: [], coreProduct: "Idea", industry: "Startup", description: "A new business idea." };
  }
};

export const scanEnvironment = async (context: BusinessContext): Promise<{ alerts: OracleAlert[] }> => {
  const ai = getClient();
  const prompt = `Scan trends/news for ${context.businessName}. Output OracleAlerts JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return extractJSON(response.text) || { alerts: [] };
  } catch { return { alerts: [] }; }
};

export const generateGenerativeWidget = async (context: BusinessContext): Promise<GenUIElement> => {
  const ai = getClient();
  const prompt = `Design a Premium Custom Widget for ${context.businessName}. Output GenUIElement JSON.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    return extractJSON(response.text) || { id: "error", type: "card", children: [{ id: "msg", type: "text", props: { content: "Widget generation failed" } }] };
  } catch { return { id: "error", type: "card", children: [{ id: "msg", type: "text", props: { content: "Widget generation failed" } }] }; }
};

export const processSaaSOnboarding = async (formData: SaaSOnboardingData): Promise<EntityDossier> => {
  const ai = getClient();
  const prompt = `
    Synthesize Dossier from Form Data: ${JSON.stringify(formData)}. 
    Infer specific niche and core product from description.
    Output EntityDossier JSON.
  `;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    return extractJSON(response.text) || { name: formData.businessName, industry: formData.industry, location: formData.location, description: formData.description, founders: [], coreProduct: "" };
  } catch {
    return { name: formData.businessName, industry: formData.industry, location: formData.location, description: formData.description, founders: [], coreProduct: "" };
  }
};

export const generateStrategicQuestions = async (dossier: EntityDossier): Promise<{ questions: ConsultationQuestion[] }> => {
  const ai = getClient();
  const prompt = `Generate 3 strategic questions for ${dossier.name}. Output JSON.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    return extractJSON(response.text) || { questions: [] };
  } catch { return { questions: [] }; }
};

export const performDeepResearch = async (dossier: EntityDossier): Promise<SentimentReport> => {
  const ai = getClient();
  const prompt = `
    Perform a "Digital Footprint Audit" for ${dossier.name} in ${dossier.location || "Global"}.
    USE TOOLS: Google Search.
    OUTPUT JSON: SentimentReport.
  `;
  try {
    const response = await ai.models.generateContent({ 
       model: "gemini-2.5-flash", 
       contents: prompt, 
       config: { tools: [{ googleSearch: {} }] } 
    });
    return extractJSON(response.text) || { overallSentiment: "Neutral", keyPraises: [], keyComplaints: [], recentEvents: [] };
  } catch { 
    return { overallSentiment: "Neutral", keyPraises: [], keyComplaints: [], recentEvents: [] }; 
  }
};

export const constructDashboard = async (dossier: EntityDossier, sentiment: SentimentReport, profile?: BusinessProfile | null) => {
  const ai = getClient();
  
  // 1. Manually Build Deterministic Widgets (Guaranteed Success)
  const manualWidgets: WidgetData[] = [];

  // Digital Presence Widget
  if (sentiment.audit) {
    manualWidgets.push({
      id: "digital-presence-" + Date.now(),
      type: WidgetType.DIGITAL_PRESENCE,
      title: "Digital Command Center",
      content: sentiment.audit
    });
  }

  // 2. Ask AI for the "Creative" Strategy Widgets
  const prompt = `
    ROLE: Senior Venture Architect.
    CLIENT: "${dossier.name}" (${dossier.industry}).
    LOCATION: ${dossier.location || "Global"}.
    
    MISSION: Generate 4 High-Impact Strategic Widgets.
    
    REQUIRED WIDGETS:
    1. "GROWTH_TACTICS": 3 specific high-ROI growth hacks.
    2. "COMPETITOR_RADAR": 3 archetypal competitors with market share.
    3. "SWOT_TACTICAL": Deep strategic matrix.
    4. "ROADMAP_STRATEGY": 4-step execution plan (Next 30 Days).

    OUTPUT STRUCTURE (JSON):
    {
      "widgets": [
        { "id": "w1", "type": "GROWTH_TACTICS", "title": "Growth Engine", "content": { "tactics": [{ "title": "...", "roi": "High", "effort": "Med", "description": "..." }] } },
        { "id": "w2", "type": "COMPETITOR_RADAR", "title": "Market Threat", "content": { "competitors": [{ "name": "...", "marketShare": 30, "threatLevel": "High", "funding": "Series A" }] } },
        { "id": "w3", "type": "SWOT_TACTICAL", "title": "Strategic Matrix", "content": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] } },
        { "id": "w4", "type": "ROADMAP_STRATEGY", "title": "30-Day Battle Plan", "content": { "steps": [{ "phase": "Week 1", "action": "...", "status": "active" }] } }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({ 
       model: "gemini-2.5-flash", 
       contents: prompt, 
       config: { temperature: 0.4, maxOutputTokens: 4000 } 
    });
    
    const aiData = extractJSON(response.text);
    const aiWidgets = aiData && Array.isArray(aiData.widgets) ? aiData.widgets : [];
    
    return { widgets: [...manualWidgets, ...aiWidgets] };

  } catch (e) {
    console.error("Dashboard AI Construction Failed", e);
    const fallbackWidgets: WidgetData[] = [
       { 
         id: "fallback-roadmap", 
         type: WidgetType.ROADMAP_STRATEGY, 
         title: "Immediate Action Plan", 
         content: { steps: [{ phase: "Now", action: "Complete Business Profile", status: "active" }, { phase: "Next", action: "Define Revenue Model", status: "pending" }] } 
       },
       {
         id: "fallback-metric",
         type: WidgetType.METRIC_CARD,
         title: "System Status",
         content: { value: "Online", unit: "EntreprenOS", trend: "up" }
       }
    ];
    return { widgets: [...manualWidgets, ...fallbackWidgets] };
  }
};

export const analyzeSalesData = async (rawData: string, context: any) => {
  const ai = getClient();
  const prompt = `Analyze sales data. Output JSON { widgets: [...] }.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    return extractJSON(response.text) || { widgets: [] };
  } catch { return { widgets: [] }; }
};

export const fetchBusinessProfileDetails = async (name: string) => {
  const ai = getClient();
  const prompt = `Find Google Maps details for ${name}. Output LOCATION_MAP JSON.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { tools: [{ googleMaps: {} }] } });
    return extractJSON(response.text) || {};
  } catch { return {}; }
};

export const analyzeCompetitors = async (context: BusinessContext): Promise<{ competitors: CompetitorEntity[] }> => {
  const ai = getClient();
  const prompt = `Competitor Analysis for ${context.businessName}. Output JSON { competitors: [...] }.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { tools: [{ googleSearch: {} }] } });
    return extractJSON(response.text) || { competitors: [] };
  } catch { return { competitors: [] }; }
};

export const analyzeLocationLeverage = async (context: BusinessContext): Promise<LocationAnalysis> => {
  const ai = getClient();
  const prompt = `Geospatial Analysis for ${context.location}. Output LocationAnalysis JSON.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { tools: [{ googleMaps: {} }] } });
    return extractJSON(response.text) || { nearbyEntities: [], strategies: [], footTrafficScore: 0, summary: "Analysis failed" };
  } catch { return { nearbyEntities: [], strategies: [], footTrafficScore: 0, summary: "Analysis failed" }; }
};

export const analyzeFinancialHealth = async (inputs: FinancialInputs, context: BusinessContext): Promise<FinancialHealth> => {
  const ai = getClient();
  const prompt = `CFO Analysis. Output FinancialHealth JSON.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return extractJSON(response.text) || { scenarios: [], cfoCritique: "Analysis unavailable.", burnRateAssessment: "Healthy" };
  } catch { return { scenarios: [], cfoCritique: "Analysis unavailable.", burnRateAssessment: "Healthy" }; }
};

export const generatePitchDeck = async (context: BusinessContext, dossier: any, competitors: any, finance: any): Promise<PitchDeck> => {
  const ai = getClient();
  const prompt = `Generate Pitch Deck for ${context.businessName}. Output PitchDeck JSON.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return extractJSON(response.text) || { slides: [], generatedAt: Date.now() };
  } catch { return { slides: [], generatedAt: Date.now() }; }
};

export const generateMarketingCampaign = async (context: BusinessContext, goal: string): Promise<MarketingCampaign> => {
  const ai = getClient();
  const prompt = `Marketing Campaign for ${context.businessName}, Goal: ${goal}. Output MarketingCampaign JSON.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return extractJSON(response.text) || { id: "error", name: "Error", goal, strategySummary: "Generation failed", posts: [] };
  } catch { 
     return { id: "error", name: "Error", goal, strategySummary: "Generation failed", posts: [] }; 
  }
};

export const runBoardroomDebate = async (topic: string, context: string) => {
  const ai = getClient();
  const prompt = `Boardroom debate on ${topic}. Output JSON { thoughts, dialogue, consensus }.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    return extractJSON(response.text) || { thoughts: "", dialogue: [], consensus: "Debate interrupted." };
  } catch { return { thoughts: "", dialogue: [], consensus: "Debate interrupted." }; }
};

export const generateCrisisEvent = async (context: BusinessContext, month: number): Promise<CrisisEvent> => {
  const ai = getClient();
  const prompt = `Generate Black Swan Event Month ${month}. Output CrisisEvent JSON.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return extractJSON(response.text) || { id: "err", title: "Quiet Month", description: "No crisis occurred.", type: "Info", choices: [] };
  } catch { return { id: "err", title: "Quiet Month", description: "No crisis occurred.", type: "Info", choices: [] }; }
};

export const resolveCrisis = async (event: CrisisEvent, choice: CrisisChoice, context: BusinessContext): Promise<SimulationResult> => {
  const ai = getClient();
  const prompt = `Resolve crisis. Output SimulationResult JSON.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return extractJSON(response.text) || { outcomeTitle: "Resolved", outcomeDescription: "The event passed.", financialImpact: 0, reputationImpact: 0, survived: true };
  } catch { return { outcomeTitle: "Resolved", outcomeDescription: "The event passed.", financialImpact: 0, reputationImpact: 0, survived: true }; }
};

export const analyzeMultimodalInput = async (base64: string, context: BusinessContext): Promise<VisionAnalysis> => {
  const ai = getClient();
  const prompt = `Vision Analysis. Output VisionAnalysis JSON.`;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: [{ inlineData: { mimeType: "image/jpeg", data: base64 } }, { text: prompt }] });
    return extractJSON(response.text) || { detectedType: "Unknown", summary: "Analysis failed.", suggestedActions: [], dataPayload: {} };
  } catch { return { detectedType: "Unknown", summary: "Analysis failed.", suggestedActions: [], dataPayload: {} }; }
};
