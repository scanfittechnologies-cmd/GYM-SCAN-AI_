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
export async function analyzeGymMachine(imageBuffer, mimeType = 'image/jpeg', libraryMachines = []) {
  const defaultLibrary = [
    { id: 'lat-pulldown', name: 'Lat Pulldown' },
    { id: 'pec-deck-machine', name: 'Pec Deck' },
    { id: 'hack-squat-machine', name: 'Hack Squat' },
    { id: 'leg-extension', name: 'Leg Extension' },
    { id: 'leg-press-45', name: 'Leg Press' },
    { id: 'seated-chest-press', name: 'Chest Press' },
    { id: 'cable-crossover-station', name: 'Cable Crossover' },
    { id: 'seated-cable-row', name: 'Seated Row' },
    { id: 'seated-shoulder-press', name: 'Shoulder Press' },
    { id: 'ab-crunch-bench', name: 'Ab Crunch' },
    { id: 'dumbbell-rack', name: 'Dumbbell' },
    { id: 'olympic-barbell-bench', name: 'Barbell' },
    { id: 'smith-machine', name: 'Smith Machine' },
    { id: 'functional-cable-trainer', name: 'Cable Tower' },
    { id: 'preacher-curl-bench', name: 'Preacher Curl' },
    { id: 'tricep-pressdown-station', name: 'Tricep Pushdown' },
    { id: 'assisted-pull-up-machine', name: 'Assisted Pull Up Machine' }
  ];

  const effectiveLibrary = Array.isArray(libraryMachines) && libraryMachines.length > 0
    ? libraryMachines.map(m => typeof m === 'string' ? { id: m.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: m } : { id: m.id || m.libraryId || m.name, name: m.name || m.title })
    : defaultLibrary;

  const libraryNamesWithId = effectiveLibrary
    .map(m => `"${m.name}" (libraryId: "${m.id}")`)
    .join(', ');

  const prompt = `You are an expert fitness machine classifier. Identify ANY gym equipment or machine present in the photo (e.g. Incline Bench Press, Lat Pulldown, Leg Press, Adductor, etc.). Always set \`isIdentified: true\` and return JSON containing \`title\`, \`description\`, \`primaryMuscles\`, and \`setupGuide\`. Never return a message stating an item is not in an allowed list.

Current machine library list (for reference and ID matching):
${libraryNamesWithId}

CRITICAL RECOGNITION RULES & GUIDELINES:
1. UNIVERSAL GYM EQUIPMENT RECOGNITION:
   - Identify ANY gym machine, equipment, apparatus, bench, rack, cable station, or free-weight shown.
   - Never check or enforce any "allowed list", "permitted list", or reject valid gym equipment because it is not included in a list.
   - Never return a message stating an item is not in an allowed list or permitted list.
2. SCREEN / PHOTO PREVIEW RELAXATION:
   - Do NOT reject an image or mark it as "not_identified" / "isIdentified: false" simply because it appears on a laptop screen, computer monitor, mobile device, TV screen, or photo preview.
   - If gym equipment or a fitness machine is visible in the photo—even when photographed from a screen or digital display—ALWAYS identify the machine depicted.
3. MATCHING LOGIC & JSON CONTRACT:
   - Always set \`isIdentified: true\` whenever gym equipment or a machine is present.
   - If the identified machine matches an entry in our reference library list:
     * Set "status" to "identified"
     * Set "isIdentified" to true
     * Set "libraryId" to its exact libraryId from the list
     * Set "matchedLibraryId" to its exact libraryId from the list
     * Set "isNewMachine" to false
     * Set "title" to the recognized name (e.g. "Incline Bench Press")
   - If the identified machine is NEW or not in our reference library:
     * Set "status" to "identified"
     * Set "isIdentified" to true
     * Set "libraryId" to null
     * Set "matchedLibraryId" to null
     * Set "isNewMachine" to true
     * Provide a generated "title", "description", "primaryMuscles", and "setupGuide" directly from your general fitness equipment knowledge.
4. ONLY REJECT TRUE NON-FITNESS CONTENT:
   - Only set "isIdentified" to false and "status" to "not_identified" if the photo genuinely contains NO gym equipment, weights, or fitness apparatus whatsoever (e.g. food, animals, outdoor landscapes with no fitness equipment, cars, or regular household furniture).

Keep response strictly in valid JSON format ONLY:
{
  "isIdentified": true,
  "status": "identified",
  "isNewMachine": false,
  "libraryId": "matching-library-id or null",
  "matchedLibraryId": "matching-library-id or null",
  "title": "Incline Bench Press",
  "description": "Concise 1-2 sentence description of what this machine is and does.",
  "category": "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Cable Equipment" | "Cardio" | "Core" | "Other",
  "confidence": 95,
  "primaryMuscles": ["Pectorals", "Front Deltoids", "Triceps"],
  "setupGuide": [
    "Step 1: Brief seat, pin, or pad adjustment cue",
    "Step 2: Brief grip, posture, and positioning cue",
    "Step 3: Brief motion, breathing, and safety cue"
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
      // Configure generation parameters
      const generationConfig = {
        maxOutputTokens: 350,
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

      const resolvedTitle = parsed.title || parsed.machineName || parsed.match || null;
      const isIdentified = (parsed.isIdentified === true || parsed.status === 'identified') && Boolean(resolvedTitle);
      const isNewMachine = Boolean(parsed.isNewMachine || (!parsed.libraryId && !parsed.matchedLibraryId && isIdentified));
      const matchedLibraryId = isNewMachine ? null : (parsed.matchedLibraryId || parsed.libraryId || null);
      const setupGuide = Array.isArray(parsed.setupGuide) && parsed.setupGuide.length > 0
        ? parsed.setupGuide
        : (Array.isArray(parsed.setupSteps) ? parsed.setupSteps : []);

      return {
        status: isIdentified ? 'identified' : 'not_identified',
        isIdentified,
        match: resolvedTitle,
        machineName: resolvedTitle,
        title: resolvedTitle,
        description: parsed.description || (resolvedTitle ? `Standard gym equipment: ${resolvedTitle}` : ''),
        category: parsed.category || 'Other',
        isNewMachine,
        libraryId: matchedLibraryId,
        matchedLibraryId,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : (isIdentified ? 92 : 0),
        primaryMuscles: Array.isArray(parsed.primaryMuscles) ? parsed.primaryMuscles : [],
        setupGuide: setupGuide.slice(0, 4),
        setupSteps: setupGuide.slice(0, 4),
        reasoning: parsed.reasoning || (isIdentified ? `Identified as ${resolvedTitle}` : 'Unrecognized machine'),
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
    isIdentified: false,
    match: null,
    machineName: null,
    title: null,
    description: '',
    category: 'Other',
    isNewMachine: false,
    libraryId: null,
    matchedLibraryId: null,
    confidence: 0,
    primaryMuscles: [],
    setupGuide: [],
    setupSteps: [],
    reasoning: lastError?.message || 'Gemini Vision analysis failed'
  };
}

// CommonJS compatibility export
export default { analyzeGymMachine };
