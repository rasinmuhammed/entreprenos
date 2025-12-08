
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WidgetType, AgentPersona, EntityDossier, SentimentReport, ConsultationQuestion, BusinessProfile, CompetitorEntity, BusinessContext, LocationAnalysis, FinancialInputs, FinancialHealth, PitchDeck, MarketingCampaign, CrisisEvent, CrisisChoice, SimulationResult, VisionAnalysis, GenUIElement, AccessibilityMode, SaaSOnboardingData, Email, MicroTask, SpatialMessage } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper: Clean JSON extraction ---
const extractJSON = (text: string) => {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
          return JSON.parse(text.substring(firstBracket, lastBracket + 1));
      }
      throw new Error("No JSON found");
  }
  return JSON.parse(text.substring(firstBrace, lastBrace + 1));
};

// --- ADHD MICRO SPRINTER: Explode Task ---
export const explodeTask = async (taskName: string): Promise<MicroTask[]> => {
  const ai = getClient();
  const prompt = `
    TASK: You are an Executive Function Coach for someone with ADHD.
    GOAL: Break the task "${taskName}" into 5 atomic, extremely simple micro-steps.
    RULES:
    1. The first step must be trivial (e.g., "Open the laptop", "Sit down").
    2. Each step should take < 5 minutes.
    3. Be encouraging but direct.
    
    OUTPUT JSON ARRAY ONLY:
    [
      { "id": "1", "text": "Step 1 text", "isComplete": false, "durationMinutes": 2 },
      ...
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.3 }
    });

    return extractJSON(response.text || "[]");
  } catch (err) {
    console.error("Task Explosion Failed", err);
    return [
      { id: "1", text: "Sit down at your workspace", isComplete: false, durationMinutes: 1 },
      { id: "2", text: "Open the relevant app/doc", isComplete: false, durationMinutes: 1 },
      { id: "3", text: "Write the first sentence/entry", isComplete: false, durationMinutes: 2 },
      { id: "4", text: "Do 5 minutes of focused work", isComplete: false, durationMinutes: 5 },
      { id: "5", text: "Check your progress", isComplete: false, durationMinutes: 1 }
    ];
  }
};

// --- BLIND FOUNDER: Spatial Interrogator ---
export const analyzeSpatialQuery = async (base64Image: string, query: string, history: SpatialMessage[]): Promise<string> => {
  const ai = getClient();
  
  const historyText = history.map(m => `${m.sender}: ${m.text}`).join('\n');
  
  const prompt = `
    ROLE: Spatial Analyst for a blind entrepreneur.
    CONTEXT: User cannot see the image.
    HISTORY:
    ${historyText}
    
    USER QUERY: "${query}"
    
    INSTRUCTION:
    - Do NOT just describe the image broadly. 
    - Answer the specific spatial question (e.g., "Where is the door?", "How many boxes?").
    - Use relative directions (clock face, left/right).
    - Be concise and actionable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: prompt }
      ],
      config: { temperature: 0.2 }
    });

    return response.text || "I couldn't analyze the spatial data.";
  } catch (err) {
    console.error(err);
    return "Error analyzing spatial data.";
  }
};

// --- EMAIL AGENT: Analyze Inbox ---
export const analyzeInbox = async (context: BusinessContext): Promise<Email[]> => {
  const ai = getClient();
  
  // Simulated Raw Emails
  const rawEmails = [
    { sender: "Sarah Jenkins (VC)", subject: "Follow up on Seed Round", body: "Hi, we loved the pitch. Can you send over the updated financial model by EOD? We have a partner meeting tomorrow." },
    { sender: "Stripe Support", subject: "Payment Failed: Invoice #9921", body: "Your recurring payment for AWS failed. Please update your card to avoid service interruption." },
    { sender: "Mark from Sales", subject: "Big lead in pipeline", body: "Just got off the phone with Acme Corp. They want a demo next Tuesday. Who should I bring?" },
    { sender: "Newsletter", subject: "Top 10 AI Tools", body: "Here are the best tools for 2025..." }
  ];

  const prompt = `
    TASK: Act as an Executive Assistant for "${context.businessName}". 
    INPUT: Raw emails.
    ACTIONS:
    1. Assign Priority (High/Normal/Low).
    2. Write a 1-sentence 'AI Summary' of the intent.
    3. Suggest a 1-sentence 'Draft Reply' based on context.
    4. Tag the email (e.g. 'Investor', 'Urgent', 'Sales').
    
    RAW EMAILS: ${JSON.stringify(rawEmails)}

    OUTPUT JSON ARRAY ONLY:
    [
      { "id": "1", "sender": "...", "subject": "...", "snippet": "...", "body": "...", "receivedAt": 1715432000000, "isRead": false, "priority": "High", "aiSummary": "...", "suggestedReply": "...", "tags": ["..."] }
    ]
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return extractJSON(response.text || "[]");
};

// --- EMAIL AGENT: Generate Full Reply ---
export const generateEmailReply = async (email: Email, context: BusinessContext, tone: 'Professional' | 'Casual' | 'Direct'): Promise<string> => {
  const ai = getClient();
  const prompt = `
    TASK: Write a full email reply.
    CONTEXT: User runs "${context.businessName}".
    INCOMING EMAIL: ${JSON.stringify(email)}
    TONE: ${tone}
    GOAL: Address the sender's need immediately.
    
    OUTPUT: Just the email body text. No subject line.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return response.text || "";
};

