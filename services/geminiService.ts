
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BusinessContext, EntityDossier, SentimentReport, WidgetData, 
  AIEmployee, MicroTaskPlan, MicroTask, CrisisEvent, CrisisChoice, 
  SimulationResult, PitchDeck, MarketingCampaign, Email, Lead, 
  LeadMessage, FeatureProposal, GenUIElement, WidgetType, 
  FinancialInputs, FinancialHealth, CompetitorEntity, LocationAnalysis,
  OracleAlert
} from "../types";

export const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractJSON = (text: string) => {
  try {
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '');
    const startIndex = cleanText.indexOf('{');
    const startArr = cleanText.indexOf('[');
    let start = -1;
    let end = -1;
    
    if (startIndex !== -1 && (startArr === -1 || startIndex < startArr)) {
        start = startIndex;
        end = cleanText.lastIndexOf('}');
    } else if (startArr !== -1) {
        start = startArr;
        end = cleanText.lastIndexOf(']');
    }

    if (start !== -1 && end !== -1) {
       return JSON.parse(cleanText.substring(start, end + 1));
    }
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Extraction Failed", e);
    return null;
  }
};

export const analyzeGoogleReviews = async (context: BusinessContext) => {
  const ai = getClient();
  const prompt = `
    ROLE: Reputation Manager.
    CONTEXT: ${context.businessName}, ${context.location}.
    TASK: Simulate 5 recent Google Reviews analysis.
    OUTPUT JSON:
    {
      "reviews": [{ "author": "Name", "rating": 5, "text": "...", "date": "..." }],
      "summary": "...",
      "averageRating": 4.5,
      "commonThemes": ["..."],
      "areasForImprovement": ["..."]
    }
  `;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return extractJSON(response.text || "{}");
};

export const analyzeSalesData = async () => { return {}; };
export const fetchBusinessProfileDetails = async () => { return {}; };

export const generateMicroTaskPlan = async (goal: string, industry: string): Promise<MicroTaskPlan> => {
    const ai = getClient();
    const prompt = `
      Break down the goal "${goal}" into 3-5 micro tasks for a ${industry} founder.
      OUTPUT JSON:
      {
        "taskId": "...", "title": "${goal}", "createdAt": ${Date.now()},
        "microTasks": [{ "id": "1", "title": "...", "estMinutes": 5, "dependencies": [], "isComplete": false, "rewardPoints": 10 }]
      }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const performDeepResearch = async (dossier: EntityDossier): Promise<SentimentReport> => {
    const ai = getClient();
    const prompt = `
      Analyze sentiment for: ${JSON.stringify(dossier)}.
      OUTPUT JSON: { "overallSentiment": "Positive", "keyPraises": [], "keyComplaints": [], "recentEvents": [], "audit": { "presenceScore": 80, "websiteStatus": "Active", "googleMapsStatus": "Claimed", "socialPresence": "Strong", "missingAssets": [] } }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const constructDashboard = async (dossier: EntityDossier, sentiment: SentimentReport): Promise<{ widgets: WidgetData[] }> => {
    const ai = getClient();
    const prompt = `
      Build a dashboard for ${dossier.name} (${dossier.industry}).
      Sentiment: ${JSON.stringify(sentiment)}.
      OUTPUT JSON: { "widgets": [{ "id": "1", "type": "METRIC_CARD", "title": "Revenue", "gridArea": "span 1", "content": { "value": "$10k", "trend": "up" } }] }
      Types allowed: METRIC_CARD, KANBAN_BOARD, DATA_LIST, ALERT_PANEL, SWOT_TACTICAL, DIGITAL_PRESENCE.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const generateTeamStructure = async (dossier: EntityDossier): Promise<AIEmployee[]> => {
    const ai = getClient();
    const prompt = `
      Generate 3 AI Employees for ${dossier.name}.
      OUTPUT JSON ARRAY: [{ "id": "1", "name": "Name", "role": "Role", "specialty": "...", "personality": "...", "activeTask": null, "status": "IDLE" }]
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "[]");
};

