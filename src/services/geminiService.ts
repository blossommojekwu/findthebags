/**
 * Google Gemini API Service
 * Uses Gemini Pro Vision to identify bag names and brands
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface BagIdentification {
  bagName: string;
  brand: string;
  description: string;
  confidence: string;
  estimatedPrice?: string;
}

/**
 * Identifies bag name and brand using Google Gemini
 * @param imageBase64 - Base64 encoded image data (without data URI prefix)
 * @param apiKey - Google Gemini API key
 * @returns Bag identification details
 */
export const identifyBagWithGemini = async (
  imageBase64: string,
  apiKey: string
): Promise<BagIdentification> => {
  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert fashion and luxury bag specialist. Analyze this image and provide:
1. The specific name/model of the bag (e.g., "Louis Vuitton Speedy", "Hermes Birkin")
2. The brand name
3. A brief description of the bag's style and characteristics
4. Your confidence level (High/Medium/Low)
5. Estimated price range if possible

Format your response as JSON with keys: bagName, brand, description, confidence, estimatedPrice

Only respond with valid JSON, no additional text.`;

    const response = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
      prompt,
    ]);

    const text = response.response.text();
    
    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      bagName: parsed.bagName || 'Unknown',
      brand: parsed.brand || 'Unknown',
      description: parsed.description || '',
      confidence: parsed.confidence || 'Medium',
      estimatedPrice: parsed.estimatedPrice || undefined,
    };
  } catch (error) {
    console.error('Error identifying bag with Gemini:', error);
    throw error;
  }
};