// --- SHARK TANK: Multimodal Pitch Analysis ---
export const analyzeMultimodalPitch = async (audioBlob: Blob, videoBlob: Blob): Promise<EntityDossier> => {
  const ai = getClient();
  const audioBase64 = await blobToBase64(audioBlob);
  const videoBase64 = await blobToBase64(videoBlob);

  const prompt = `
    TASK: You are a Venture Capitalist AI listening to a founder's pitch.
    INPUT: Audio (Voice) + Video (Visual Context).
    ACTIONS:
    1. IDENTIFY business entity, industry, and core value prop.
    2. ANALYZE VISUALS: Do you see a prototype? A storefront? (Capture this).
    3. DETECT LOCATION.

    OUTPUT JSON ONLY:
    {
      "name": "Entity Name",
      "industry": "Specific Sector",
      "founders": ["Detected Name"],
      "foundingDate": "Unknown",
      "coreProduct": "Product/Service",
      "website": "N/A",
      "description": "Summary of pitch and visual context.",
      "location": "Detected Location"
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { inlineData: { mimeType: "video/webm", data: videoBase64 } }, 
      { text: prompt }
    ],
    config: { temperature: 0.2 }
  });

  const data = extractJSON(response.text || "{}");
  if (!data.founders) data.founders = [];
  return data;
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// --- TRUE GENERATIVE UI ---
export const generateGenerativeWidget = async (context: BusinessContext): Promise<GenUIElement> => {
  const ai = getClient();
  const prompt = `
    TASK: Architect a CUSTOM UI WIDGET for: "${context.businessName}" (${context.industry}).
    GOAL: Create a specialized tool that doesn't exist in standard dashboards.
    OUTPUT: JSON Schema representing the UI layout.
    ELEMENT TYPES: layout (row/col), card, text (h1/h2/body/metric), button, metric, chart, list, divider.

    OUTPUT JSON ONLY:
    {
      "id": "root", "type": "layout", "props": { "direction": "column", "gap": "6" },
      "children": [ ... ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return extractJSON(response.text || "{}");
}

// --- STEP 1b: Process SaaS Onboarding Form ---
export const processSaaSOnboarding = async (formData: SaaSOnboardingData): Promise<EntityDossier> => {
  const ai = getClient();
  const prompt = `
    TASK: Synthesize a Business Dossier from this structured onboarding form.
    INPUT: ${JSON.stringify(formData)}
    
    CONTEXTUAL NOTES:
    - Operational Style: "${formData.operationalStyle}" -> Affects description tone (Agile vs Structured).
    - Digital Maturity: "${formData.digitalMaturity}" -> Affects assumed tech stack.
    
    ACTIONS:
    1. Enrich the description based on the industry, goals, and style.
    2. Infer core products.
    3. Normalize location.

    OUTPUT JSON ONLY (EntityDossier):
    {
      "name": "Business Name",
      "industry": "Industry",
      "founders": ["Founder"],
      "foundingDate": "Unknown",
      "coreProduct": "Inferred Core Product",
      "website": "N/A",
      "description": "Enriched description...",
      "location": "Normalized Location"
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json", temperature: 0.2 }
  });

  return extractJSON(response.text || "{}");
};

// --- STEP 1.5: Strategic Calibration ---
export const generateStrategicQuestions = async (dossier: EntityDossier): Promise<{ questions: ConsultationQuestion[] }> => {
  const ai = getClient();
  const prompt = `
    TASK: Generate 3 strategic multiple-choice questions for "${dossier.name}" (${dossier.industry}).
    GOAL: Calibrate the dashboard for their specific growth stage.
    OUTPUT JSON ONLY: { "questions": [{ "id": "q1", "text": "...", "options": [...] }] }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.4, responseMimeType: "application/json" }
  });

  return extractJSON(response.text || "{}");
};

