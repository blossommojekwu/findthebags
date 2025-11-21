# Google Gemini Integration for Bag Identification

## Overview

Your "Find the Bags" app now uses **Google Gemini** for accurate bag name and brand identification when a handbag is detected with > 50% confidence.

## How It Works

### Detection Flow:

1. **User uploads image** → Camera/drag-and-drop
2. **Google Cloud Vision API analyzes** → Detects objects, labels, colors, text
3. **Check handbag confidence**:
   - **If > 50%**: Call Google Gemini for precise bag identification
   - **If ≤ 50%**: Show only Vision API results
4. **Gemini Response**: 
   - Bag name/model (e.g., "Louis Vuitton Speedy 30")
   - Brand name
   - Style description
   - Confidence level
   - Estimated price range (if available)

## Setup Instructions

### Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Click "Get API Key"
3. Create a new API key
4. Copy the key

### Configure Environment Variables

Edit your `.env` file:

```bash
# Google Cloud Vision API Key
VITE_GOOGLE_VISION_API_KEY=AIzaSyBKXBUml-VVQ1aeSb4Gj_8feGe5nLGB1oM

# Google Gemini API Key
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key.

## Implementation Details

### New Service: `geminiService.ts`

```typescript
export const identifyBagWithGemini = async (
  imageBase64: string,
  apiKey: string
): Promise<BagIdentification>
```

**Parameters:**
- `imageBase64`: Base64 encoded image (without data URI prefix)
- `apiKey`: Your Gemini API key

**Returns:**
```typescript
{
  bagName: string;           // e.g., "Louis Vuitton Speedy"
  brand: string;             // e.g., "Louis Vuitton"
  description: string;       // Style and characteristics
  confidence: string;        // "High", "Medium", "Low"
  estimatedPrice?: string;   // e.g., "$1,500-$2,000"
}
```

### Updated App Flow

The `analyzeImageWithVision` function now:

1. Calls Google Vision API (as before)
2. Checks if `bagBrandInfo.handbagConfidence > 50`
3. If yes and Gemini key exists:
   - Converts image to base64
   - Calls `identifyBagWithGemini()`
   - Adds result to `analysis.geminiIdentification`
   - Updates UI with Gemini results

### Fallback Logic

- If Gemini API key is missing: Uses Vision API results only
- If Gemini call fails: Continues with Vision API results
- If both fail: Shows error message

## UI Changes

The app now displays two sections when handbag > 50%:

1. **🎒 Handbag Identification** (Gemini results)
   - Specific bag name/model
   - Brand
   - Description
   - Confidence & price estimate

2. **Objects Detected** (Vision API results)
   - Detected objects with confidence scores
   - Bag components identified

## Example Scenario

**Upload a Gucci Marmont handbag:**

**Vision API detects:**
- Handbag: 87%
- Leather: 92%
- Fashion: 85%

**Triggers Gemini call** (87% > 50%) ✓

**Gemini identifies:**
- Bag Name: "Gucci Marmont Medium"
- Brand: "Gucci"
- Description: "Small leather shoulder bag with quilted pattern and interlocking GG hardware"
- Confidence: "High"
- Estimated Price: "$2,200-$2,600"

## API Pricing

### Google Gemini API
- **Free Tier**: 60 requests per minute
- **Paid**: $0.00075 per input token, $0.003 per output token
- No monthly billing after free tier

### Google Cloud Vision API
- **Free Tier**: 1,000 requests/month
- **Paid**: $1.50 per 1,000 requests

## Testing

To test Gemini integration:

1. Add your Gemini API key to `.env`
2. Start dev server: `npm run dev`
3. Upload a clear bag image
4. Click "Analyze Bag"
5. If handbag > 50%: Gemini results will appear automatically

## Troubleshooting

### "Gemini API key not configured"
- Check `.env` file has `VITE_GEMINI_API_KEY`
- Verify the key is valid and active
- Restart dev server: `npm run dev`

### Gemini returns "Unknown"
- Image quality might be low
- Try a clearer, well-lit bag photo
- Multiple angles sometimes help

### Slow response
- Gemini processing takes 2-5 seconds
- This is normal for image analysis
- Check your internet connection

## Advanced Features

You can enhance Gemini prompts to:
- Compare with historical collections
- Identify counterfeit bags
- Extract care instructions
- Identify similar bags for shopping
- Analyze material quality

## Security Notes

⚠️ **Never commit API keys to Git!**

- `.env` is in `.gitignore`
- Keys are environment variables only
- For production: Use backend authentication
- Restrict API keys to specific APIs in Google Cloud Console

## Future Enhancements

1. **Compare Prices**: Search current market prices
2. **Authentication**: Find similar listings
3. **Condition Assessment**: Grade bag condition
4. **Care Recommendations**: Material-specific care tips
5. **Batch Analysis**: Analyze multiple bags at once
