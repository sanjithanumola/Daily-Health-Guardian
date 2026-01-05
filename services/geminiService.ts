
import { GoogleGenAI, Type } from "@google/genai";
import { HealthAnalysis, MedicineInfo, HealthEntry, SymptomAdvice } from "../types";

const parseAIResponse = (text: string | undefined) => {
  if (!text) throw new Error("API returned empty response.");
  
  try {
    let cleaned = text.trim();
    if (cleaned.includes("```")) {
      const match = cleaned.match(/```(?:json)?([\s\S]*?)```/);
      cleaned = match ? match[1].trim() : cleaned.replace(/```json|```/g, "").trim();
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("AI Parse Error:", text);
    throw new Error("The AI provided an invalid data format. Please try again.");
  }
};

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey.length < 5) {
    throw new Error("AI Connection required. Please click 'Connect AI' to initialize the Guardian.");
  }
  return new GoogleGenAI({ apiKey });
};

// Upgraded to Gemini 3 Pro for complex health reasoning
const MODEL_NAME = 'gemini-3-pro-preview';

export const analyzeHealthCheckup = async (entry: HealthEntry): Promise<HealthAnalysis> => {
  const ai = getAI();
  const prompt = `Perform a deep health habit analysis:
  - Sleep: ${entry.sleep}h
  - Water: ${entry.water} units
  - Stress: ${entry.stress}/10
  - Energy: ${entry.energy}/10
  - Symptoms: ${entry.discomfort || "None"}
  - Nutrition: ${entry.foodQuality}
  
  Provide a professional, supportive analysis without giving a medical diagnosis.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: "You are the World-Class Health Guardian AI. Return JSON ONLY: {summary, possibleConcern, advice: string[], warning}. Use thinking to ensure cross-habit correlations.",
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 4000 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          possibleConcern: { type: Type.STRING },
          advice: { type: Type.ARRAY, items: { type: Type.STRING } },
          warning: { type: Type.STRING }
        },
        required: ["summary", "advice"]
      }
    }
  });

  return parseAIResponse(response.text);
};

export const getSymptomAdvice = async (symptomQuery: string): Promise<SymptomAdvice> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Symptom Query: ${symptomQuery}`,
    config: {
      systemInstruction: "Provide safe, non-medical comfort advice for symptoms. Return JSON: {symptom, homeCare:[], whenToSeeDoctor:[], precautions}.",
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });

  return parseAIResponse(response.text);
};

export const scanMedicine = async (medicineName?: string, imageBase64?: string): Promise<MedicineInfo> => {
  const ai = getAI();
  const parts: any[] = [];
  if (medicineName) parts.push({ text: `Medicine: ${medicineName}` });
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { parts: [...parts, { text: "Explain usage and safety precautions for this medicine." }] },
    config: {
      systemInstruction: "Provide medicine safety data. Return JSON: {name, usage, howToTake, sideEffects:[], precautions:[], safetyWarnings}.",
      responseMimeType: "application/json"
    }
  });

  return parseAIResponse(response.text);
};
