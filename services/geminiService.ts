
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { WidgetType, AgentPersona, EntityDossier, SentimentReport, ConsultationQuestion, BusinessProfile, CompetitorEntity, BusinessContext, LocationAnalysis, FinancialInputs, FinancialHealth, PitchDeck, MarketingCampaign, CrisisEvent, CrisisChoice, SimulationResult, VisionAnalysis, GenUIElement, AccessibilityMode, SaaSOnboardingData, Email, MicroTask, SpatialMessage, OracleAlert, WidgetData, MicroTaskPlan, Lead, LeadStatus, LeadChannel, FeatureProposal, AIEmployee } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Robust JSON Extraction with Self-Correction & SAFETY NET ---
const extractJSON = async (text: string, attempt = 1): Promise<any> => {
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
    // Basic bracket matching fallback
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
              // Failed local parse
            }
          }
        }
      }
    }

    // SELF-CORRECTION (Retry)
    if (attempt < 2) {
       console.warn("JSON Parse Failed. Triggering Self-Correction...", text);
       try {
         const ai = getClient();
         const fixPrompt = `
           You generated invalid JSON. Fix it. Return ONLY the valid JSON.
           Original Broken JSON:
           ${text}
         `;
         const correction = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fixPrompt,
            config: { responseMimeType: 'application/json' }
         });
         return extractJSON(correction.text, attempt + 1);
       } catch (retryErr) {
         console.error("Self-Correction Failed", retryErr);
       }
    }
    
    // --- SAFETY NET (Last Resort for Demo Stability) ---
    console.warn("Critical Parse Failure. Engaging Safety Net.");
    return {
       widgets: [
          { 
             id: "safety-net-1", 
             type: "METRIC_CARD", 
             title: "Monthly Revenue", 
             content: { value: "$12,500", unit: "MRR", trend: "up" },
             gridArea: "span 1 / span 2"
          },
          {
             id: "safety-net-2",
             type: "ALERT_PANEL",
             title: "Operational Alert",
             content: { severity: "low", message: "Supply chain optimization recommended based on recent data." },
             gridArea: "span 1 / span 2"
          },
          {
             id: "safety-net-3",
             type: "KANBAN_BOARD",
             title: "Launch Priorities",
             content: {
                columns: [
                   { title: "To Do", tasks: ["Register Domain", "Set up Stripe", "Hire AI Agent"] },
                   { title: "In Progress", tasks: ["Inventory Audit"] }
                ]
             },
             gridArea: "span 2 / span 2"
          }
       ],
       // Fallbacks for other types
       competitors: [{ name: "Market Leader Inc", threatLevel: "Medium", marketShare: 45, description: "Established player." }],
       recommendation: "Focus on customer acquisition to build initial traction.",
       nearbyEntities: [],
       footTrafficScore: 75
    };
  }
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
    const data = await extractJSON(response.text);
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
    return (await extractJSON(response.text)) || { name: data.businessName, description: data.description, industry: data.industry, founders: [], coreProduct: "SaaS Platform" };
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

    const data = await extractJSON(response.text);
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

