import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { RECOGNITION_CONFIG } from './recognitionConfig.js';

const MANIFEST_PATH = path.join(process.cwd(), 'reference_images', 'reference_manifest.json');

// Similarity threshold for accepting a reference match (0.75 = 75% similarity)
const MATCH_THRESHOLD = 0.75;

// Normalized class ID mapping
const CLASS_ID_MAP = {
  'pec-deck-fly': 'pec-deck-machine'
};

let referenceDescriptors = [];
let classMetadataMap = new Map();
let isInitialized = false;

function normalizeClassId(rawId) {
  return CLASS_ID_MAP[rawId] || rawId;
}

/**
 * Load class metadata from class_mapping.json if available
 */
function loadClassMetadata() {
  try {
    if (fs.existsSync(RECOGNITION_CONFIG.CLASS_MAPPING_PATH)) {
      const mappingRaw = fs.readFileSync(RECOGNITION_CONFIG.CLASS_MAPPING_PATH, 'utf-8');
      const classMapping = JSON.parse(mappingRaw);
      if (classMapping.indexToClass) {
        Object.values(classMapping.indexToClass).forEach(cls => {
          if (cls && cls.machineId) {
            classMetadataMap.set(cls.machineId, {
              machineName: cls.machineName || cls.machineId,
              category: cls.category || 'Full Body'
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn('[ReferenceMatcher] Could not load class mapping for metadata:', err.message);
  }

  // Fallback defaults for prototype 8 classes if not in class mapping
  const prototypeDefaults = {
    'assisted-pull-up-machine': { machineName: 'Assisted Pull-Up Machine', category: 'Back' },
    'hack-squat-machine': { machineName: 'Hack Squat Machine', category: 'Legs' },
    'incline-chest-press': { machineName: 'Incline Chest Press Machine', category: 'Chest' },
    'lat-pulldown': { machineName: 'Lat Pulldown Machine', category: 'Back' },
    'leg-extension': { machineName: 'Leg Extension Machine', category: 'Legs' },
    'leg-press-45': { machineName: 'Leg Press Machine', category: 'Legs' },
    'pec-deck-machine': { machineName: 'Pec Deck Machine', category: 'Chest' },
    'seated-cable-row': { machineName: 'Seated Cable Row Machine', category: 'Back' }
  };

  Object.entries(prototypeDefaults).forEach(([id, meta]) => {
    if (!classMetadataMap.has(id)) {
      classMetadataMap.set(id, meta);
    }
  });
}

/**
 * Extract feature descriptor from an image buffer:
 * - 64-bit dHash (Difference Hash for structural gradients)
 * - 256-element normalized grayscale grid (16x16 spatial structure)
 * - 192-element normalized RGB grid (8x8 color distribution)
 */
async function extractImageDescriptor(imageBuffer) {
  // A. 9x8 grayscale for 64-bit dHash
  const gray9x8 = await sharp(imageBuffer)
    .resize(9, 8, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer();

  let dHashBits = '';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = gray9x8[y * 9 + x];
      const right = gray9x8[y * 9 + x + 1];
      dHashBits += left < right ? '1' : '0';
    }
  }

  // B. 16x16 Normalized Grayscale Grid (256 values)
  const gray16x16 = await sharp(imageBuffer)
    .resize(16, 16, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer();

  const grayGrid = new Float32Array(256);
  let sumG = 0;
  for (let i = 0; i < 256; i++) {
    grayGrid[i] = gray16x16[i] / 255.0;
    sumG += grayGrid[i];
  }
  const meanG = sumG / 256;
  let normG = 0;
  for (let i = 0; i < 256; i++) {
    grayGrid[i] -= meanG;
    normG += grayGrid[i] * grayGrid[i];
  }
  normG = Math.sqrt(normG) || 1e-6;
  for (let i = 0; i < 256; i++) {
    grayGrid[i] /= normG;
  }

  // C. 8x8 Normalized RGB Grid (192 values)
  const rgb8x8 = await sharp(imageBuffer)
    .resize(8, 8, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer();

  const rgbGrid = new Float32Array(192);
  let sumC = 0;
  for (let i = 0; i < 192; i++) {
    rgbGrid[i] = rgb8x8[i] / 255.0;
    sumC += rgbGrid[i];
  }
  const meanC = sumC / 192;
  let normC = 0;
  for (let i = 0; i < 192; i++) {
    rgbGrid[i] -= meanC;
    normC += rgbGrid[i] * rgbGrid[i];
  }
  normC = Math.sqrt(normC) || 1e-6;
  for (let i = 0; i < 192; i++) {
    rgbGrid[i] /= normC;
  }

  return { dHashBits, grayGrid, rgbGrid };
}

/**
 * Compute similarity between two image descriptors (0.0 to 1.0)
 */
function computeSimilarity(desc1, desc2) {
  // 1. dHash Hamming Similarity
  let hamming = 0;
  for (let i = 0; i < 64; i++) {
    if (desc1.dHashBits[i] !== desc2.dHashBits[i]) hamming++;
  }
  const dHashSim = 1 - (hamming / 64);

  // 2. Grayscale Grid Cosine Similarity
  let dotG = 0;
  for (let i = 0; i < 256; i++) {
    dotG += desc1.grayGrid[i] * desc2.grayGrid[i];
  }
  const graySim = Math.max(0, dotG);

  // 3. RGB Grid Cosine Similarity
  let dotC = 0;
  for (let i = 0; i < 192; i++) {
    dotC += desc1.rgbGrid[i] * desc2.rgbGrid[i];
  }
  const rgbSim = Math.max(0, dotC);

  // Weighted score: 40% dHash + 40% spatial grayscale + 20% RGB color
  return (0.40 * dHashSim) + (0.40 * graySim) + (0.20 * rgbSim);
}

/**
 * Initialize reference matcher by building reference image index from manifest
 */
export async function initializeReferenceMatcher() {
  if (isInitialized && referenceDescriptors.length > 0) {
    return { status: 'READY', count: referenceDescriptors.length };
  }

  console.log('[ReferenceMatcher] Precomputing reference image descriptors...');
  loadClassMetadata();

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.warn(`[ReferenceMatcher] Manifest file not found at ${MANIFEST_PATH}`);
    return { status: 'ERROR', message: 'Manifest file missing' };
  }

  try {
    const manifestRaw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    const manifest = JSON.parse(manifestRaw);

    const descriptors = [];
    for (const imgMeta of manifest.images || []) {
      const fullPath = path.join(process.cwd(), imgMeta.relative_path);
      if (!fs.existsSync(fullPath)) {
        console.warn(`[ReferenceMatcher] Skipping missing reference image: ${imgMeta.relative_path}`);
        continue;
      }

      const fileBuf = fs.readFileSync(fullPath);
      const desc = await extractImageDescriptor(fileBuf);
      const normalizedClassId = normalizeClassId(imgMeta.class_id);
      const meta = classMetadataMap.get(normalizedClassId) || {
        machineName: normalizedClassId,
        category: 'Full Body'
      };

      descriptors.push({
        machineId: normalizedClassId,
        rawClassId: imgMeta.class_id,
        filename: imgMeta.filename,
        relative_path: imgMeta.relative_path,
        machineName: meta.machineName,
        category: meta.category,
        descriptor: desc
      });
    }

    referenceDescriptors = descriptors;
    isInitialized = true;
    console.log(`[ReferenceMatcher] Loaded ${referenceDescriptors.length} reference images`);
    return { status: 'READY', count: referenceDescriptors.length };
  } catch (err) {
    console.error('[ReferenceMatcher] Failed to initialize reference descriptors:', err);
    return { status: 'ERROR', message: err.message };
  }
}

/**
 * Perform visual similarity matching for an uploaded image payload
 */
export async function matchReferenceImage(imageBase64DataUrl) {
  if (!isInitialized || referenceDescriptors.length === 0) {
    await initializeReferenceMatcher();
  }

  if (referenceDescriptors.length === 0) {
    return { matched: false };
  }

  try {
    const base64Data = imageBase64DataUrl.split(',')[1] || imageBase64DataUrl;
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const queryDescriptor = await extractImageDescriptor(imageBuffer);

    // Compute similarity against all reference descriptors
    const matchesByClass = new Map();

    for (const ref of referenceDescriptors) {
      const similarity = computeSimilarity(queryDescriptor, ref.descriptor);
      const existingBest = matchesByClass.get(ref.machineId);

      if (!existingBest || similarity > existingBest.similarity) {
        matchesByClass.set(ref.machineId, {
          machineId: ref.machineId,
          machineName: ref.machineName,
          category: ref.category,
          filename: ref.filename,
          similarity
        });
      }
    }

    const sortedClassMatches = Array.from(matchesByClass.values())
      .sort((a, b) => b.similarity - a.similarity);

    if (sortedClassMatches.length === 0) {
      return { matched: false };
    }

    const bestMatch = sortedClassMatches[0];
    const bestSimPct = (bestMatch.similarity * 100).toFixed(2);
    console.log(`[ReferenceMatcher] Best match: ${bestMatch.machineId} (${bestMatch.filename}) similarity=${bestSimPct}%`);

    if (bestMatch.similarity >= MATCH_THRESHOLD) {
      console.log(`[ReferenceMatcher] Reference match accepted (similarity ${bestSimPct}% >= ${MATCH_THRESHOLD * 100}%)`);

      const candidates = sortedClassMatches.slice(0, RECOGNITION_CONFIG.MAX_CANDIDATES || 3).map(m => ({
        machineId: m.machineId,
        machineName: m.machineName,
        category: m.category,
        confidence: Math.round(m.similarity * 100)
      }));

      const confidence = Math.round(bestMatch.similarity * 100);

      return {
        matched: true,
        status: 'identified',
        machineId: bestMatch.machineId,
        machineName: bestMatch.machineName,
        category: bestMatch.category,
        confidence,
        visualFeatures: [`Reference Image Similarity Match (${confidence}%)`],
        candidates,
        rawOutput: {
          machineName: bestMatch.machineName,
          category: bestMatch.category,
          confidence,
          confidenceLevel: 'high',
          exactModelIdentified: true,
          exercise: bestMatch.machineName,
          visualFeatures: [`Matched reference image ${bestMatch.filename}`],
          possibleMatches: candidates
        },
        model: 'reference-image-match'
      };
    } else {
      console.log(`[ReferenceMatcher] Reference match rejected (similarity ${bestSimPct}% < ${MATCH_THRESHOLD * 100}%)`);
      return { matched: false };
    }
  } catch (err) {
    console.error('[ReferenceMatcher] Error matching reference image:', err);
    return { matched: false, error: err.message };
  }
}
