
import { GoogleGenAI, Type } from "@google/genai";
import { HealthAnalysis, MedicineInfo, HealthEntry, SymptomAdvice } from "../types";

const parseAIResponse = (text: string | undefined) => {
  if (!text) throw new Error("The AI returned an empty response.");
  try {
    // Robust cleaning: remove markdown code blocks and any leading/trailing whitespace
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("AI JSON Parse Error. Raw text:", text);
    throw new Error("The AI response was not in a valid format. Please try again.");
  }
};

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeHealthCheckup = async (entry: HealthEntry): Promise<HealthAnalysis> => {
  const ai = getAI();
  const prompt = `Analyze this user's health habits:
  Sleep: ${entry.sleep}h, Water: ${entry.water} units, Stress: ${entry.stress}/10, 
  Energy: ${entry.energy}/10, Discomfort: ${entry.discomfort || "None"}, 
  Food: ${entry.foodQuality}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: "You are a supportive Health Guardian AI. Analyze habits, find concerns, and give simple advice. NO DIAGNOSIS. NO PRESCRIPTIONS.",
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
    contents: `Symptom reported: ${symptomQuery}`,
    config: {
      systemInstruction: "Provide safe, non-medical advice for the reported symptom. Prioritize safety and rest. Suggest seeing a doctor for red flags.",
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
    parts.push({ text: "Extract medicine details from this image." });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      systemInstruction: "Explain medicine usage and safety simply. Remind user to follow prescriptions. NO RECOMMENDATIONS.",
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
