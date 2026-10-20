const { GoogleGenAI } = require('@google/genai');

// Initialize the Gemini client with your API key from .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function analyzeGymMachine(imageBuffer, mimeType = 'image/jpeg', libraryMachines = []) {
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
    { id: 'olympic-barbell-bench', name: 'Barbell' }
  ];

  const effectiveLibrary = Array.isArray(libraryMachines) && libraryMachines.length > 0
    ? libraryMachines.map(m => typeof m === 'string' ? { id: m.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: m } : { id: m.id || m.libraryId || m.name, name: m.name || m.title })
    : defaultLibrary;

  const libraryNamesWithId = effectiveLibrary
    .map(m => `"${m.name}" (libraryId: "${m.id}")`)
    .join(', ');

  const prompt = `You are an expert gym equipment recognition AI.
Analyze this photo and identify ANY gym equipment, machine, or free-weight shown.

Current machine library list:
${libraryNamesWithId}

GUIDELINES & CLASSIFICATION LOGIC:
1. Identify ANY gym equipment or machine shown in the photo, even if it is NOT present in our current machine library list.
2. If the identified machine matches an entry in our provided library list:
   - Set status to "identified"
   - Set "libraryId" to its exact libraryId from the list
   - Set "matchedLibraryId" to its exact libraryId from the list
   - Set "isNewMachine" to false
   - Set "title" to the recognized name
3. If the identified machine is NEW or not in our library:
   - Set status to "identified"
   - Set "libraryId" to null
   - Set "matchedLibraryId" to null
   - Set "isNewMachine" to true
   - Provide a generated "title", "description", "primaryMuscles", and "setupGuide" directly from your general knowledge.
4. Only if the photo does NOT contain any gym equipment, fitness gear, or weights (e.g. food, animals, landscapes, cars, household furniture):
   - Set status to "not_identified", "isNewMachine" to false, "libraryId" to null, "matchedLibraryId" to null, "title" to null.

Keep response strictly in valid JSON format ONLY:
{
  "status": "identified" or "not_identified",
  "isNewMachine": true or false,
  "libraryId": "matching-library-id or null",
  "matchedLibraryId": "matching-library-id or null",
  "title": "Machine or Equipment Name",
  "description": "Concise 1-2 sentence description of what this machine is and does.",
  "category": "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Cable Equipment" | "Cardio" | "Core" | "Other",
  "confidence": number between 0 and 100,
  "primaryMuscles": ["Primary Muscle 1", "Primary Muscle 2"],
  "setupGuide": [
    "Step 1: Brief seat, pin, or pad adjustment cue",
    "Step 2: Brief grip, posture, and positioning cue",
    "Step 3: Brief motion, breathing, and safety cue"
  ],
  "reasoning": "Brief 1-sentence identification rationale."
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType,
          },
        },
      ],
    });

    const textResponse = (response.text || '').replace(/```json/gi, '').replace(/```/gi, '').trim();
    const parsed = JSON.parse(textResponse);
    const resolvedTitle = parsed.title || parsed.machineName || parsed.match || null;
    const isIdentified = parsed.status === 'identified' && Boolean(resolvedTitle);
    const isNewMachine = Boolean(parsed.isNewMachine || (!parsed.libraryId && !parsed.matchedLibraryId && isIdentified));
    const matchedLibraryId = isNewMachine ? null : (parsed.matchedLibraryId || parsed.libraryId || null);
    const setupGuide = Array.isArray(parsed.setupGuide) && parsed.setupGuide.length > 0
      ? parsed.setupGuide
      : (Array.isArray(parsed.setupSteps) ? parsed.setupSteps : []);

    return {
      status: isIdentified ? 'identified' : 'not_identified',
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
      reasoning: parsed.reasoning || (isIdentified ? `Identified as ${resolvedTitle}` : 'Unrecognized machine')
    };
  } catch (error) {
    console.error('Gemini Vision Error:', error);
    return {
      status: 'not_identified',
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
      reasoning: error?.message || 'Gemini Vision error'
    };
  }
}

module.exports = { analyzeGymMachine };
