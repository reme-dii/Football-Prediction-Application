import { GoogleGenAI, Type } from "@google/genai";
import { format } from "date-fns";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export interface Prediction {
  match: string;
  prediction: string;
  confidence_score: number;
  statistical_justification: string;
}

export async function getPredictions(competition: string, date: string): Promise<Prediction[]> {
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing. Please set VITE_GEMINI_API_KEY in your environment variables.");
    return [];
  }

  try {
    const naturalDate = format(new Date(date), "MMMM do, yyyy");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find and analyze football matches for the ${competition} scheduled on ${naturalDate}.`,
      config: {
        systemInstruction: `You are a professional football statistician. 
Your task is to find REAL scheduled football matches for a specific date and competition using Google Search.

RULES:
1. ALWAYS use Google Search to verify fixtures for the provided date and competition.
2. If matches exist, provide a data-driven prediction (Home Win, Away Win, or Draw) based on form, H2H, and injuries.
3. If NO matches are scheduled for that specific date and competition, return an empty array [].
4. Return the results as a JSON array of objects.
5. Confidence score must be an integer (0-100).
6. Justification must be exactly two sentences.`,
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              match: { type: Type.STRING, description: "Team A vs Team B" },
              prediction: { type: Type.STRING, description: "Home Win, Away Win, or Draw" },
              confidence_score: { type: Type.INTEGER },
              statistical_justification: { type: Type.STRING }
            },
            required: ["match", "prediction", "confidence_score", "statistical_justification"]
          }
        }
      },
    });

    const text = response.text;
    console.log(`AI Response for ${competition} on ${date}:`, text);
    if (!text) return [];
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from response:", text);
      return [];
    }
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return [];
  }
}