export const chatWithGenesisArchitect = async (history: any[], userMsg: string) => {
    const ai = getClient();
    // history format is { role: 'user'|'model', parts: [{text: string}] }
    // Map to Gemini history
    const mappedHistory = history.map(h => ({
        role: h.role,
        parts: h.parts
    }));

    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: mappedHistory
    });

    const response = await chat.sendMessage({ message: userMsg });
    // Check for tool calls if any (not implemented in this simplified mock but structure supports it)
    return { text: response.text, toolCalls: [] }; 
};

export const transformToGenerativeUI = async (widget: WidgetData): Promise<GenUIElement> => {
    const ai = getClient();
    const prompt = `
      Convert this widget data to a GenUI Layout JSON.
      Widget: ${JSON.stringify(widget)}
      OUTPUT JSON (GenUIElement): { "type": "layout", "children": [...] }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const refineGenerativeUI = async (schema: GenUIElement, userPrompt: string): Promise<GenUIElement> => {
    const ai = getClient();
    const prompt = `
      Modify this UI schema based on user request: "${userPrompt}".
      Schema: ${JSON.stringify(schema)}
      OUTPUT JSON: { "type": "layout", ... }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const generateResumeBrief = async (taskName: string, stepIndex: number, steps: MicroTask[]) => {
    const ai = getClient();
    const prompt = `
      User is resuming task "${taskName}" at step ${stepIndex + 1}/${steps.length}.
      Step: ${steps[stepIndex]?.title}.
      Write a 1 sentence welcome back message.
    `;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });
    return response.text || "Welcome back.";
};

export const analyzeCompetitors = async (context: BusinessContext) => {
    const ai = getClient();
    const prompt = `
      Analyze competitors for ${context.businessName} (${context.industry}).
      OUTPUT JSON: { "competitors": [{ "name": "Comp A", "marketShare": 30, "threatLevel": "High", "description": "...", "strengths": [], "weaknesses": [], "pricingModel": "...", "strategicMove": "..." }] }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const analyzeLocationLeverage = async (context: BusinessContext): Promise<LocationAnalysis> => {
    const ai = getClient();
    const prompt = `
      Analyze location leverage for ${context.location}.
      OUTPUT JSON: { "nearbyEntities": [], "strategies": [], "footTrafficScore": 85, "summary": "..." }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const chatWithShopBoard = async (userMsg: string, context: BusinessContext, history: any[]) => {
     const ai = getClient();
     // Simple chat simulation
     const prompt = `
       ROLE: Shop Board of Advisors for ${context.businessName}.
       USER: ${userMsg}
       Respond as a collective wisdom.
     `;
     const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: prompt
     });
     return response.text || "No advice.";
};

