
import { useAppStore } from '../store/appStore';
import { AgentTask, BoardRole, StrategyQuestion, StrategyAnswer, BoardMessage, AgentTaskType } from '../types';
import { GoogleGenAI } from '@google/genai';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * AGENT ORCHESTRATOR
 * Manages long-running, multi-step agentic workflows.
 */
export class AgentOrchestrator {
  
  // --- BOARDROOM: MULTI-AGENT DEBATE ENGINE ---
  static async runBoardRoomDebate(question: StrategyQuestion): Promise<StrategyAnswer> {
    const ai = getClient();
    const model = "gemini-2.5-flash"; // Speed preferred for debate turns
    const store = useAppStore.getState();

    const transcript: BoardMessage[] = [];
    const contextStr = question.contextDocs?.join('\n') || "No external context.";
    
    // Helper to log messages
    const logMsg = (role: BoardRole | 'SYSTEM', content: string) => {
      const msg: BoardMessage = { id: Math.random().toString(), role, content, timestamp: Date.now() };
      transcript.push(msg);
      store.addBoardRoomMessage({ 
        id: msg.id, 
        sender: role === 'SYSTEM' ? 'system' : role, 
        text: content, 
        timestamp: msg.timestamp 
      });
    };

    // 1. CEO PROPOSAL
    logMsg('SYSTEM', "Initializing Board of Directors...");
    store.setBoardRoomThinking(true);

    const ceoPrompt = `
      ROLE: CEO (Visionary, Growth-Oriented).
      CONTEXT: ${contextStr}
      QUESTION: ${question.question}
      PRIORITIES: ${question.priorities.join(', ')}.
      
      TASK: Propose a bold, strategic direction. Be decisive.
    `;
    const ceoResp = await ai.models.generateContent({ model, contents: ceoPrompt });
    logMsg('CEO', ceoResp.text || "I have no comment.");

    // 2. CFO CRITIQUE
    const cfoPrompt = `
      ROLE: CFO (Conservative, Risk-Averse, Cash-Flow Focused).
      CONTEXT: ${contextStr}
      CEO PROPOSAL: "${ceoResp.text}"
      
      TASK: Critique this proposal. Highlight financial risks, burn rate implications, and ROI concerns. Be ruthless but professional.
    `;
    const cfoResp = await ai.models.generateContent({ model, contents: cfoPrompt });
    logMsg('CFO', cfoResp.text || "I have financial concerns.");

    // 3. MARKET REALIST SYNTHESIS
    const realistPrompt = `
      ROLE: Market Realist (Pragmatic, Customer-Centric, Execution-Focused).
      CONTEXT: ${contextStr}
      CEO SAID: "${ceoResp.text}"
      CFO SAID: "${cfoResp.text}"
      
      TASK: Reconcile these views. What will the market actually accept? What is the execution feasibility? Provide a reality check.
    `;
    const realistResp = await ai.models.generateContent({ model, contents: realistPrompt });
    logMsg('REALIST', realistResp.text || "Market conditions are tough.");

    // 4. FINAL CONSENSUS & ACTION PLAN
    const consensusPrompt = `
      TASK: Synthesize a Final Board Decision.
      TRANSCRIPT:
      CEO: ${ceoResp.text}
      CFO: ${cfoResp.text}
      Realist: ${realistResp.text}
      
      OUTPUT JSON:
      {
        "finalRecommendation": "The concrete decision.",
        "risks": ["Risk 1", "Risk 2"],
        "alternatives": ["Alt 1", "Alt 2"]
      }
    `;
    
    let finalRec = "Proceed with caution.";
    let risks = [];
    let alternatives = [];

    try {
      const consensusResp = await ai.models.generateContent({ 
        model, 
        contents: consensusPrompt, 
        config: { responseMimeType: 'application/json' } 
      });
      const json = JSON.parse(consensusResp.text || "{}");
      finalRec = json.finalRecommendation || finalRec;
      risks = json.risks || [];
      alternatives = json.alternatives || [];
    } catch (e) {
      console.error("Consensus parsing failed", e);
    }

    store.setBoardRoomThinking(false);
    store.setBoardRoomConsensus(finalRec);

    return {
      questionId: question.id,
      boardTranscript: transcript,
      finalRecommendation: finalRec,
      risks,
      alternatives
    };
  }

  // --- BACKGROUND INTEL: DEEP AGENTS ---
  static async runBackgroundIntel(userId: string) {
    const store = useAppStore.getState();
    const context = store.context;
    if (!context) return;

    // 1. Schedule Tasks
    const tasks: AgentTask[] = [
      { id: 't1', type: 'GEOSPATIAL_SCAN', status: 'PENDING', payload: { location: context.location }, createdAt: Date.now(), updatedAt: Date.now() },
      { id: 't2', type: 'MARKET_INTEL', status: 'PENDING', payload: { industry: context.industry }, createdAt: Date.now(), updatedAt: Date.now() },
      { id: 't3', type: 'DIGITAL_FOOTPRINT', status: 'PENDING', payload: { name: context.businessName }, createdAt: Date.now(), updatedAt: Date.now() }
    ];
    
    // Simulate Task Execution (In a real app, these would be server queues)
    tasks.forEach(async (task) => {
       // Start Task
       // ... call Gemini tools ...
       // Update Store
    });
  }
}
