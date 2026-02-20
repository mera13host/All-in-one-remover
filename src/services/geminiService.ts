import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function fileToGenerativePart(file: File) {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string"));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
}

export async function removeBackground(imageFile: File): Promise<string> {
    const model = ai.models.getGenerativeModel({ model: "gemini-pro-vision" });
    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = "Remove the background from this image. The subject should be perfectly preserved. The output must be a PNG with a transparent background.";

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;

    // Assuming the API returns the image data in the first part of the response.
    // You might need to adjust this based on the actual API response structure.
    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && 'inlineData' in firstPart) {
        const { mimeType, data } = firstPart.inlineData;
        return `data:${mimeType};base64,${data}`;
    }

    throw new Error("Failed to process image or invalid response from API.");
}
