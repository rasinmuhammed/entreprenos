
import { GoogleGenAI } from "@google/genai";
import { WidgetData } from "../../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const synthesizeWidgetAudio = async (widget: WidgetData): Promise<string> => {
  const ai = getClient();
  const prompt = `
    ROLE: Data-Driven Screen Reader for a Blind CEO.
    TASK: Read the key data points from this widget clearly.
    DATA: ${JSON.stringify(widget)}
    
    STRICT RULES:
    1. USE ACTUAL NUMBERS. If revenue is "$10,500", say "Ten thousand five hundred dollars". Do not say "Revenue is good".
    2. Be concise. Start with the Title, then the Value, then the Trend.
    3. Keep it under 2 sentences.
    4. Do not include markdown or formatting characters.
    
    Example Output: "Monthly Revenue is $12,500, up 2.4% from last month."
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.1 } // Lower temperature for more factual output
    });
    return response.text || "No summary available.";
  } catch (err) {
    return "Unable to read widget data.";
  }
};
