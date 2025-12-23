
import { GoogleGenAI, Type } from "@google/genai";
import { HealthAnalysis, MedicineInfo, HealthEntry, SymptomAdvice } from "../types";

const parseAIResponse = (text: string | undefined) => {
  if (!text) throw new Error("API returned empty response. This might be a temporary network issue.");
  
  try {
    let cleaned = text.trim();
    // Strip markdown if AI includes it
    if (cleaned.includes("```")) {
      const match = cleaned.match(/```(?:json)?([\s\S]*?)```/);
      if (match && match[1]) {
        cleaned = match[1].trim();
      } else {
        cleaned = cleaned.replace(/```json|```/g, "").trim();
      }
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("AI Response Parsing Failure:", text);
    throw new Error(`Data Format Error: The AI response wasn't in the expected JSON format. Details: ${e instanceof Error ? e.message : 'Unknown'}`);
  }
};

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API Key Missing: Please ensure the 'API_KEY' environment variable is correctly configured.");
  }
  return new GoogleGenAI({ apiKey });
};

// Using Gemini 3 Flash Preview as recommended for stability and speed
const MODEL_NAME = 'gemini-3-flash-preview';

export const analyzeHealthCheckup = async (entry: HealthEntry): Promise<HealthAnalysis> => {
  const ai = getAI();
  const prompt = `Conduct a health habit analysis for a user with these stats: 
  Sleep: ${entry.sleep}h, Water: ${entry.water} units, Stress: ${entry.stress}/10, 
  Energy: ${entry.energy}/10, Symptoms: ${entry.discomfort || "None"}. 
  Diet: ${entry.foodQuality}.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: "You are the World-Class Health Guardian AI. Provide an encouraging but cautious analysis. DO NOT give medical diagnoses. Return JSON ONLY with fields: summary, possibleConcern, advice (array), warning.",
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
    contents: `User reports symptom: ${symptomQuery}. Provide non-medical comfort advice.`,
    config: {
      systemInstruction: "Provide supportive home care advice. List red flags that require a doctor. Return JSON ONLY with fields: symptom, homeCare (array), whenToSeeDoctor (array), precautions.",
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
  if (medicineName) parts.push({ text: `Medicine to research: ${medicineName}` });
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
    parts.push({ text: "Read this medicine label and explain its usage safely." });
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { parts },
    config: {
      systemInstruction: "Explain medicine details simply. Emphasize that users must follow their doctor's prescription. Return JSON ONLY with fields: name, usage, howToTake, sideEffects (array), precautions (array), safetyWarnings.",
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