export const analyzeFinancialHealth = async (inputs: FinancialInputs, context: BusinessContext): Promise<FinancialHealth> => {
    const ai = getClient();
    const prompt = `
      Analyze financials: ${JSON.stringify(inputs)}.
      OUTPUT JSON: { "scenarios": [{ "name": "Base", "runwayMonths": 12, "profitabilityDate": "Dec 2024", "projectionData": [10, 12, 15], "advice": "..." }], "cfoCritique": "...", "burnRateAssessment": "Healthy" }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const generatePitchDeck = async (context: BusinessContext, dossier: any, competitors: any, financials: any): Promise<PitchDeck> => {
    const ai = getClient();
    const prompt = `
      Generate Pitch Deck for ${context.businessName}.
      OUTPUT JSON: { "slides": [{ "title": "...", "subtitle": "...", "contentPoints": [], "visualPrompt": "...", "speakerNotes": "..." }] }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const generateMarketingCampaign = async (context: BusinessContext, goal: string): Promise<MarketingCampaign> => {
    const ai = getClient();
    const prompt = `
      Create campaign for ${context.businessName}. Goal: ${goal}.
      OUTPUT JSON: { "name": "...", "goal": "${goal}", "strategySummary": "...", "posts": [{ "id": "1", "channel": "Instagram", "week": 1, "copy": "...", "visualPrompt": "..." }] }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const generateCrisisEvent = async (context: BusinessContext, month: number): Promise<CrisisEvent> => {
    const ai = getClient();
    const prompt = `
      Generate a business crisis event for month ${month}.
      OUTPUT JSON: { "id": "1", "title": "...", "description": "...", "type": "Financial", "choices": [{ "id": "a", "title": "...", "description": "...", "riskLevel": "High" }] }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const resolveCrisis = async (event: CrisisEvent, choice: CrisisChoice, context: BusinessContext): Promise<SimulationResult> => {
    const ai = getClient();
    const prompt = `
      Resolve crisis "${event.title}" with choice "${choice.title}".
      OUTPUT JSON: { "outcomeTitle": "...", "outcomeDescription": "...", "financialImpact": -5000, "reputationImpact": -5, "survived": true }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const analyzeMultimodalInput = async (base64: string, context: BusinessContext) => {
    const ai = getClient();
    const prompt = `
      Analyze image for ${context.businessName}.
      Detect type: UI_BLUEPRINT, COMPETITOR_PRICING, PHYSICAL_INVENTORY, or OTHER.
      OUTPUT JSON: { "detectedType": "...", "summary": "...", "dataPayload": {} }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { inlineData: { mimeType: "image/jpeg", data: base64 } },
        { text: prompt }
      ],
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const scanEnvironment = async (context: BusinessContext): Promise<{ alerts: OracleAlert[] }> => {
    // Mock background scan
    return { alerts: [] };
};

export const analyzeInbox = async (context: BusinessContext): Promise<Email[]> => {
    const ai = getClient();
    const prompt = `
      Generate 3 mock emails for ${context.businessName}.
      OUTPUT JSON ARRAY: [{ "id": "1", "sender": "...", "subject": "...", "body": "...", "receivedAt": ${Date.now()}, "isRead": false, "priority": "High", "aiSummary": "..." }]
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "[]");
};

export const generateEmailReply = async (email: Email, context: BusinessContext, tone: string) => {
    const ai = getClient();
    const prompt = `
      Reply to email "${email.subject}" from "${email.sender}". Tone: ${tone}.
      Context: ${context.businessName}.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return response.text || "";
};

export const analyzeSpatialQuery = async (imageUrl: string, query: string, history: any[]) => {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
         { inlineData: { mimeType: "image/jpeg", data: imageUrl } },
         { text: query }
      ]
    });
    return response.text || "";
};

export const askOmniStrategist = async (query: string, imageUrl: string | null, widgets: WidgetData[], context: BusinessContext) => {
    const ai = getClient();
    const parts: any[] = [{ text: `Context: ${JSON.stringify(context)}. Widgets: ${JSON.stringify(widgets)}. Query: ${query}` }];
    if (imageUrl) parts.push({ inlineData: { mimeType: "image/jpeg", data: imageUrl } });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: parts
    });
    return response.text || "";
};

export const simulateIncomingLead = async (context: BusinessContext): Promise<Lead> => {
    const ai = getClient();
    const prompt = `
      Simulate incoming lead for ${context.businessName}.
      OUTPUT JSON: { "id": "1", "name": "...", "channel": "WHATSAPP", "status": "NEW", "lastMessage": "...", "timestamp": ${Date.now()}, "history": [], "intent": "INQUIRY", "sentiment": "POSITIVE" }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const lead = extractJSON(response.text || "{}");
    lead.history = [{ id: "m1", sender: "customer", text: lead.lastMessage, timestamp: Date.now() }];
    return lead;
};

export const processLeadMessage = async (lead: Lead, context: BusinessContext, template: string) => {
    const ai = getClient();
    const prompt = `
      Lead: ${JSON.stringify(lead)}.
      Template: ${template}.
      Should we auto-respond? If yes, generate reply.
      OUTPUT JSON: { "autoResponded": true, "reply": "..." }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "{}");
};

export const researchStrategicFeatures = async (context: BusinessContext): Promise<FeatureProposal[]> => {
    const ai = getClient();
    const prompt = `
      Research features for ${context.businessName}.
      OUTPUT JSON ARRAY: [{ "id": "1", "title": "...", "tagline": "...", "description": "...", "riceScore": 85, "feasibility": "High", "implementationSteps": [], "expectedROI": "High" }]
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return extractJSON(response.text || "[]");
};
