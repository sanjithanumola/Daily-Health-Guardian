
import { GoogleGenAI, Type } from "@google/genai";
import { HealthAnalysis, MedicineInfo, HealthEntry, SymptomAdvice } from "../types";

export const analyzeHealthCheckup = async (entry: HealthEntry): Promise<HealthAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analyze this user's daily health habits and provide supportive feedback.
  Sleep: ${entry.sleep} hours
  Water: ${entry.water} units
  Stress Level: ${entry.stress}/10
  Energy Level: ${entry.energy}/10
  Physical Discomfort: ${entry.discomfort || "None"}
  Food Quality: ${entry.foodQuality}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: `You are a Health Assistant AI. Your role is to help users understand their daily health habits and detect unhealthy patterns early.
      RULES:
      - Do NOT diagnose diseases.
      - Do NOT prescribe medicines.
      - Use simple, friendly, supportive, and non-judgmental language.
      - If symptoms like fever or persistent pain are mentioned, provide safe non-medical advice (hydration, rest) but prioritize suggesting seeing a doctor.
      
      OUTPUT FORMAT (JSON):
      {
        "summary": "1-2 lines health summary",
        "possibleConcern": "Description of any concern or null",
        "advice": ["bullet points of simple advice"],
        "warning": "Gentle warning if needed or null"
      }`,
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

  return JSON.parse(response.text || "{}");
};

export const getSymptomAdvice = async (symptomQuery: string): Promise<SymptomAdvice> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user says they have: ${symptomQuery}. Provide safe, non-medical advice.`,
    config: {
      systemInstruction: `You are a Health Assistant AI. A user is reporting a specific symptom. 
      Your role is to provide safe, helpful, NON-MEDICAL advice for comfort and monitoring.
      RULES:
      - DO NOT DIAGNOSE.
      - DO NOT PRESCRIBE.
      - If it sounds like an emergency (chest pain, severe bleeding, etc.), prioritize telling them to call emergency services.
      - Provide "Home Care" (e.g., rest, fluids for fever).
      - Provide "When to see a doctor" indicators.
      
      OUTPUT FORMAT (JSON):
      {
        "symptom": "Cleaned symptom name",
        "homeCare": ["step 1", "step 2"],
        "whenToSeeDoctor": ["red flag 1", "red flag 2"],
        "precautions": "Safety warning about this symptom"
      }`,
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

  return JSON.parse(response.text || "{}");
};

export const scanMedicine = async (medicineName?: string, imageBase64?: string): Promise<MedicineInfo> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [];
  if (medicineName) {
    parts.push({ text: `Explain usage and safety for: ${medicineName}` });
  }
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64
      }
    });
    parts.push({ text: "Scan this medicine package and explain its usage and safety." });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      systemInstruction: `You are a Medicine Information AI. Your role is to explain medicines in simple language and help users take them safely.
      RULES:
      - Do NOT diagnose illness.
      - Do NOT change prescribed dosage.
      - Do NOT suggest medicines.
      - Always remind users to follow doctor's advice.
      - If medicine is unclear or dangerous, tell user to confirm with doctor/pharmacist.
      
      OUTPUT FORMAT (JSON):
      {
        "name": "Generic or brand name",
        "usage": "General purpose",
        "howToTake": "Basic info only",
        "sideEffects": ["common side effects"],
        "precautions": ["food/drink precautions"],
        "safetyWarnings": "Important safety warnings"
      }`,
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

  return JSON.parse(response.text || "{}");
};
