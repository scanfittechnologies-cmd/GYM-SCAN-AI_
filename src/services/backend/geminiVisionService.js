import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client with API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeGymMachine(imageBuffer, mimeType = 'image/jpeg') {
  const allowedMachines = [
    'Lat Pulldown', 'Pec Deck', 'Hack Squat', 'Leg Extension', 
    'Leg Press', 'Chest Press', 'Cable Crossover', 'Seated Row', 
    'Shoulder Press', 'Ab Crunch', 'Dumbbell', 'Barbell'
  ];

  const prompt = `
  You are an expert gym equipment classifier. Analyze the uploaded image and match it to EXACTLY ONE item from this allowed list:
  ${allowedMachines.join(', ')}.

  GUIDELINES:
  1. Structural Focus: Look for core gym machine markers like cables, pulleys, weight stacks, vinyl pads, and frame configurations.
  2. Lenient Confidence: If key structural features strongly indicate an allowed machine from the list (even if the angle is partial, lighting is dim, or parts are slightly obscured), classify it as "identified" with a confidence score between 75 and 99. Do not penalize minor visual obstructions.
  3. Strict Rejection: If the image depicts non-gym objects, office furniture, or cardio machines (like treadmills, stationary bikes, or stair climbers), classify it as "not_identified".

  You must return a valid JSON object ONLY, with no extra markdown formatting, code blocks, or text outside the braces:
  {
    "status": "identified" or "not_identified",
    "match": "Exact name from the allowed list, or null if not identified",
    "confidence": number between 0 and 100,
    "reasoning": "A brief explanation focusing on the structural components observed."
  }
`;

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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash', // lightweight vision model
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: finalMimeType,
          },
        },
      ],
    });

    // Clean response text to ensure it's pure JSON
    const textResponse = (response.text || '').replace(/```json/gi, '').replace(/```/gi, '').trim();
    return JSON.parse(textResponse);
  } catch (error) {
    console.error('Gemini Vision Error:', error);
    return { status: 'not_identified', match: null, confidence: 0 };
  }
}

// CommonJS compatibility export
export default { analyzeGymMachine };
