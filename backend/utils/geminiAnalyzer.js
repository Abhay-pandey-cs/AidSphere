const { GoogleGenerativeAI } = require('@google/generative-ai');
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
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const prompt = `You are a specialized disaster forensic AI trained on the Simula Image Sentiment Dataset logic.
Analyze the following social media post (and verify the attached image if present) to determine the unique emotional markers of distress.

Strictly identify and drop (isDisaster: false) spam, memes, political opinions, or false alarms.

Sentiment Analysis (Simula Disaster Rubric):
Evaluate the content according to these specific disaster-related sentiment labels:
- ANGER: Frustration at slow aid or cause.
- ANXIETY: Overwhelming uncertainty about safety.
- CRAVING: Urgent need for specific resources (water, meds).
- EMPATHETIC PAIN: Expressing or showing vicarious suffering.
- FEAR: Imminent threat to life/physical safety.
- HORROR: Shock at catastrophic structural/human loss.
- JOY: Successful rescue or reunion.
- RELIEF: Aid has arrived, state of recovery.
- SADNESS: Mourning or deep loss.
- SURPRISE: Unexpected onset of disaster.

Text Content:
"${text}"

Provide your assessment in strict, raw JSON format matching exactly this schema:
- isDisaster (boolean): true if genuine physical emergency/visible danger.
- urgency (string): "low", "medium", "high", "critical".
- category (string): "flood", "medical", "fire", "structural", "hazard", "rescue", "other".
- confidenceScore (number): 0 to 100.
- sentiment (string): ONE OF THE SIMULA LABELS ABOVE.
- aiReasoning (string): Explain why the specific Simula sentiment label was selected.

Expected JSON Output:
{
  "isDisaster": true,
  "urgency": "critical",
  "category": "rescue",
  "confidenceScore": 95,
  "sentiment": "fear",
  "aiReasoning": "Visual evidence of person trapped in rising water confirms the 'Fear' Simula marker."
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
    const model = genAI.getGenerativeModel({ 
       model: 'gemini-1.5-flash',
       systemInstruction: "You are an unyielding, objective disaster forensic AI specialized in the Simula Image Sentiment Dataset. Always default to safe/nominal unless you see explicit visual proof of danger. Use the 10-Class Simula labels for all sentiment reporting."
    });
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: parts }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 250,
        temperature: 0.1, // Highly deterministic
        topP: 0.1
      }
    });

    const resultStr = response.response.text();
    const cleanedData = resultStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanedData);

    console.log(`[Gemini Response]: ${result.isDisaster ? '✅ VERIFIED' : '❌ REJECTED'} - ${result.aiReasoning}`);
    return result;

  } catch (error) {
    console.error("Gemini AI Analysis Error (FULL):", error);
    return fallbackHeuristic(text);
  }
};

const fallbackHeuristic = (text) => {
  const lower = text.toLowerCase();
  
  // EXCLUSION LIST: Filter out common noise even if they use the word 'help'
  const isSpam = /(makeup|pc build|hiring|scam|blinkit|home loan|panasonic|car|comic con|black magic)/i.test(lower);
  
  // INCLUSION LIST: Only high-confidence disaster markers
  const isEmergency = /(disaster|flood|earthquake|trapped|tsunami|landslide|cyclone|wildfire|explosion|sos)/i.test(lower);
  
  const isDisaster = isEmergency && !isSpam;
  
  return {
    isDisaster: isDisaster,
    urgency: isDisaster ? "high" : "low",
    category: "other",
    confidenceScore: 75,
    sentiment: isDisaster ? "fear" : "nominal",
    aiReasoning: "Fallback semantic heuristic (Stricter Mode) applied (No active Gemini Key provisioned)."
  };
};

module.exports = { analyzeSignal };
