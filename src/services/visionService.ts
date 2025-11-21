/**
 * Google Cloud Vision API Service
 * Provides comprehensive image analysis using Google Cloud Vision API
 * 
 * Features:
 * - Label Detection: Identifies objects, scenes, and concepts
 * - Text Detection: Extracts text via OCR
 * - Safe Search: Checks for inappropriate content
 * - Object Localization: Detects and locates objects
 * - Image Properties: Analyzes colors and composition
 */

interface VisionResponse {
  labels: Array<{ description: string; confidence: string }>;
  text: string;
  safeSearch: {
    adult: string;
    violence: string;
    racy: string;
  };
  colors: Array<{ color: string; percentage: string }>;
  objects: Array<{ name: string; confidence: string }>;
  bagBrandInfo?: {
    isHandbag: boolean;
    handbagConfidence: number;
    brands: Array<{ description: string; confidence: string }>;
    webResults: Array<{ title: string; url: string }>;
  };
}

/**
 * Analyzes an image using Google Cloud Vision API
 * @param imageFile - The image file to analyze
 * @param apiKey - Your Google Cloud Vision API key
 * @returns Comprehensive analysis results
 */
export const analyzeImage = async (
  imageFile: File,
  apiKey: string
): Promise<VisionResponse> => {
  try {
    // Convert file to base64
    const base64Image = await fileToBase64(imageFile);
    const imageData = base64Image.split(',')[1]; // Remove data URI prefix

    // Prepare request payload with multiple vision features
    const payload = {
      requests: [
        {
          image: {
            content: imageData,
          },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 },
            { type: 'TEXT_DETECTION', maxResults: 10 },
            { type: 'SAFE_SEARCH_DETECTION' },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
            { type: 'IMAGE_PROPERTIES' },
            { type: 'LOGO_DETECTION', maxResults: 5 },
            { type: 'WEB_DETECTION', maxResults: 5 },
          ],
        },
      ],
    };

    // Make API request to Google Cloud Vision API
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      throw new Error(`API request failed (${response.status}): ${errorMessage}`);
    }

    const result = await response.json();
    
    // Check for API errors in response
    if (result.error) {
      throw new Error(`Vision API Error: ${result.error.message}`);
    }
    
    return parseVisionResponse(result);
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

/**
 * Converts a File object to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Parses Google Cloud Vision API response into our format
 */
const parseVisionResponse = (apiResponse: any): VisionResponse => {
  const response = apiResponse.responses[0] || {};

  // Extract labels
  const labels = (response.labelAnnotations || []).map((label: any) => ({
    description: label.description,
    confidence: (label.score * 100).toFixed(1),
  }));

  // Extract text
  let text = '';
  if (response.textAnnotations && response.textAnnotations.length > 0) {
    text = response.textAnnotations[0].description;
  }

  // Extract safe search results
  const safeSearch = response.safeSearchAnnotation || {};
  const safeSearchResults = {
    adult: safeSearch.adult || 'UNKNOWN',
    violence: safeSearch.violence || 'UNKNOWN',
    racy: safeSearch.racy || 'UNKNOWN',
  };

  // Extract objects
  const objects = (response.localizedObjectAnnotations || []).map(
    (obj: any) => ({
      name: obj.name,
      confidence: (obj.score * 100).toFixed(1),
    })
  );

  // Extract dominant colors
  const colors: Array<{ color: string; percentage: string }> = [];
  if (response.imagePropertiesAnnotation?.dominantColors?.colors) {
    response.imagePropertiesAnnotation.dominantColors.colors.forEach(
      (colorInfo: any) => {
        const color = colorInfo.color;
        const hex = rgbToHex(color.red || 0, color.green || 0, color.blue || 0);
        colors.push({
          color: hex,
          percentage: (colorInfo.pixelFraction * 100).toFixed(1),
        });
      }
    );
  }

  // Extract brand information if handbag is detected with 50%+ confidence
  const bagBrandInfo = extractBagBrandInfo(response, objects);

  return {
    labels,
    text,
    safeSearch: safeSearchResults,
    colors,
    objects,
    bagBrandInfo,
  };
};

/**
 * Extracts brand and bag information if handbag is detected >= 50%
 */
const extractBagBrandInfo = (response: any, objects: any[]) => {
  // Find handbag object
  const handbagObject = objects.find(
    (obj) => obj.name.toLowerCase() === 'handbag'
  );
  
  if (!handbagObject) {
    return undefined;
  }

  const handbagConfidence = parseFloat(handbagObject.confidence);
  
  // Only proceed if handbag confidence is 50% or more
  if (handbagConfidence < 50) {
    return undefined;
  }

  // Extract logos (often contain brand information)
  const brands = (response.logoAnnotations || []).map((logo: any) => ({
    description: logo.description,
    confidence: (logo.score * 100).toFixed(1),
  }));

  // Extract web detection results (can show similar bags and brands)
  const webResults: Array<{ title: string; url: string }> = [];
  if (response.webDetection?.bestGuessLabels) {
    response.webDetection.bestGuessLabels.forEach((label: any) => {
      webResults.push({
        title: label.label || label,
        url: '',
      });
    });
  }
  if (response.webDetection?.webEntities) {
    response.webDetection.webEntities.slice(0, 3).forEach((entity: any) => {
      if (entity.description && !webResults.find(r => r.title === entity.description)) {
        webResults.push({
          title: entity.description,
          url: entity.url || '',
        });
      }
    });
  }

  return {
    isHandbag: true,
    handbagConfidence,
    brands,
    webResults,
  };
};

/**
 * Converts RGB values to hex color code
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
      .toUpperCase()
  );
};
