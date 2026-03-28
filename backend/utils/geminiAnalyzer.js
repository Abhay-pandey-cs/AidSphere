const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

/**
 * multi-modal AI Scoping using Gemini
 */
const analyzeSignal = async (text, imageUrl = null) => {
  try {
    // Graceful fallback if no API key is set yet
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY missing - Approving mock post automatically or using basic fallback heuristics.");
      return fallbackHeuristic(text);
    }

    // Standardized instantiation for v1.x of the Google GenAI SDK
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY); 

    const prompt = `You are a critical disaster response AI for AidSphere, an emergency management protocol.
Analyze the following social media post (and verify the attached image if present) to determine if it uniquely represents a genuine physical crisis/emergency requiring human intervention (like floods, fires, collapses, or urgent medical shortage).

Strictly identify and drop (isDisaster: false) spam, memes, political opinions, hypotheticals, minor civilian complaints, or false alarms.

Perform a deep, context-aware sentiment analysis on the ENTIRE paragraph. Do NOT rely on isolated keywords. Evaluate the comprehensive tone, emotional severity, and objective distress conveyed by the overall narrative to determine the appropriate sentiment.

Text Content:
"${text}"

Provide your assessment in strict, raw JSON format matching exactly this schema:
{
  "isDisaster": boolean (true if genuine physical emergency, false if noise/spam/not an emergency),
  "urgency": string (one of: "low", "medium", "high", "critical"),
  "category": string (e.g., "flood", "medical", "fire_safety", "structural", "hazard", "other"),
  "confidenceScore": number (0 to 100),
  "sentiment": string (e.g., "negative", "neutral", "positive", "warning", "panic"),
  "aiReasoning": string (Short 1 sentence explanation of your decision)
}`;

    const parts = [];
    
    // Feature: Visual Intelligence (Image Processing)
    if (imageUrl) {
      try {
        if (imageUrl.startsWith('data:image/')) {
          // Internal UI Camera Base64
          const partsStr = imageUrl.split(',');
          const mimeTypeMatch = partsStr[0].match(/:(.*?);/);
          const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
          const base64Data = partsStr[1];
          parts.push({
             inlineData: { data: base64Data, mimeType }
          });
          console.log(`[Gemini] Processed raw camera base64 array.`);
        } else {
          // External link
          const imageResp = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 6000 });
          const mimeType = imageResp.headers['content-type'] || 'image/jpeg';
          const base64Data = Buffer.from(imageResp.data, 'binary').toString('base64');
          
          parts.push({
             inlineData: { data: base64Data, mimeType }
          });
          console.log(`[Gemini] Successfully fetched attachment: ${imageUrl.substring(0, 30)}...`);
        }
      } catch(e) {
        console.error("[Gemini] Failed to fetch/parse image, proceeding text-only:", e.message);
      }
    }
    
    parts.push({ text: prompt });

    console.log(`[Gemini] Transmitting multi-modal payload to Google GenEarth Node...`);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: parts }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 250 // Using only required tokens to minimize latency/cost
      }
    });

    const cleanedData = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanedData);

    console.log(`[Gemini Response]: ${result.isDisaster ? '✅ VERIFIED' : '❌ REJECTED'} - ${result.aiReasoning}`);
    return result;

  } catch (error) {
    console.error("Gemini AI Analysis Error:", error.message);
    return fallbackHeuristic(text);
  }
};

const fallbackHeuristic = (text) => {
  const lower = text.toLowerCase();
  // We use our old heuristic if API fails or key is entirely absent
  const isDisaster = /(emergency|help|sos|disaster|flood|fire|earthquake|trapped|dying)/i.test(lower) && !/(crypto|giveaway|meme)/i.test(lower);
  
  return {
    isDisaster: isDisaster,
    urgency: "high",
    category: "other",
    confidenceScore: 75,
    sentiment: "warning",
    aiReasoning: "Fallback semantic heuristic applied (No active Gemini Key provisioned)."
  };
};

module.exports = { analyzeSignal };
