
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
    throw new Error("AI Connection required. Please ensure your API key is configured.");
  }
  return new GoogleGenAI({ apiKey });
};

// Existing Health Services
const MODEL_NAME = 'gemini-3-flash-preview';

export const analyzeHealthCheckup = async (entry: HealthEntry): Promise<HealthAnalysis> => {
  const ai = getAI();
  const prompt = `Perform a deep health habit analysis for today:
  - Sleep: ${entry.sleep}h
  - Water: ${entry.water} units
  - Stress: ${entry.stress}/10
  - Energy: ${entry.energy}/10
  - Symptoms: ${entry.discomfort || "None"}
  - Nutrition: ${entry.foodQuality}
  
  Provide a professional, supportive analysis. Be specific about correlations (e.g., how stress might be affecting sleep).`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: "You are the World-Class Health Guardian AI. You must be precise, empathetic, and data-driven.",
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

export const getHealthChatResponse = async (userQuery: string, history: HealthEntry[]): Promise<string> => {
  const ai = getAI();
  const historySummary = history.map(h => 
    `Date: ${new Date(h.timestamp).toLocaleDateString()}, Sleep: ${h.sleep}h, Water: ${h.water}, Stress: ${h.stress}/10, Energy: ${h.energy}/10, Symptoms: ${h.discomfort}, Nutrition: ${h.foodQuality}`
  ).join('\n');

  const prompt = `User Context (Health History):\n${historySummary}\n\nUser Question: ${userQuery}\n\nAs the Health Guardian AI, provide a helpful, scientifically-informed (but non-medical) response based on the user's data and current medical knowledge. Do not apologize for not being a doctor, just provide the best advice possible within safety limits.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', // Faster for chat
    contents: prompt,
    config: {
      systemInstruction: "You are the World-Class Health Guardian AI Assistant. Be concise, professional, and reference the user's history if relevant. Keep it under 150 words.",
    }
  });

  return response.text || "I'm sorry, I couldn't process that request at the moment.";
};

export const getWeeklySummary = async (history: HealthEntry[]): Promise<string> => {
  if (history.length < 3) return "Continue logging for at least 3 days to unlock deep behavioral insights.";
  
  const ai = getAI();
  const data = history.slice(0, 7).map(h => 
    `S:${h.sleep} W:${h.water} St:${h.stress} E:${h.energy}`
  ).join(' | ');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these recent health trends and provide a 1-sentence powerful insight: ${data}`,
    config: {
      systemInstruction: "You are a brief, high-impact Health Analyst. One sentence maximum. Focus on the most significant correlation.",
    }
  });

  return response.text || "Your vitality trends are stabilizing. Keep up the consistent logging.";
};

export const getSymptomAdvice = async (symptomQuery: string): Promise<SymptomAdvice> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Symptom Query: ${symptomQuery}`,
    config: {
      systemInstruction: "Provide safe, non-medical comfort advice for symptoms.",
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
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { parts: [...parts, { text: "Explain usage and safety precautions for this medicine." }] },
    config: {
      systemInstruction: "Provide medicine safety data.",
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
        required: ["name", "usage", "howToTake", "safetyWarnings"]
      }
    }
  });

  return parseAIResponse(response.text);
};

/**
 * AI Studio Services
 */

// Generate Images with Gemini 3.1 Flash Image
export const generateImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image was generated by the model.");
};

// Edit Images with Gemini 2.5 Flash
export const editImage = async (base64Image: string, prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to edit image.");
};

// Generate Videos with Veo 3.1
export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16') => {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed.");
  
  return `${downloadLink}&key=${process.env.API_KEY}`;
};
