import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Prediction {
  match: string;
  prediction: string;
  confidence_score: number;
  statistical_justification: string;
}

export async function getPredictions(competition: string, date: string): Promise<Prediction[]> {
  const prompt = `Find football matches for the ${competition} competition scheduled for the date: ${date}.
For each match, provide a data-driven prediction based on statistical analysis (league position, form, H2H, injuries).
Use Google Search to get the most up-to-date match data for that specific date.

Strictly adhere to these rules:
1. Base your prediction purely on statistical data.
2. Provide a single predicted outcome: "Home Win", "Away Win", or "Draw".
3. Assign a confidence score as an integer percentage.
4. Provide a concise, two-sentence statistical justification.
5. Return the response as a JSON array of objects.
6. If no matches are found for ${competition} on ${date}, return an empty array [].

JSON Schema:
{
  "match": "[Home Team] vs [Away Team]",
  "prediction": "[Outcome]",
  "confidence_score": [Integer],
  "statistical_justification": "[Your 2-sentence explanation]"
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        temperature: 0.2, // Lower temperature for more consistent data extraction
      },
    });

    const text = response.text;
    if (!text) return [];
    
    // Extract JSON from the response text (it might be wrapped in markdown or contain commentary)
    let jsonStr = text;
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    
    if (start !== -1 && end !== -1 && end > start) {
      jsonStr = text.substring(start, end + 1);
    } else {
      // Fallback: strip markdown code blocks if present
      jsonStr = text.replace(/```json\n?|```/g, "").trim();
    }
    
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse JSON from response:", text);
      return [];
    }
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return [];
  }
}