// --- STEP 2: Deep Sentinel Scan ---
export const performDeepResearch = async (dossier: EntityDossier): Promise<SentimentReport> => {
  const ai = getClient();
  const prompt = `
    TASK: Perform a DIGITAL FOOTPRINT AUDIT on: "${dossier.name}" in "${dossier.location}".
    ACTIONS: Check for Website, Maps Listing, Socials, Reviews.
    OUTPUT JSON ONLY: SentimentReport structure with 'audit' field.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { tools: [{ googleSearch: {} }], temperature: 0.2 }
  });

  return extractJSON(response.text || "{}");
};

// --- STEP 3: Construct The OS ---
export const constructDashboard = async (
  dossier: EntityDossier, 
  sentiment: SentimentReport,
  profile?: BusinessProfile | null
) => {
  const ai = getClient();
  
  const customWidgetSchema = await generateGenerativeWidget({ 
    name: dossier.name, 
    businessName: dossier.name, 
    description: dossier.description, 
    industry: dossier.industry, 
    stage: "Live", 
    generatedAt: Date.now(),
    accessibilityMode: AccessibilityMode.STANDARD
  });

  const prompt = `
    You are EntreprenOS.
    CONTEXT:
    - Entity: ${JSON.stringify(dossier)}
    - Digital Audit: ${JSON.stringify(sentiment.audit)}
    - Profile: ${JSON.stringify(profile?.answers)}
    
    TASK: Generate the High-Level Dashboard Widgets.
    REQUIREMENTS:
    - ALWAYS include "SWOT_TACTICAL".
    - ALWAYS include "EMAIL_CLIENT" (Title: "Inbox Command").
    - If presenceScore < 50: include ALERT_PANEL ("Invisible Digital Presence").
    
    OUTPUT JSON ONLY: { "widgets": [...] }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.2, maxOutputTokens: 8192 }
  });

  const dashboard = extractJSON(response.text || "{}");
  if (dashboard.widgets) {
    dashboard.widgets.push({
      id: "gen-ui-custom",
      type: "GENERATIVE_UI",
      title: "Specialized Tools",
      genUISchema: customWidgetSchema,
      content: {}
    });
  }

  return dashboard;
};

// --- OTHER SERVICES ---
export const analyzeSalesData = async (rawData: string, businessContext: any) => {
  const ai = getClient();
  const prompt = `TASK: Analyze sales data for ${businessContext?.name}. OUTPUT JSON ONLY: { "widgets": [...] }`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return extractJSON(response.text || "{}");
}

export const fetchBusinessProfileDetails = async (businessName: string) => {
  const ai = getClient();
  const prompt = `TASK: Find details for "${businessName}" on Google Maps. OUTPUT JSON ONLY (LOCATION_MAP widget).`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { tools: [{ googleMaps: {} }] }
  });
  return extractJSON(response.text || "{}");
};

export const analyzeCompetitors = async (context: BusinessContext): Promise<{ competitors: CompetitorEntity[] }> => {
  const ai = getClient();
  const prompt = `TASK: Competitor Analysis for "${context.businessName}". OUTPUT JSON ONLY: { "competitors": [...] }`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { tools: [{ googleSearch: {} }], temperature: 0.3 }
  });
  return extractJSON(response.text || "{}");
};

export const analyzeLocationLeverage = async (context: BusinessContext): Promise<LocationAnalysis> => {
  const ai = getClient();
  const prompt = `TASK: Geospatial Analysis for "${context.businessName}" near "${context.location}". OUTPUT JSON ONLY: LocationAnalysis.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { tools: [{ googleMaps: {} }], temperature: 0.2 }
  });
  return extractJSON(response.text || "{}");
};

export const analyzeFinancialHealth = async (inputs: FinancialInputs, context: BusinessContext): Promise<FinancialHealth> => {
  const ai = getClient();
  const prompt = `TASK: CFO Analysis. Cash ${inputs.cashOnHand}, Burn ${inputs.monthlyBurn}. OUTPUT JSON ONLY: FinancialHealth.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.2 }
  });
  return extractJSON(response.text || "{}");
};

export const generatePitchDeck = async (context: BusinessContext, dossier: any, competitors: any, finance: any): Promise<PitchDeck> => {
  const ai = getClient();
  const prompt = `TASK: Generate 10-Slide Pitch Deck for "${context.businessName}". OUTPUT JSON ONLY.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.4 }
  });
  return extractJSON(response.text || "{}");
};

export const generateMarketingCampaign = async (context: BusinessContext, goal: string): Promise<MarketingCampaign> => {
  const ai = getClient();
  const prompt = `TASK: 4-Week Marketing Campaign for "${context.businessName}". Goal: ${goal}. OUTPUT JSON ONLY.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.5 }
  });
  return extractJSON(response.text || "{}");
}

export const runBoardroomDebate = async (topic: string, contextDescription: string) => {
  const ai = getClient();
  const prompt = `
    Conduct boardroom debate: "${topic}". Context: ${contextDescription}.
    OUTPUT JSON: { "thoughts": "...", "dialogue": [...], "consensus": "..." }
  `;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const generateCrisisEvent = async (context: BusinessContext, currentMonth: number): Promise<CrisisEvent> => {
  const ai = getClient();
  const prompt = `TASK: Generate Black Swan Event. Month ${currentMonth}. OUTPUT JSON ONLY.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.7 }
  });
  return extractJSON(response.text || "{}");
};

export const resolveCrisis = async (event: CrisisEvent, choice: CrisisChoice, context: BusinessContext): Promise<SimulationResult> => {
  const ai = getClient();
  const prompt = `TASK: Resolve crisis. OUTPUT JSON ONLY.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.5 }
  });
  return extractJSON(response.text || "{}");
};

export const analyzeMultimodalInput = async (base64Image: string, context: BusinessContext): Promise<VisionAnalysis> => {
  const ai = getClient();
  const prompt = `TASK: Vision Analysis. OUTPUT JSON ONLY.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { inlineData: { mimeType: "image/jpeg", data: base64Image } },
      { text: prompt }
    ],
    config: { temperature: 0.2 }
  });
  return extractJSON(response.text || "{}");
};
