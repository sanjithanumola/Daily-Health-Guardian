
import { GoogleGenAI, Type } from "@google/genai";
import { HealthAnalysis, MedicineInfo, HealthEntry, SymptomAdvice } from "../types";

/**
 * Clean and parse JSON from AI response.
 * Handles cases where the model returns markdown blocks or trailing text.
 */
const parseAIResponse = (text: string | undefined) => {
  if (!text) throw new Error("The AI returned an empty response.");
  
  try {
    // Remove markdown code block markers if present
    let cleaned = text.trim();
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
    console.error("Critical: AI returned invalid JSON format. Raw output:", text);
    throw new Error("The Health Guardian encountered a formatting error. Please try again.");
  }
};

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("Gemini API Key is missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeHealthCheckup = async (entry: HealthEntry): Promise<HealthAnalysis> => {
  const ai = getAI();
  const prompt = `User Data:
  - Sleep: ${entry.sleep}h
  - Water: ${entry.water} units
  - Stress: ${entry.stress}/10
  - Energy: ${entry.energy}/10
  - Physical Discomfort: ${entry.discomfort || "None"}
  - Nutrition: ${entry.foodQuality}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: "You are a supportive Health Guardian AI. Analyze habits, find concerns, and give simple advice. NO DIAGNOSIS. NO PRESCRIPTIONS. Always respond in pure JSON.",
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
    model: 'gemini-3-flash-preview',
    contents: `The user reports: ${symptomQuery}. Provide comfort tips and monitoring advice.`,
    config: {
      systemInstruction: "Provide safe, non-medical advice for symptoms. Focus on rest, hydration, and when to see a professional. NO MEDICAL DIAGNOSIS.",
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
  if (medicineName) parts.push({ text: `Analyze medicine: ${medicineName}` });
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
    parts.push({ text: "Read the medicine label and explain its usage." });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      systemInstruction: "Explain medicine details simply and safely. Emphasize following prescriptions. NO RECOMMENDATIONS.",
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
