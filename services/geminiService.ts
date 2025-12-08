
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WidgetType, AgentPersona, EntityDossier, SentimentReport, ConsultationQuestion, BusinessProfile, CompetitorEntity, BusinessContext, LocationAnalysis, FinancialInputs, FinancialHealth, PitchDeck, MarketingCampaign, CrisisEvent, CrisisChoice, SimulationResult, VisionAnalysis, GenUIElement, AccessibilityMode, SaaSOnboardingData } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper: Clean JSON extraction ---
const extractJSON = (text: string) => {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON found");
  return JSON.parse(text.substring(firstBrace, lastBrace + 1));
};

// --- SHARK TANK: Multimodal Pitch Analysis ---
export const analyzeMultimodalPitch = async (audioBlob: Blob, videoBlob: Blob): Promise<EntityDossier> => {
  const ai = getClient();
  
  // Convert Blobs to Base64
  const audioBase64 = await blobToBase64(audioBlob);
  // Note: For simplicity, we assume videoBlob contains the video track. 
  // In a real implementation, you might grab a frame or the full video.
  const videoBase64 = await blobToBase64(videoBlob);

  const prompt = `
    TASK: You are a Venture Capitalist AI listening to a founder's pitch.
    
    INPUT:
    - Audio: The founder's voice pitch.
    - Video: The visual feed of the founder or their product/environment.

    ACTIONS:
    1. IDENTIFY the business entity, industry, and core value prop from the speech.
    2. ANALYZE VISUALS: Do you see a prototype? A storefront? Inventory? (Capture this in description).
    3. DETECT LOCATION: If mentioned or visible (e.g. street signs).

    OUTPUT JSON ONLY:
    {
      "name": "Entity Name",
      "industry": "Specific Sector",
      "founders": ["Detected Name or 'Founder'"],
      "foundingDate": "Unknown",
      "coreProduct": "Product/Service identified",
      "website": "N/A",
      "description": "Comprehensive summary of the pitch and visual context.",
      "location": "Detected Location or 'Global'"
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { inlineData: { mimeType: "video/webm", data: videoBase64 } }, // Sending the container
      { text: prompt }
    ],
    config: {
      temperature: 0.2
    }
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
    TASK: Architect a CUSTOM UI WIDGET for this specific business: "${context.businessName}" (${context.industry}).
    
    GOAL: Create a highly specialized tool that doesn't exist in standard dashboards.
    - If Yoga Studio -> Class Schedule & Teacher Roster.
    - If Hardware Startup -> Component Bill of Materials Viewer.
    - If Bakery -> Oven Temperature Monitor & Batch Tracker.

    OUTPUT: A JSON Schema representing the UI layout.
    ELEMENT TYPES: layout (row/col), card, text (h1/h2/body/metric), button, metric (label, value, trend), chart, list, divider.

    OUTPUT JSON ONLY (GenUIElement Structure):
    {
      "id": "root",
      "type": "layout",
      "props": { "direction": "column", "gap": "6" },
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


// --- STEP 1: Identify Entity ---
export const identifyEntity = async (userInput: string): Promise<EntityDossier> => {
  const ai = getClient();
  const prompt = `
    TASK: Identify the business entity described: "${userInput}".
    
    ACTIONS:
    1. Use Google Search to find the Official Website, Founders, and Core Business Model.
    2. DETECT LOCATION: If the user mentions a city/neighborhood (e.g. "Stationary in Brooklyn"), capture it.
    3. If it is a vague description or a new idea, CREATE a professional persona.

    OUTPUT JSON ONLY:
    {
      "name": "Exact Entity Name",
      "industry": "Specific Sector",
      "founders": ["Name 1", "Name 2"],
      "foundingDate": "Year or Unknown",
      "coreProduct": "The main value proposition",
      "website": "URL or N/A",
      "description": "A 2-sentence executive summary.",
      "location": "City, State or 'Global' if online/unspecified"
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.1
    }
  });

  const data = extractJSON(response.text || "{}");
  
  if (data.founders && !Array.isArray(data.founders)) {
    data.founders = [String(data.founders)];
  } else if (!data.founders) {
    data.founders = [];
  }

  return data;
};

