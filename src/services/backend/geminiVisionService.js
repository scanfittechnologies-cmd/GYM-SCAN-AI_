import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client with API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];

/**
 * High-speed Gemini Vision scanner for gym equipment.
 * Optimized for sub-2s latency:
 * - Low-latency model (gemini-3.5-flash-lite or gemini-3.8-flash with effortLevel: low)
 * - maxOutputTokens: 250
 * - temperature: 0.1
 * - responseMimeType: 'application/json'
 * - strictly concise JSON output (machineName, primaryMuscles, 3 short setup steps)
 */
export async function analyzeGymMachine(imageBuffer, mimeType = 'image/jpeg') {
  const allowedMachines = [
    'Lat Pulldown', 'Pec Deck', 'Hack Squat', 'Leg Extension', 
    'Leg Press', 'Chest Press', 'Cable Crossover', 'Seated Row', 
    'Shoulder Press', 'Ab Crunch', 'Dumbbell', 'Barbell',
    'Smith Machine', 'Cable Tower', 'Preacher Curl', 'Tricep Pushdown'
  ];

  const prompt = `You are a high-speed gym equipment recognition AI. Analyze this image and respond with concise JSON ONLY.

Allowed equipment list:
${allowedMachines.join(', ')}.

GUIDELINES:
1. If the image clearly shows gym equipment or free weights, set status to "identified" and machineName to the best match from the allowed list.
2. If the image is not gym equipment (e.g. food, animals, landscapes, cars, random objects), set status to "not_identified" and machineName to null.
3. Keep output strictly under 250 tokens and respond in valid JSON format ONLY:
{
  "status": "identified" or "not_identified",
  "machineName": "Exact Equipment Name from allowed list, or null",
  "confidence": number between 0 and 100,
  "primaryMuscles": ["Primary Muscle 1", "Primary Muscle 2"],
  "setupSteps": [
    "Step 1: Brief seat/pad adjustment",
    "Step 2: Brief grip/positioning cue",
    "Step 3: Brief motion/safety cue"
  ],
  "reasoning": "Brief 1-sentence identification rationale."
}`;

  let base64Data = '';
  let finalMimeType = mimeType;

  if (Buffer.isBuffer(imageBuffer)) {
    base64Data = imageBuffer.toString('base64');
  } else if (typeof imageBuffer === 'string') {
    if (imageBuffer.startsWith('data:')) {
      const parts = imageBuffer.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) finalMimeType = match[1];
      base64Data = parts[1] || '';
    } else {
      base64Data = imageBuffer;
    }
  }

  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS.filter(m => m !== PRIMARY_MODEL)];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      // Configure generation parameters for low latency (< 2 seconds)
      const generationConfig = {
        maxOutputTokens: 250,
        temperature: 0.1,
        responseMimeType: 'application/json'
      };

      // If using a model with thinking support (like 3.8-flash), set low thinking effort
      if (model.includes('3.8')) {
        generationConfig.thinkingConfig = {
          thinkingBudget: 0
        };
      }

      const response = await ai.models.generateContent({
        model,
        contents: [
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: finalMimeType,
            },
          },
        ],
        config: generationConfig,
      });

      // Clean response text to ensure it's pure JSON
      const rawText = (response.text || '').trim();
      const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseErr) {
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw parseErr;
        }
      }

      const machineName = parsed.machineName || parsed.match || null;
      const isIdentified = parsed.status === 'identified' && Boolean(machineName);

      return {
        status: isIdentified ? 'identified' : 'not_identified',
        match: machineName,
        machineName,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : (isIdentified ? 92 : 0),
        primaryMuscles: Array.isArray(parsed.primaryMuscles) ? parsed.primaryMuscles : [],
        setupSteps: Array.isArray(parsed.setupSteps) ? parsed.setupSteps.slice(0, 3) : [],
        reasoning: parsed.reasoning || (isIdentified ? `Identified as ${machineName}` : 'Unrecognized machine'),
        modelUsed: model
      };
    } catch (error) {
      lastError = error;
      console.warn(`[Gemini Vision] Model ${model} call failed:`, error?.message || error);
      // If error is invalid API key or image invalid, don't cascade through all models
      if (error?.status === 400 && String(error?.message).includes('API_KEY_INVALID')) {
        break;
      }
    }
  }

  console.error('[Gemini Vision] All models failed:', lastError);
  return {
    status: 'not_identified',
    match: null,
    machineName: null,
    confidence: 0,
    primaryMuscles: [],
    setupSteps: [],
    reasoning: lastError?.message || 'Gemini Vision analysis failed'
  };
}

// CommonJS compatibility export
export default { analyzeGymMachine };
