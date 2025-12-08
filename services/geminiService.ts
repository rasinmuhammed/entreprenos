
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WidgetType, AgentPersona, EntityDossier, SentimentReport, ConsultationQuestion, BusinessProfile, CompetitorEntity, BusinessContext, LocationAnalysis } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper: Clean JSON extraction ---
const extractJSON = (text: string) => {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON found");
  return JSON.parse(text.substring(firstBrace, lastBrace + 1));
};

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
  
  // Defensive normalization: Ensure founders is always an array
  if (data.founders && !Array.isArray(data.founders)) {
    data.founders = [String(data.founders)];
  } else if (!data.founders) {
    data.founders = [];
  }

  return data;
};

// --- STEP 1.5: Strategic Calibration (Generate Questions) ---
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
  
  const isDigitalEmergency = (sentiment.audit?.presenceScore || 100) < 50;

  const prompt = `
    You are EntreprenOS, the ultimate AI Coach for ${dossier.name}.
    
    CONTEXT:
    - Entity: ${JSON.stringify(dossier)}
    - Digital Audit: ${JSON.stringify(sentiment.audit)}
    - Sentiment: ${JSON.stringify(sentiment)}
    - Profile Answers: ${JSON.stringify(profile?.answers)}
    - Location: ${dossier.location}
    
    TASK: Generate the High-Level Dashboard adapted to the business ARCHETYPE.
    
    ARCHETYPE LOGIC:
    1. RETAIL/HOSPITALITY (Physical Store, Cafe):
       - MUST include "INVENTORY_TRACKER" (Predict low stock based on industry).
       - MUST include "LOCATION_MAP" (if address exists).
       - Integration suggestions: "POS System", "Staff Scheduler".
       
    2. SAAS/DIGITAL (App, Tech, Online):
       - MUST include "SUBSCRIPTION_METRICS" (MRR, Churn, Active Users).
       - Integration suggestions: "Stripe", "GitHub", "AWS".

    3. SERVICE/AGENCY (Consulting, Law, Design):
       - MUST include "CLIENT_PIPELINE" (Leads -> Active -> Closed).
       - Integration suggestions: "CRM", "Calendar".

    UNIVERSAL REQUIREMENTS:
    - ALWAYS generate a "SWOT_TACTICAL" widget (Strengths, Weaknesses, Opportunities, Threats).
    - If DIGITAL EMERGENCY (<50 score): ALERT_PANEL about "Invisible Digital Presence".
    - GROWTH_TACTICS focused on High ROI.

    CRITICAL SCHEMA REQUIREMENTS:
    - SWOT_TACTICAL content: { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] }
    - INVENTORY_TRACKER content: { "items": [{ "name", "stockLevel": number (0-100), "status": "Low"|"Good" }] }
    - SUBSCRIPTION_METRICS content: { "mrr": "$X", "churn": "X%", "growth": "+X%", "ltv": "$X" }
    - CLIENT_PIPELINE content: { "stages": [{ "name", "count": number, "value": "$X" }] }
    - GROWTH_TACTICS content: { "tactics": [{ "title", "roi": "High"|"Med", "effort": "Low"|"Med"|"High", "description" }] }
    - ROADMAP_STRATEGY content: { "steps": [{ "phase", "action", "status": "pending"|"active"|"completed" }] }
    - ALERT_PANEL content: { "message", "severity": "low"|"medium"|"high" }
    - INTEGRATION_HUB content: { "services": [{ "name", "reason", "status" }] }
    
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

  return extractJSON(response.text || "{}");
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
  
  // Use location for local search if available
  const locationContext = context.location && context.location !== 'Global' 
    ? `NEAR ${context.location}` 
    : "Globally";

  const prompt = `
    TASK: Perform an Enterprise-Grade Competitor Analysis for "${context.businessName}" (${context.industry}) ${locationContext}.
    
    ACTIONS:
    1. Identify the Top 3 DIRECT competitors ${locationContext}.
    2. Analyze their Weaknesses (where ${context.businessName} can win).
    3. Analyze their Pricing Models.
    4. Determine their Threat Level.

    OUTPUT JSON ONLY:
    {
      "competitors": [
        {
          "name": "Competitor Name",
          "website": "URL",
          "description": "Short summary (and distance if local)",
          "marketShare": 45, // Number 0-100
          "threatLevel": "High" | "Medium" | "Low",
          "strengths": ["Strength 1", "Strength 2"],
          "weaknesses": ["Weakness 1", "Weakness 2"],
          "pricingModel": "e.g. Freemium, High-Ticket, Subscription",
          "strategicMove": "e.g. Just raised Series B, Launching AI"
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

  return extractJSON(response.text || "{}");
};

// --- LOCAL INTELLIGENCE ANALYSIS (New) ---
export const analyzeLocationLeverage = async (context: BusinessContext): Promise<LocationAnalysis> => {
  const ai = getClient();
  
  if (!context.location || context.location === 'Global') {
    throw new Error("Local intelligence requires a specific location context.");
  }

  const prompt = `
    TASK: Perform a Geospatial Strategic Analysis for "${context.businessName}" (Industry: ${context.industry}) located in/near "${context.location}".
    
    ACTIONS:
    1. Search for nearby "Traffic Magnets" (Universities, Hospitals, Malls, Train Stations, Corporate Parks) using Google Maps data.
    2. Analyze the CORRELATION: How does this nearby entity affect the business?
       (e.g., "Near University" -> "Students need cheap coffee/wifi/printing").
    3. Generate specific "Location-Based Strategies" to leverage these neighbors.
    4. Estimate a relative foot traffic score (0-100) based on density.

    OUTPUT JSON ONLY:
    {
      "nearbyEntities": [
        {
          "name": "Entity Name (e.g. City Hospital)",
          "type": "Type (e.g. Hospital)",
          "distance": "e.g. 0.2 miles",
          "impactLevel": "High" | "Medium" | "Low",
          "reasoning": "Staff need quick lunch; Visitors buy flowers/gifts."
        }
      ],
      "strategies": [
        {
          "title": "Strategy Name",
          "targetAudience": "e.g. Hospital Staff",
          "description": "Specific tactical action."
        }
      ],
      "footTrafficScore": 85,
      "summary": "Brief analysis summary."
    }
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


// --- BOARDROOM (Unchanged) ---
export const runBoardroomDebate = async (topic: string, contextDescription: string) => {
  const ai = getClient();
  const prompt = `
    Conduct a boardroom debate about: "${topic}".
    Business Context: ${contextDescription}.
    Roles: CEO (Visionary), CFO (Conservative), MARKET_REALIST (Customer Voice).
    Resolve into a consensus.
    OUTPUT JSON: { "dialogue": [{ "speaker": "CEO"|"CFO"|"MARKET_REALIST", "text": "..." }], "consensus": "..." }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "{}");
};
