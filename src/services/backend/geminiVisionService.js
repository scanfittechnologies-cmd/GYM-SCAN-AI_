import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client with API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-2.5-flash-lite'];

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

  const prompt = `CRITICAL: Output the exact physical name of the equipment visible in the image into the \`machineName\` / \`title\` field. DO NOT map, force, or default the name to a predefined list.

You are an expert AI vision scanner for a gym application called ScanFit AI.
Your sole purpose is to analyze ANY image of gym equipment provided by the user—whether it is standard, custom, rare, vintage, or unbranded—and return immediate, accurate identification and form setup instructions.

CRITICAL BEHAVIOR RULES:
1. NO WHITELISTS OR RESTRICTIONS: Do NOT restrict your recognition to a pre-defined equipment list or array. Accept and analyze 100% of gym equipment photos (e.g., Hip Adduction Machine, Belt Squat, Pec Deck Fly, Cable Crossover, Incline Bench Press, etc.).
2. NEVER THROW ERRORS FOR UNCOMMON EQUIPMENT: Never return an error or message stating that the equipment is "not allowed", "unlisted", "not supported", or "not in database". Always set \`isIdentified: true\` and \`status: "identified"\` whenever any gym equipment is present.
3. ANATOMICAL & MECHANICAL INFERENCE: If a machine is unusual, custom-built, vintage, or missing clear branding, infer its primary target muscle and function based on its biomechanical design, seat positioning, footplates, handles, and leverage points.
4. SCREEN / PHOTO PREVIEW RELAXATION: Do NOT reject an image or mark it as unidentified simply because it appears on a screen or digital display.
5. ONLY REJECT TRUE NON-FITNESS CONTENT: Only set "isIdentified" to false if the image has zero gym equipment or fitness apparatus whatsoever (e.g., animals, food, outdoor landscapes with no equipment).

Reference library list (use strictly for libraryId matching if exact match exists, otherwise leave libraryId as null):
${libraryNamesWithId}

INSTRUCTIONS FOR OUTPUT:
You MUST respond with a valid JSON object matching the schema below:
{
  "machineName": "Exact name of the detected equipment",
  "title": "Exact name of the detected equipment",
  "targetMuscle": "Primary target muscle group (e.g., Legs - Inner Thighs, Upper Chest, Lats)",
  "primaryMuscles": ["Primary target muscle group"],
  "secondaryMuscles": ["Secondary muscle 1", "Secondary muscle 2"],
  "setupInstructions": [
    "Step 1: Seat adjustment and initial body positioning.",
    "Step 2: Grip/pad placement and pin load setup.",
    "Step 3: Execution path and key safety/form cue."
  ],
  "setupGuide": [
    "Step 1: Seat adjustment and initial body positioning.",
    "Step 2: Grip/pad placement and pin load setup.",
    "Step 3: Execution path and key safety/form cue."
  ],
  "category": "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Cable Equipment" | "Cardio" | "Core" | "Other",
  "confidence": 95,
  "isIdentified": true,
  "status": "identified",
  "isNewMachine": false,
  "libraryId": "matching-library-id or null",
  "matchedLibraryId": "matching-library-id or null",
  "description": "Concise 1-2 sentence description of what this machine is and does."
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

      const resolvedTitle = parsed.machineName || parsed.title || parsed.match || null;
      const isIdentified = (parsed.isIdentified === true || parsed.status === 'identified') && Boolean(resolvedTitle);
      const isNewMachine = Boolean(parsed.isNewMachine || (!parsed.libraryId && !parsed.matchedLibraryId && isIdentified));
      const matchedLibraryId = isNewMachine ? null : (parsed.matchedLibraryId || parsed.libraryId || null);
      const setupGuide = Array.isArray(parsed.setupInstructions) && parsed.setupInstructions.length > 0
        ? parsed.setupInstructions
        : (Array.isArray(parsed.setupGuide) && parsed.setupGuide.length > 0
          ? parsed.setupGuide
          : (Array.isArray(parsed.setupSteps) ? parsed.setupSteps : []));

      const primaryMuscles = Array.isArray(parsed.primaryMuscles) && parsed.primaryMuscles.length > 0
        ? parsed.primaryMuscles
        : (parsed.targetMuscle ? [parsed.targetMuscle] : []);

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
        targetMuscle: parsed.targetMuscle || primaryMuscles[0] || 'Full Body',
        primaryMuscles,
        secondaryMuscles: Array.isArray(parsed.secondaryMuscles) ? parsed.secondaryMuscles : [],
        setupInstructions: setupGuide.slice(0, 4),
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