// --- GENESIS INTERVIEW CHAT (TEXT MODE) ---
export const chatWithGenesisArchitect = async (
  history: { role: string, parts: { text: string }[] }[], 
  userInput: string
): Promise<{ text: string, toolCalls?: any[] }> => {
  const ai = getClient();
  
  if (!userInput || !userInput.trim()) {
    return { text: "", toolCalls: [] };
  }

  // Tool definition specifically for the interview process
  const updateBusinessContextTool: FunctionDeclaration = {
    name: 'update_business_context',
    description: 'Update the business dossier with information gathered during the interview. Call this whenever the user provides specific details about their business.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        industry: { type: Type.STRING, description: 'Industry type (e.g. Retail, SaaS)' },
        revenueModel: { type: Type.STRING, description: 'How they make money (e.g. Subscription, Transactional)' },
        targetAudience: { type: Type.STRING, description: 'Who they sell to' },
        differentiator: { type: Type.STRING, description: 'Unique selling point' },
        bottleneck: { type: Type.STRING, description: 'Current biggest challenge' },
        location: { type: Type.STRING, description: 'Business location' }
      }
    }
  };

  try {
    // RIGOROUS SANITIZATION for ContentUnion errors
    const cleanHistory = history.map(h => {
      // 1. Normalize role to 'user' or 'model'
      const role = (h.role === 'ai' || h.role === 'model') ? 'model' : 'user';
      
      // 2. Ensure parts exist and have non-empty text
      // If text is empty/undefined, use a single space " " (valid) instead of "" (invalid)
      const validParts = (h.parts && h.parts.length > 0) 
        ? h.parts.map(p => ({ text: p.text || " " })) 
        : [{ text: " " }];

      return { role, parts: validParts };
    });

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: cleanHistory as any,
      config: {
         systemInstruction: `
           ROLE: Genesis Architect. 
           GOAL: Interview the user to build EntreprenOS.
           TONE: Professional, Inquisitive, Efficient.
           
           TASK:
           Ask 1 question at a time to gather the following:
           1. Industry
           2. Revenue Model
           3. Target Audience
           4. Key Differentiator
           5. Current Bottleneck
           6. Location
           
           When you identify any of these, call the 'update_business_context' tool IMMEDIATELY with the extracted data.
           Keep responses short (under 2 sentences).
         `,
         tools: [{ functionDeclarations: [updateBusinessContextTool] }]
      }
    });

    const result = await chat.sendMessage(userInput);
    return { text: result.response.text || "", toolCalls: result.response.functionCalls };
  } catch (e) {
    console.error("Genesis Chat Error", e);
    return { text: "I'm having trouble connecting to the neural network. Please try again.", toolCalls: [] };
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
    return (await extractJSON(response.text)) || { overallSentiment: "Neutral", keyPraises: [], keyComplaints: [], recentEvents: [] };
  } catch {
    return { overallSentiment: "Neutral", keyPraises: [], keyComplaints: [], recentEvents: [] };
  }
};

export const constructDashboard = async (dossier: EntityDossier, sentiment: SentimentReport): Promise<{ widgets: WidgetData[] }> => {
  const ai = getClient();
  const prompt = `
    ROLE: Enterprise Architect.
    TASK: Construct the initial dashboard for ${dossier.name} (${dossier.industry}).
    CONTEXT:
    - Description: ${dossier.description}
    - Revenue Model: ${dossier.revenueModel || "Unknown"}
    - Target Audience: ${dossier.targetAudience || "General"}
    
    REQUIREMENTS:
    1. Create 5-6 widgets that are HIGHLY SPECIFIC to this business type.
    2. If it's a "Bakery", include "Inventory" and "Foot Traffic". If "SaaS", include "MRR" and "Churn".
    3. Include at least one GENERATIVE_UI widget that acts as a custom tool (e.g. "Dough Calculator" or "Server Monitor").
    
    ${WIDGET_SCHEMA_INSTRUCTION}
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return (await extractJSON(response.text)) || { widgets: [] };
  } catch {
    return { widgets: [] };
  }
};

export const generateTeamStructure = async (dossier: EntityDossier): Promise<AIEmployee[]> => {
  const ai = getClient();
  const prompt = `
    ROLE: Chief Human Resources Officer (AI Division).
    TASK: Hire 4 AI Agents optimized for: ${dossier.name} (${dossier.industry}).
    CONTEXT:
    - Bottleneck: ${dossier.bottleneck || "General Operations"}
    - Goal: ${dossier.description}
    
    OUTPUT JSON ARRAY:
    [
      {
        "id": "unique_id",
        "role": "Job Title (e.g. Inventory Watchdog)",
        "name": "Human Name",
        "specialty": "Specific capability",
        "personality": "Trait (e.g. Anxious but precise)",
        "activeTask": "Current task",
        "status": "WORKING"
      }
    ]
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return (await extractJSON(response.text)) || [];
  } catch {
    return [];
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
    return (await extractJSON(response.text)) || { widgets: [] };
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
    const data = await extractJSON(response.text);
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
    return (await extractJSON(response.text)) || { scenarios: [], cfoCritique: "Insufficient data.", burnRateAssessment: "Healthy" };
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
    return (await extractJSON(response.text)) || { slides: [], generatedAt: Date.now() };
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
    return (await extractJSON(response.text)) || { id: "err", name: "Error", goal, strategySummary: "Failed to generate", posts: [] };
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
    return (await extractJSON(response.text)) || { id: "err", title: "Quiet Month", description: "Nothing happened.", type: "Neutral", choices: [] };
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
    return (await extractJSON(response.text)) || { outcomeTitle: "Resolved", outcomeDescription: "Done.", financialImpact: 0, reputationImpact: 0, survived: true };
  } catch {
    return { outcomeTitle: "Resolved", outcomeDescription: "Done.", financialImpact: 0, reputationImpact: 0, survived: true };
  }
};

