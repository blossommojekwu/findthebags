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

interface BagHistoricalContext {
  historicalContext: string;
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
    const model = client.getGenerativeModel({ model: 'gemini-3-pro-preview' });

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

/**
 * Gets historical context about a bag using Google Gemini
 * @param imageBase64 - Base64 encoded image data (without data URI prefix)
 * @param apiKey - Google Gemini API key
 * @returns Historical context information
 */
export const getBagHistoricalContext = async (
  imageBase64: string,
  apiKey: string
): Promise<BagHistoricalContext> => {
  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert fashion historian and luxury bag specialist. Analyze this bag image and provide the historical context of this bag. Include:
1. The era or time period when this style was first introduced
2. The cultural significance or historical importance of this bag design
3. How this bag has evolved over time
4. Notable figures or events associated with this bag type
5. Its impact on fashion and design history

Provide a comprehensive, engaging narrative about the bag's history. Write in a flowing paragraph format, not as a list.`;

    const response = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
      prompt,
    ]);

    const historicalContext = response.response.text();
    
    return {
      historicalContext,
    };
  } catch (error) {
    console.error('Error getting historical context from Gemini:', error);
    throw error;
  }
};
