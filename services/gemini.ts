import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using the mapped model name for 'nano banana' / Gemini 2.5 Flash Image
const IMAGE_MODEL = 'gemini-2.5-flash-image';

export const editImageWithGemini = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  try {
    // Strip header if present (e.g., "data:image/png;base64,")
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    
    // Determine mime type roughly (default to png if unknown, though API is flexible)
    const mimeType = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/png';

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `Edit this image. ${prompt}`,
          },
        ],
      },
    });

    // Iterate through parts to find the image output
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated in response.");

  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};