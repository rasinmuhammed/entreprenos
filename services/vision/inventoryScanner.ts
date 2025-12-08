
import { GoogleGenAI } from "@google/genai";
import { BusinessContext, InventoryAlert } from "../../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractJSON = (text: string) => {
  const firstBrace = text.indexOf('[');
  const lastBrace = text.lastIndexOf(']');
  if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON array found");
  return JSON.parse(text.substring(firstBrace, lastBrace + 1));
};

export const scanShelf = async (base64Frame: string, context: BusinessContext): Promise<InventoryAlert[]> => {
  const ai = getClient();
  
  // Adaptive prompt based on business type
  const prompt = `
    TASK: You are an Inventory Auditor for a ${context.industry} business called "${context.businessName}".
    INPUT: An image of a shelf, workspace, or storage area.
    ACTION:
    1. Identify items visible in the frame that are relevant to this business.
    2. Approximate the count of each item.
    3. Infer if the stock level is 'OK', 'LOW', or 'CRITICAL' based on typical business needs.
    
    OUTPUT JSON ARRAY ONLY:
    [
      { "item": "Item Name", "currentCount": 5, "parLevel": 10, "status": "LOW" }
    ]
    If no relevant inventory is seen, return empty array [].
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { inlineData: { mimeType: "image/jpeg", data: base64Frame } },
        { text: prompt }
      ],
      config: { temperature: 0.1, maxOutputTokens: 1024 }
    });

    return extractJSON(response.text || "[]");
  } catch (err) {
    console.error("Inventory Scan Failed", err);
    return [];
  }
};
