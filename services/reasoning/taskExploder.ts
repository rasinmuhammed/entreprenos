
import { GoogleGenAI } from "@google/genai";
import { MicroTask } from "../../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractJSON = (text: string) => {
  // 1. Strip Markdown Code Blocks
  const cleanText = text.replace(/```json/g, '').replace(/```/g, '');

  // 2. Find start index for Array
  const startIndex = cleanText.indexOf('[');
  if (startIndex === -1) throw new Error("No JSON array found");

  // 3. Balance Counting
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
      if (char === '[') balance++;
      else if (char === ']') {
        balance--;
        if (balance === 0) {
          endIndex = i;
          break;
        }
      }
    }
  }

  if (endIndex === -1) endIndex = cleanText.lastIndexOf(']'); // Fallback

  return JSON.parse(cleanText.substring(startIndex, endIndex + 1));
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
      { "id": "1", "title": "Step 1 title", "estMinutes": 5, "dependencies": [], "isComplete": false, "rewardPoints": 10 },
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
      { id: "1", title: "Open your workspace", estMinutes: 1, dependencies: [], isComplete: false, rewardPoints: 10 },
      { id: "2", title: "Define the first action", estMinutes: 2, dependencies: [], isComplete: false, rewardPoints: 10 },
      { id: "3", title: "Do the first action for 2 mins", estMinutes: 2, dependencies: [], isComplete: false, rewardPoints: 20 },
      { id: "4", title: "Check progress", estMinutes: 1, dependencies: [], isComplete: false, rewardPoints: 10 },
      { id: "5", title: "Finish or take a break", estMinutes: 5, dependencies: [], isComplete: false, rewardPoints: 50 }
    ];
  }
};