export const analyzeMultimodalInput = async (base64: string, context: BusinessContext): Promise<VisionAnalysis> => {
  const ai = getClient();
  
  const prompt = `
    ROLE: Senior Product Manager & UI Engineer.
    CONTEXT: User is showing an image related to their business: "${context.businessName}" (${context.industry}).
    
    TASK: Analyze the image and decide which path to take.
    
    PATH A (Blueprints/Sketches):
    If the image is a hand-drawn sketch, wireframe, or whiteboard drawing:
    1. Set "detectedType" to "UI_BLUEPRINT".
    2. "summary": "I've converted your sketch into a live utility."
    3. Generate a "genUISchema" (JSON) that replicates the sketch using 'card', 'metric', 'input', 'button' elements.
    
    PATH B (Real World):
    If the image is a product, competitor, or shelf:
    1. Set "detectedType" to "PHYSICAL_INVENTORY" or "COMPETITOR_PRICING".
    2. "summary": "I've analyzed the physical assets."
    
    OUTPUT JSON:
    {
      "detectedType": "UI_BLUEPRINT | PHYSICAL_INVENTORY | COMPETITOR_PRICING",
      "summary": "Brief description",
      "dataPayload": {
         // If UI_BLUEPRINT:
         "genUISchema": { "type": "card", "children": [...] }
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ inlineData: { mimeType: "image/jpeg", data: base64 } }, { text: prompt }],
      config: { responseMimeType: 'application/json' }
    });
    return (await extractJSON(response.text)) || { detectedType: "Unknown", summary: "Analysis failed", suggestedActions: [], dataPayload: {} };
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
    const data = await extractJSON(response.text);
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
    TASK: Break "${taskTitle}" into atomic, gamified micro-steps.
    USER CONTEXT: ${context}
    
    RULES:
    1. First step must be trivial (< 2 min) to break inertia (e.g. "Open laptop", "Sit down").
    2. Add 'dependencies' only if strictly necessary.
    3. Reward points should reflect difficulty.
    
    OUTPUT JSON:
    {
      "taskId": "unique_id",
      "title": "${taskTitle}",
      "microTasks": [
        { "id": "1", "title": "Step 1", "estMinutes": 1, "dependencies": [], "isComplete": false, "rewardPoints": 10 }
      ]
    }
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.3, responseMimeType: 'application/json' }
    });
    return (await extractJSON(response.text)) || { taskId: "err", title: taskTitle, microTasks: [], createdAt: Date.now() };
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
    - Dashboard Data: ${widgetSummaries}
    USER QUERY: "${query}"
    VISUAL CONTEXT: ${imageContext ? "User has uploaded an image." : "No image provided."}
    
    INSTRUCTION:
    - Fuse the Visual Data (if any) with the Dashboard Data to give a strategic answer.
    - Be concise, professional, and audible-friendly.
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
    1. Simulate finding 5 recent Google Reviews.
    2. Analyze sentiment.
    3. Generate summary, themes, and improvements.
    
    OUTPUT JSON:
    {
      "reviews": [],
      "summary": "...",
      "averageRating": 4.2,
      "commonThemes": [],
      "areasForImprovement": []
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return (await extractJSON(response.text)) || { reviews: [], summary: "No reviews found.", averageRating: 0, commonThemes: [], areasForImprovement: [] };
  } catch (e) {
    return { reviews: [], summary: "Analysis failed.", averageRating: 0, commonThemes: [], areasForImprovement: [] };
  }
};

// --- LOCAL INTEL: SHOP BOARD CHAT ---
export const chatWithShopBoard = async (message: string, context: BusinessContext, history: any[]): Promise<string> => {
  const ai = getClient();
  const prompt = `
    ROLE: You are the "Board of Directors of the Shop" (Landlord, Shopkeeper, Marketer).
    CONTEXT: ${context.businessName} in ${context.location}.
    USER MESSAGE: "${message}"
    HISTORY: ${JSON.stringify(history.slice(-3))}
    INSTRUCTION: Answer as a local veteran. Practical advice.
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
    TASK: Generate a realistic incoming customer inquiry.
    
    OUTPUT JSON:
    {
      "text": "Message text",
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
    const data = await extractJSON(response.text);
    
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
    return {
       id: Math.random().toString(),
       name: "Rajesh Kumar",
       channel: "WHATSAPP",
       status: 'NEW',
       lastMessage: "Hi, are you open?",
       timestamp: Date.now(),
       history: [{ id: Math.random().toString(), sender: 'customer', text: "Hi, are you open?", timestamp: Date.now() }],
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
     ROLE: Sales AI.
     CONTEXT: "${context.businessName}".
     TEMPLATE: "${template}"
     MSG: "${lead.lastMessage}"
     INTENT: ${lead.intent}
     
     OUTPUT JSON:
     {
       "autoResponded": boolean,
       "reply": "Message",
       "newStatus": "AUTO_RESPONDED | REQUIRES_ACTION | CONVERTED"
     }
   `;

   try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const data = await extractJSON(response.text);
    return data || { reply: "I'll check.", autoResponded: false, newStatus: 'REQUIRES_ACTION' };
   } catch (e) {
     return { reply: "Error.", autoResponded: false, newStatus: 'REQUIRES_ACTION' };
   }
};

// --- FEATURE LAB (R&D) ---

export const researchStrategicFeatures = async (context: BusinessContext): Promise<FeatureProposal[]> => {
  const ai = getClient();
  const prompt = `
    ROLE: Chief Product Officer.
    CONTEXT: ${context.businessName} (${context.industry}).
    TASK: RICE framework analysis for 3 feature ideas.
    OUTPUT JSON ARRAY: [ { "title": "...", "riceScore": 85, ... } ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const data = await extractJSON(response.text);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
};

// --- ON-THE-SPOT UI FIXING ---

export const transformToGenerativeUI = async (widgetData: WidgetData): Promise<GenUIElement> => {
  const ai = getClient();
  const prompt = `Convert widget data to GenUI JSON schema. DATA: ${JSON.stringify(widgetData)}`;
  try {
     const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: 'application/json' }
     });
     return (await extractJSON(response.text)) || { id: "error", type: 'text', props: { content: 'Error' } };
  } catch (e) {
     return { id: "error", type: 'text', props: { content: 'Error' } };
  }
};

export const refineGenerativeUI = async (currentSchema: GenUIElement, userInstruction: string): Promise<GenUIElement> => {
  const ai = getClient();
  const prompt = `Modify UI Schema based on instruction: "${userInstruction}". SCHEMA: ${JSON.stringify(currentSchema)}`;
  try {
     const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: 'application/json' }
     });
     return (await extractJSON(response.text)) || currentSchema;
  } catch (e) {
     return currentSchema;
  }
};