// --- STEP 1b: Process SaaS Onboarding Form ---
export const processSaaSOnboarding = async (formData: SaaSOnboardingData): Promise<EntityDossier> => {
  const ai = getClient();
  const prompt = `
    TASK: Synthesize a Business Dossier from this structured onboarding form.
    INPUT: ${JSON.stringify(formData)}
    
    ACTIONS:
    1. Enrich the description based on the industry and goals.
    2. Infer core products if not explicitly stated.
    3. Normalize location data.

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
    config: {
      responseMimeType: "application/json",
      temperature: 0.2
    }
  });

  return extractJSON(response.text || "{}");
};

// --- STEP 1.5: Strategic Calibration ---
export const generateStrategicQuestions = async (dossier: EntityDossier): Promise<{ questions: ConsultationQuestion[] }> => {
  const ai = getClient();
  const prompt = `
    TASK: You are a Senior Venture Consultant. Based on the dossier for "${dossier.name}" (${dossier.industry}), generate 3 strategic multiple-choice questions.
    
    CONTEXT:
    - Description: ${dossier.description}
    - Location: ${dossier.location}
    
    GOAL: Determine if they need local foot traffic optimization or online scale.

    OUTPUT JSON ONLY:
    {
      "questions": [
        {
          "id": "q1",
          "text": "Question?",
          "options": ["Option A", "Option B", "Option C"]
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.4,
      responseMimeType: "application/json"
    }
  });

  return extractJSON(response.text || "{}");
};

