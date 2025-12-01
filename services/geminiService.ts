import { GoogleGenAI, Type } from "@google/genai";
import { LanguageDirection, TranslationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const translateText = async (
  text: string,
  direction: LanguageDirection
): Promise<TranslationResponse> => {
  if (!text.trim()) {
    return { original: text, translatedText: "" };
  }

  const isThToJp = direction === LanguageDirection.TH_TO_JP;
  
  const systemInstruction = `
    You are a precise, real-time translator app named "For KNTX".
    Your ONLY task is to translate the input text.
    DO NOT provide explanations, pleasantries, or notes.
    
    Case 1: Thai to Japanese
    - Translate the Thai text to natural Japanese.
    - Provide the Japanese text (using Kanji/Kana as appropriate).
    - Provide the reading (Hiragana) specifically to help reading.
    
    Case 2: Japanese to Thai
    - Translate the Japanese text to natural Thai.
    - Reading field should be null.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: {
              type: Type.STRING,
              description: "The translated text result.",
            },
            reading: {
              type: Type.STRING,
              description: "The hiragana reading if target is Japanese, otherwise null.",
              nullable: true
            },
          },
          required: ["translatedText"],
        },
      },
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);

    return {
      original: text,
      translatedText: result.translatedText,
      reading: result.reading,
    };
  } catch (error) {
    console.error("Translation error:", error);
    return {
      original: text,
      translatedText: "Error translating...",
    };
  }
};