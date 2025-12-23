
import { GoogleGenAI, Type } from "@google/genai";
import { HealthAnalysis, MedicineInfo, HealthEntry, SymptomAdvice } from "../types";

const parseAIResponse = (text: string | undefined) => {
  if (!text) throw new Error("API returned empty response.");
  
  try {
    let cleaned = text.trim();
    // Strip markdown if AI includes it
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```json|```/g, "").trim();
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("AI JSON Error:", text);
    throw new Error(`Technical Format Error: ${e instanceof Error ? e.message : 'Invalid JSON'}`);
  }
};

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey.length < 5) {
    throw new Error("Missing API Key. Please ensure API_KEY is set in your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// We use 'gemini-flash-latest' for the best balance of speed and availability
const MODEL_NAME = 'gemini-flash-latest';

export const analyzeHealthCheckup = async (entry: HealthEntry): Promise<HealthAnalysis> => {
  const ai = getAI();
  const prompt = `Analyze: Sleep:${entry.sleep}h, Water:${entry.water}, Stress:${entry.stress}/10, Energy:${entry.energy}/10, Discomfort:${entry.discomfort || "None"}`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: "You are Health Guardian AI. Return JSON: {summary, possibleConcern, advice:[], warning}. NO diagnosis.",
      responseMimeType: "application/json",
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
    contents: `Symptom: ${symptomQuery}`,
    config: {
      systemInstruction: "Return JSON: {symptom, homeCare:[], whenToSeeDoctor:[], precautions}. Safe comfort tips only.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          symptom: { type: Type.STRING },
          homeCare: { type: Type.ARRAY, items: { type: Type.STRING } },
          whenToSeeDoctor: { type: Type.ARRAY, items: { type: Type.STRING } },
          precautions: { type: Type.STRING }
        },
        required: ["symptom", "homeCare", "whenToSeeDoctor", "precautions"]
      }
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
    parts.push({ text: "Scan label for usage." });
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { parts },
    config: {
      systemInstruction: "Return JSON: {name, usage, howToTake, sideEffects:[], precautions:[], safetyWarnings}. Simple safety info.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          usage: { type: Type.STRING },
          howToTake: { type: Type.STRING },
          sideEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
          precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
          safetyWarnings: { type: Type.STRING }
        },
        required: ["name", "usage", "howToTake", "sideEffects", "precautions", "safetyWarnings"]
      }
    }
  });

  return parseAIResponse(response.text);
};