// --- STEP 2: Deep Sentinel Scan + Digital Audit ---
export const performDeepResearch = async (dossier: EntityDossier): Promise<SentimentReport> => {
  const ai = getClient();
  const prompt = `
    TASK: Perform a Deep Sentinel Scan & DIGITAL FOOTPRINT AUDIT on: "${dossier.name}" in "${dossier.location}".
    
    ACTIONS:
    1. SENTIMENT: Search for reviews, complaints, and praises.
    2. DIGITAL AUDIT: 
       - Check if they have a working website.
       - Check if they appear on Google Maps.
       - Check for active social media.
    
    SCORING:
    - If Website is N/A or generic -> Score -30.
    - If "Unclaimed" on Maps -> Score -40.
    - If no reviews -> Score -20.
    
    OUTPUT JSON ONLY:
    {
      "overallSentiment": "Positive" | "Neutral" | "Negative" | "Mixed",
      "keyPraises": ["Point 1"],
      "keyComplaints": ["Point 2"],
      "recentEvents": ["Event 1"],
      "audit": {
        "presenceScore": 45, // 0-100
        "websiteStatus": "Active" | "Missing" | "Outdated",
        "googleMapsStatus": "Claimed" | "Unclaimed" | "Missing",
        "socialPresence": "Strong" | "Weak" | "None",
        "missingAssets": ["Website", "Google Maps Listing", "Instagram"]
      }
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.2
    }
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
  
  // Also generate a custom widget
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
    You are EntreprenOS, the ultimate AI Coach for ${dossier.name}.
    
    CONTEXT:
    - Entity: ${JSON.stringify(dossier)}
    - Digital Audit: ${JSON.stringify(sentiment.audit)}
    - Sentiment: ${JSON.stringify(sentiment)}
    - Profile Answers: ${JSON.stringify(profile?.answers)}
    - Location: ${dossier.location}
    
    TASK: Generate the High-Level Dashboard.
    
    UNIVERSAL REQUIREMENTS:
    - ALWAYS generate a "SWOT_TACTICAL" widget.
    - If DIGITAL EMERGENCY (<50 score): ALERT_PANEL about "Invisible Digital Presence".
    
    OUTPUT JSON ONLY:
    {
      "widgets": [
        {
          "id": "uuid",
          "type": "WIDGET_TYPE",
          "title": "Professional Title",
          "content": { ... }
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.2,
      maxOutputTokens: 8192
    }
  });

  const dashboard = extractJSON(response.text || "{}");
  
  // Inject the Generative UI Widget
  if (dashboard.widgets) {
    dashboard.widgets.push({
      id: "gen-ui-custom",
      type: "GENERATIVE_UI",
      title: "Specialized Tools",
      genUISchema: customWidgetSchema,
      content: {} // Placeholder
    });
  }

  return dashboard;
};

// --- DATA IMPORT ANALYSIS ---
export const analyzeSalesData = async (rawData: string, businessContext: any) => {
  const ai = getClient();
  const prompt = `
    TASK: Analyze this raw sales/business data string and generate relevant METRIC_CARD widgets.
    CONTEXT: Business is ${businessContext?.name} (${businessContext?.industry}).
    RAW DATA: "${rawData.substring(0, 5000)}"

    OUTPUT JSON ONLY:
    {
      "widgets": [
        {
          "id": "uuid",
          "type": "METRIC_CARD",
          "title": "Metric Name",
          "content": { "value": "123", "unit": "$", "trend": "up"|"down" }
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return extractJSON(response.text || "{}");
}

// --- GOOGLE BUSINESS PROFILE FETCH ---
export const fetchBusinessProfileDetails = async (businessName: string) => {
  const ai = getClient();
  const prompt = `
    TASK: Find the official business location and details for "${businessName}".
    
    ACTIONS:
    1. Use Google Maps to find the Address, Rating, Review Count, and Google Maps URL.
    
    OUTPUT JSON ONLY (Formatted as a LOCATION_MAP widget):
    {
      "widgets": [
        {
          "id": "gbp-map",
          "type": "LOCATION_MAP",
          "title": "Location & Presence",
          "content": { 
            "address": "Full Address",
            "rating": "4.5",
            "reviews": "120",
            "website": "url or N/A",
            "mapUrl": "The Google Maps URI/Link",
            "coordinates": { "lat": "number or null", "lng": "number or null" }
          }
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { 
      tools: [{ googleMaps: {} }]
    }
  });

  return extractJSON(response.text || "{}");
};

// --- COMPETITOR INTELLIGENCE ANALYSIS ---
export const analyzeCompetitors = async (context: BusinessContext): Promise<{ competitors: CompetitorEntity[] }> => {
  const ai = getClient();
  const locationContext = context.location && context.location !== 'Global' ? `NEAR ${context.location}` : "Globally";

  const prompt = `
    TASK: Perform an Enterprise-Grade Competitor Analysis for "${context.businessName}" (${context.industry}) ${locationContext}.
    
    ACTIONS:
    1. Identify the Top 3 DIRECT competitors ${locationContext}.
    2. Analyze their Weaknesses (where ${context.businessName} can win).
    3. Analyze their Pricing Models.
    4. Determine their Threat Level.
    
    Ensure 'strengths' and 'weaknesses' are arrays of strings.

    OUTPUT JSON ONLY:
    {
      "competitors": [
        {
          "name": "Competitor Name",
          "website": "URL",
          "description": "Short summary",
          "marketShare": 45,
          "threatLevel": "High" | "Medium" | "Low",
          "strengths": ["Strength 1"],
          "weaknesses": ["Weakness 1"],
          "pricingModel": "Model",
          "strategicMove": "Move"
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { 
      tools: [{ googleSearch: {} }],
      temperature: 0.3
    }
  });

  const data = extractJSON(response.text || "{}");
  
  // Ensure arrays exist
  if (data.competitors) {
    data.competitors = data.competitors.map((c: any) => ({
      ...c,
      strengths: Array.isArray(c.strengths) ? c.strengths : [],
      weaknesses: Array.isArray(c.weaknesses) ? c.weaknesses : []
    }));
  } else {
    data.competitors = [];
  }

  return data;
};

// --- LOCAL INTELLIGENCE ANALYSIS ---
export const analyzeLocationLeverage = async (context: BusinessContext): Promise<LocationAnalysis> => {
  const ai = getClient();
  if (!context.location || context.location === 'Global') throw new Error("Local intelligence requires a specific location context.");

  const prompt = `
    TASK: Perform a Geospatial Strategic Analysis for "${context.businessName}" (Industry: ${context.industry}) located in/near "${context.location}".
    ACTIONS: Search for nearby Traffic Magnets and generate strategies.
    OUTPUT JSON ONLY: LocationAnalysis structure.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { 
      tools: [{ googleMaps: {} }],
      temperature: 0.2
    }
  });

  return extractJSON(response.text || "{}");
};

// --- FINANCIAL FORECASTING ---
export const analyzeFinancialHealth = async (inputs: FinancialInputs, context: BusinessContext): Promise<FinancialHealth> => {
  const ai = getClient();
  const prompt = `
    TASK: Act as a ruthless CFO. Analyze these financial inputs for "${context.businessName}" and generate 3 projected scenarios.
    INPUTS: Cash $${inputs.cashOnHand}, Burn $${inputs.monthlyBurn}, Rev $${inputs.monthlyRevenue}.
    OUTPUT JSON ONLY: FinancialHealth structure.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.2 }
  });

  return extractJSON(response.text || "{}");
};

// --- PITCH DECK GENERATION ---
export const generatePitchDeck = async (context: BusinessContext, dossier: any, competitors: any, finance: any): Promise<PitchDeck> => {
  const ai = getClient();
  const prompt = `TASK: Generate a 10-Slide Series-A Pitch Deck for "${context.businessName}". OUTPUT JSON ONLY.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.4 }
  });
  
  const deck = extractJSON(response.text || "{}");
  if (!deck.slides) deck.slides = [];
  return deck;
};

// --- MARKETING CAMPAIGN GENERATION ---
export const generateMarketingCampaign = async (context: BusinessContext, goal: string): Promise<MarketingCampaign> => {
  const ai = getClient();
  const prompt = `TASK: Create a 4-Week Marketing Campaign for "${context.businessName}". Goal: ${goal}. OUTPUT JSON ONLY.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.5 }
  });
  return extractJSON(response.text || "{}");
}

