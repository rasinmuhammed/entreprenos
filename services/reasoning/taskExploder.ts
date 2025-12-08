
import { GoogleGenAI } from "@google/genai";
import { MicroTask } from "../../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractJSON = (text: string) => {
  const firstBrace = text.indexOf('[');
  const lastBrace = text.lastIndexOf(']');
  if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON array found");
  return JSON.parse(text.substring(firstBrace, lastBrace + 1));
};

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
      { "id": "1", "text": "Step 1 text", "isComplete": false },
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
    // Fallback manual explosion
    return [
      { id: "1", text: "Open your workspace", isComplete: false },
      { id: "2", text: "Define the first action", isComplete: false },
      { id: "3", text: "Do the first action for 2 mins", isComplete: false },
      { id: "4", text: "Check progress", isComplete: false },
      { id: "5", text: "Finish or take a break", isComplete: false }
    ];
  }
};
