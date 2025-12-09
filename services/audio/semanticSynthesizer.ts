
import { GoogleGenAI } from "@google/genai";
import { WidgetData } from "../../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const synthesizeWidgetAudio = async (widget: WidgetData): Promise<string> => {
  const ai = getClient();
  const prompt = `
    ROLE: Chief of Staff for a blind CEO.
    TASK: Summarize this widget data into a 1-2 sentence audio briefing.
    DATA: ${JSON.stringify(widget)}
    RULES:
    - Do NOT list raw numbers unless critical.
    - Give the "So What?" insight.
    - Be conversational but professional.
    - Example: Instead of "Revenue 10k", say "Revenue is strong at 10k, trending up."
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.3 }
    });
    return response.text || "No summary available.";
  } catch (err) {
    return "Unable to synthesize audio brief.";
  }
};