// --- BOARDROOM (Thinking Updated) ---
export const runBoardroomDebate = async (topic: string, contextDescription: string) => {
  const ai = getClient();
  // We simulate "Thinking" by asking the model to output a "Thought Trace" first
  const prompt = `
    Conduct a boardroom debate about: "${topic}".
    Business Context: ${contextDescription}.
    Roles: CEO (Visionary), CFO (Conservative), MARKET_REALIST (Customer Voice).
    
    CRITICAL: Before generating the dialogue, generate a "Thought Trace" representing the AI analyzing the user's query against financial models and market data.
    
    OUTPUT JSON: 
    { 
      "thoughts": "Analyzing burn rate... comparing market cap... detecting risk in sector...",
      "dialogue": [{ "speaker": "CEO", "text": "..." }], 
      "consensus": "..." 
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "{}");
};

// --- VENTURE SIMULATOR: Generate Crisis ---
export const generateCrisisEvent = async (context: BusinessContext, currentMonth: number): Promise<CrisisEvent> => {
  const ai = getClient();
  const prompt = `TASK: Generate a Black Swan Crisis Event. Month ${currentMonth}. OUTPUT JSON ONLY.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.7 }
  });
  return extractJSON(response.text || "{}");
};

// --- VENTURE SIMULATOR: Resolve Crisis ---
export const resolveCrisis = async (event: CrisisEvent, choice: CrisisChoice, context: BusinessContext): Promise<SimulationResult> => {
  const ai = getClient();
  const prompt = `TASK: Resolve crisis based on choice. OUTPUT JSON ONLY.`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.5 }
  });
  return extractJSON(response.text || "{}");
};

// --- VISION: Analyze Multimodal Input ---
export const analyzeMultimodalInput = async (base64Image: string, context: BusinessContext): Promise<VisionAnalysis> => {
  const ai = getClient();
  const prompt = `TASK: Omniscient Vision Analysis. Look at the image and determine how it updates the Business OS. OUTPUT JSON ONLY.`;
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
