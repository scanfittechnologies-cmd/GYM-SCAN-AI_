import { RECOGNITION_CONFIG } from './recognitionConfig.js';

/**
 * CLASS_MAPPING: Maps Roboflow raw prediction class strings to canonical GymScan machine info.
 *
 * Keys are lowercase / normalised versions of what Roboflow may return.
 * Values carry: machineId (matching machines.ts IDs), machineName, category.
 *
 * Three-tier confidence system (configurable in recognitionConfig.js / .env):
 *   >= HIGH_CONFIDENCE_MIN (45%) => status: 'identified'  — machine confirmed
 *   >= UNCERTAIN_MIN (30%) and < HIGH  => status: 'uncertain' — top-3 suggestions for one-tap confirm
 *   <  UNCERTAIN_MIN (30%)             => status: 'not_identified' — trigger manual search fallback
 */
const CLASS_MAPPING = {
  // ── Chest / Push ──────────────────────────────────────────────────────────
  'bench_press':            { machineId: 'bench-press',          machineName: 'Bench Press',             category: 'Chest' },
  'bench-press':            { machineId: 'bench-press',          machineName: 'Bench Press',             category: 'Chest' },
  'benchpress':             { machineId: 'bench-press',          machineName: 'Bench Press',             category: 'Chest' },
  'flat_bench_press':       { machineId: 'bench-press',          machineName: 'Bench Press',             category: 'Chest' },
  'chest_press':            { machineId: 'chest-press',          machineName: 'Chest Press Machine',     category: 'Chest' },
  'chest-press':            { machineId: 'chest-press',          machineName: 'Chest Press Machine',     category: 'Chest' },
  'chest_press_machine':    { machineId: 'chest-press',          machineName: 'Chest Press Machine',     category: 'Chest' },
  'pec_deck':               { machineId: 'pec-deck',             machineName: 'Pec Deck',               category: 'Chest' },
  'pec-deck':               { machineId: 'pec-deck',             machineName: 'Pec Deck',               category: 'Chest' },
  'pec_deck_fly':           { machineId: 'pec-deck',             machineName: 'Pec Deck',               category: 'Chest' },
  'pec_deck_machine':       { machineId: 'pec-deck',             machineName: 'Pec Deck',               category: 'Chest' },
  'chest_fly':              { machineId: 'pec-deck',             machineName: 'Pec Deck',               category: 'Chest' },
  'cable_fly':              { machineId: 'cable-crossover',      machineName: 'Cable Crossover',         category: 'Chest' },
  'cable_crossover':        { machineId: 'cable-crossover',      machineName: 'Cable Crossover',         category: 'Chest' },
  'cable-crossover':        { machineId: 'cable-crossover',      machineName: 'Cable Crossover',         category: 'Chest' },
  'incline_bench_press':    { machineId: 'incline-bench-press',  machineName: 'Incline Bench Press',     category: 'Chest' },
  'incline_press':          { machineId: 'incline-bench-press',  machineName: 'Incline Bench Press',     category: 'Chest' },
  'decline_bench_press':    { machineId: 'decline-bench-press',  machineName: 'Decline Bench Press',     category: 'Chest' },
  'smith_machine':          { machineId: 'smith-machine',        machineName: 'Smith Machine',           category: 'Full Body' },
  'smith-machine':          { machineId: 'smith-machine',        machineName: 'Smith Machine',           category: 'Full Body' },

  // ── Back / Pull ───────────────────────────────────────────────────────────
  'lat_pulldown':           { machineId: 'lat-pulldown',         machineName: 'Lat Pulldown',            category: 'Back' },
  'lat-pulldown':           { machineId: 'lat-pulldown',         machineName: 'Lat Pulldown',            category: 'Back' },
  'lat_pull_down':          { machineId: 'lat-pulldown',         machineName: 'Lat Pulldown',            category: 'Back' },
  'cable_lat_pulldown':     { machineId: 'lat-pulldown',         machineName: 'Lat Pulldown',            category: 'Back' },
  'seated_cable_row':       { machineId: 'seated-cable-row',     machineName: 'Seated Cable Row',        category: 'Back' },
  'cable_row':              { machineId: 'seated-cable-row',     machineName: 'Seated Cable Row',        category: 'Back' },
  'cable-row':              { machineId: 'seated-cable-row',     machineName: 'Seated Cable Row',        category: 'Back' },
  'low_row':                { machineId: 'seated-cable-row',     machineName: 'Seated Cable Row',        category: 'Back' },
  'assisted_pull_up':       { machineId: 'assisted-pull-up',     machineName: 'Assisted Pull-Up Machine', category: 'Back' },
  'pull_up_machine':        { machineId: 'assisted-pull-up',     machineName: 'Assisted Pull-Up Machine', category: 'Back' },
  'assisted_pullup':        { machineId: 'assisted-pull-up',     machineName: 'Assisted Pull-Up Machine', category: 'Back' },
  'back_extension':         { machineId: 'back-extension',       machineName: 'Back Extension Machine',  category: 'Back' },
  'hyperextension':         { machineId: 'back-extension',       machineName: 'Back Extension Machine',  category: 'Back' },
  't_bar_row':              { machineId: 't-bar-row',            machineName: 'T-Bar Row',               category: 'Back' },
  'tbar_row':               { machineId: 't-bar-row',            machineName: 'T-Bar Row',               category: 'Back' },
  'pullover_machine':       { machineId: 'pull-over',            machineName: 'Pull Over Machine',       category: 'Back' },
  'pull_over_machine':      { machineId: 'pull-over',            machineName: 'Pull Over Machine',       category: 'Back' },

  // ── Shoulders ─────────────────────────────────────────────────────────────
  'shoulder_press':         { machineId: 'shoulder-press',       machineName: 'Shoulder Press Machine',  category: 'Shoulders' },
  'shoulder_press_machine': { machineId: 'shoulder-press',       machineName: 'Shoulder Press Machine',  category: 'Shoulders' },
  'overhead_press':         { machineId: 'shoulder-press',       machineName: 'Shoulder Press Machine',  category: 'Shoulders' },
  'military_press':         { machineId: 'shoulder-press',       machineName: 'Shoulder Press Machine',  category: 'Shoulders' },
  'lateral_raise_machine':  { machineId: 'lateral-raise',        machineName: 'Lateral Raise Machine',   category: 'Shoulders' },
  'lateral_raise':          { machineId: 'lateral-raise',        machineName: 'Lateral Raise Machine',   category: 'Shoulders' },

  // ── Arms ──────────────────────────────────────────────────────────────────
  'preacher_curl':          { machineId: 'preacher-curl',        machineName: 'Preacher Curl Machine',   category: 'Arms' },
  'preacher_curl_machine':  { machineId: 'preacher-curl',        machineName: 'Preacher Curl Machine',   category: 'Arms' },
  'cable_curl':             { machineId: 'cable-curl',           machineName: 'Cable Curl',              category: 'Arms' },
  'arm_curl':               { machineId: 'preacher-curl',        machineName: 'Preacher Curl Machine',   category: 'Arms' },
  'bicep_curl_machine':     { machineId: 'preacher-curl',        machineName: 'Preacher Curl Machine',   category: 'Arms' },
  'tricep_pushdown':        { machineId: 'tricep-pushdown',      machineName: 'Tricep Pushdown',         category: 'Arms' },
  'cable_tricep_pushdown':  { machineId: 'tricep-pushdown',      machineName: 'Tricep Pushdown',         category: 'Arms' },
  'tricep_extension':       { machineId: 'tricep-pushdown',      machineName: 'Tricep Pushdown',         category: 'Arms' },
  'tricep_machine':         { machineId: 'tricep-machine',       machineName: 'Tricep Machine',          category: 'Arms' },
  'arm_extension':          { machineId: 'tricep-pushdown',      machineName: 'Tricep Pushdown',         category: 'Arms' },
  'dip_machine':            { machineId: 'dip-machine',          machineName: 'Dip Machine',             category: 'Arms' },
  'assisted_dip':           { machineId: 'dip-machine',          machineName: 'Dip Machine',             category: 'Arms' },

  // ── Legs ──────────────────────────────────────────────────────────────────
  'leg_press':              { machineId: 'leg-press',            machineName: 'Leg Press',               category: 'Legs' },
  'leg-press':              { machineId: 'leg-press',            machineName: 'Leg Press',               category: 'Legs' },
  'leg_press_45':           { machineId: 'leg-press',            machineName: 'Leg Press',               category: 'Legs' },
  '45_leg_press':           { machineId: 'leg-press',            machineName: 'Leg Press',               category: 'Legs' },
  'hack_squat':             { machineId: 'hack-squat',           machineName: 'Hack Squat Machine',      category: 'Legs' },
  'hack-squat':             { machineId: 'hack-squat',           machineName: 'Hack Squat Machine',      category: 'Legs' },
  'hack_squat_machine':     { machineId: 'hack-squat',           machineName: 'Hack Squat Machine',      category: 'Legs' },
  'leg_extension':          { machineId: 'leg-extension',        machineName: 'Leg Extension',           category: 'Legs' },
  'leg-extension':          { machineId: 'leg-extension',        machineName: 'Leg Extension',           category: 'Legs' },
  'knee_extension':         { machineId: 'leg-extension',        machineName: 'Leg Extension',           category: 'Legs' },
  'leg_extension_machine':  { machineId: 'leg-extension',        machineName: 'Leg Extension',           category: 'Legs' },
  'leg_curl':               { machineId: 'leg-curl',             machineName: 'Leg Curl Machine',        category: 'Legs' },
  'leg-curl':               { machineId: 'leg-curl',             machineName: 'Leg Curl Machine',        category: 'Legs' },
  'hamstring_curl':         { machineId: 'leg-curl',             machineName: 'Leg Curl Machine',        category: 'Legs' },
  'lying_leg_curl':         { machineId: 'leg-curl',             machineName: 'Leg Curl Machine',        category: 'Legs' },
  'seated_leg_curl':        { machineId: 'leg-curl',             machineName: 'Leg Curl Machine',        category: 'Legs' },
  'calf_raise':             { machineId: 'calf-raise',           machineName: 'Calf Raise Machine',      category: 'Legs' },
  'calf_raise_machine':     { machineId: 'calf-raise',           machineName: 'Calf Raise Machine',      category: 'Legs' },
  'seated_calf_raise':      { machineId: 'calf-raise',           machineName: 'Calf Raise Machine',      category: 'Legs' },
  'standing_calf_raise':    { machineId: 'calf-raise',           machineName: 'Calf Raise Machine',      category: 'Legs' },
  'hip_adductor':           { machineId: 'hip-adductor',         machineName: 'Hip Adductor Machine',    category: 'Legs' },
  'inner_thigh':            { machineId: 'hip-adductor',         machineName: 'Hip Adductor Machine',    category: 'Legs' },
  'adductor_machine':       { machineId: 'hip-adductor',         machineName: 'Hip Adductor Machine',    category: 'Legs' },
  'hip_abductor':           { machineId: 'hip-abductor',         machineName: 'Hip Abductor Machine',    category: 'Legs' },
  'outer_thigh':            { machineId: 'hip-abductor',         machineName: 'Hip Abductor Machine',    category: 'Legs' },
  'abductor_machine':       { machineId: 'hip-abductor',         machineName: 'Hip Abductor Machine',    category: 'Legs' },
  'glute_kickback':         { machineId: 'glute-kickback',       machineName: 'Glute Kickback Machine',  category: 'Legs' },
  'hip_thrust_machine':     { machineId: 'hip-thrust',           machineName: 'Hip Thrust Machine',      category: 'Legs' },

  // ── Core / Abs ────────────────────────────────────────────────────────────
  'ab_crunch':              { machineId: 'ab-crunch',            machineName: 'Ab Crunch Machine',       category: 'Core' },
  'abdominal_crunch':       { machineId: 'ab-crunch',            machineName: 'Ab Crunch Machine',       category: 'Core' },
  'ab_machine':             { machineId: 'ab-crunch',            machineName: 'Ab Crunch Machine',       category: 'Core' },
  'torso_rotation':         { machineId: 'torso-rotation',       machineName: 'Torso Rotation Machine',  category: 'Core' },
  'rotary_torso':           { machineId: 'torso-rotation',       machineName: 'Torso Rotation Machine',  category: 'Core' },
  'cable_crunch':           { machineId: 'cable-crunch',         machineName: 'Cable Crunch',            category: 'Core' },

  // ── Cardio ────────────────────────────────────────────────────────────────
  'treadmill':              { machineId: 'treadmill',            machineName: 'Treadmill',               category: 'Cardio' },
  'elliptical':             { machineId: 'elliptical',           machineName: 'Elliptical Machine',      category: 'Cardio' },
  'elliptical_trainer':     { machineId: 'elliptical',           machineName: 'Elliptical Machine',      category: 'Cardio' },
  'stationary_bike':        { machineId: 'stationary-bike',      machineName: 'Stationary Bike',         category: 'Cardio' },
  'exercise_bike':          { machineId: 'stationary-bike',      machineName: 'Stationary Bike',         category: 'Cardio' },
  'spin_bike':              { machineId: 'stationary-bike',      machineName: 'Stationary Bike',         category: 'Cardio' },
  'rowing_erg':             { machineId: 'rowing-machine',       machineName: 'Rowing Machine (Cardio)', category: 'Cardio' },
  'concept2':               { machineId: 'rowing-machine',       machineName: 'Rowing Machine (Cardio)', category: 'Cardio' },
  'stair_climber':          { machineId: 'stair-climber',        machineName: 'Stair Climber',           category: 'Cardio' },
  'stairmaster':            { machineId: 'stair-climber',        machineName: 'Stair Climber',           category: 'Cardio' },
  'ski_erg':                { machineId: 'ski-erg',              machineName: 'Ski Erg',                 category: 'Cardio' },
  'assault_bike':           { machineId: 'assault-bike',         machineName: 'Assault Bike',            category: 'Cardio' },

  // ── Functional / Cable ────────────────────────────────────────────────────
  'cable_machine':          { machineId: 'cable-machine',        machineName: 'Cable Machine',           category: 'Full Body' },
  'functional_trainer':     { machineId: 'cable-machine',        machineName: 'Cable Machine',           category: 'Full Body' },
  'cable_tower':            { machineId: 'cable-machine',        machineName: 'Cable Machine',           category: 'Full Body' },

  // ── Full Body ─────────────────────────────────────────────────────────────
  'power_rack':             { machineId: 'power-rack',           machineName: 'Power Rack',              category: 'Full Body' },
  'squat_rack':             { machineId: 'squat-rack',           machineName: 'Squat Rack',              category: 'Full Body' },
  'power_cage':             { machineId: 'power-rack',           machineName: 'Power Rack',              category: 'Full Body' },
  'multi_gym':              { machineId: 'multi-gym',            machineName: 'Multi-Gym Station',       category: 'Full Body' },
  'multi_station':          { machineId: 'multi-gym',            machineName: 'Multi-Gym Station',       category: 'Full Body' },
};

/**
 * Resolve a raw Roboflow class label to its canonical GymScan machine entry.
 * Tries exact normalised lookup, then partial/substring matching, then generates a generic entry.
 *
 * @param {string} rawClass - Class label returned by Roboflow
 * @returns {{ machineId: string, machineName: string, category: string }}
 */
function resolveClass(rawClass) {
  const normalised = rawClass.toLowerCase().trim().replace(/\s+/g, '_');

  if (CLASS_MAPPING[normalised]) return CLASS_MAPPING[normalised];

  // Try hyphen variant
  const hyphenised = normalised.replace(/-/g, '_');
  if (CLASS_MAPPING[hyphenised]) return CLASS_MAPPING[hyphenised];

  // Partial substring match
  for (const [key, value] of Object.entries(CLASS_MAPPING)) {
    if (normalised.includes(key) || key.includes(normalised)) return value;
  }

  // Fallback: generate from raw class name
  return {
    machineId: rawClass.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    machineName: rawClass.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    category: 'Gym Equipment'
  };
}

/**
 * Call the Roboflow Serverless Inference API:
 * POST https://serverless.roboflow.com/{ROBOFLOW_MODEL_ID}?api_key={ROBOFLOW_API_KEY}
 *
 * Three-tier confidence decision (thresholds from recognitionConfig.js / .env):
 *   >= HIGH_CONFIDENCE_MIN (45%)                   => status: 'identified'    (success)
 *   >= UNCERTAIN_MIN (30%) and < HIGH              => status: 'uncertain'     (top-3 mapped suggestions for one-tap confirm)
 *   <  UNCERTAIN_MIN (30%)                         => status: 'not_identified' (trigger manual search fallback)
 *
 * @param {string} imageBase64DataUrl - Data URL (e.g., data:image/jpeg;base64,...)
 * @returns {Promise<object>} Parsed recognition result conforming to GymScan contract
 */
export async function inferWithRoboflow(imageBase64DataUrl) {
  const startTime = Date.now();
  const apiKey = RECOGNITION_CONFIG.ROBOFLOW_API_KEY;
  const modelId = RECOGNITION_CONFIG.ROBOFLOW_MODEL_ID;

  if (!apiKey || !modelId) {
    return {
      status: 'error',
      errorType: 'CONFIG_MISSING',
      message: 'Roboflow API key or Model ID not configured in .env file.'
    };
  }

  // Strip prefix data URL if present to obtain clean base64 payload
  const base64Data = imageBase64DataUrl.includes(',')
    ? imageBase64DataUrl.split(',')[1]
    : imageBase64DataUrl;

  const endpoint = `https://serverless.roboflow.com/${modelId}?api_key=${encodeURIComponent(apiKey)}`;

  console.log(`[Roboflow] Querying model: ${modelId} at https://serverless.roboflow.com/...`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: base64Data
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Roboflow] API error HTTP ${response.status}:`, errText);
      return {
        status: 'error',
        errorType: 'ROBOFLOW_API_ERROR',
        httpStatus: response.status,
        message: `Roboflow API responded with HTTP ${response.status}: ${errText}`
      };
    }

    const data = await response.json();
    const processingTimeMs = Date.now() - startTime;

    // Normalise various Roboflow response shapes into a flat predictions array
    let rawPredictions = [];

    if (Array.isArray(data.predictions)) {
      rawPredictions = data.predictions;
    } else if (data.predictions && typeof data.predictions === 'object') {
      // Classification dictionary format: { "bench_press": { confidence: 0.92 }, ... }
      rawPredictions = Object.entries(data.predictions).map(([className, val]) => ({
        class: className,
        confidence: typeof val === 'object' && val !== null ? val.confidence : Number(val)
      }));
    } else if (data.top && typeof data.confidence === 'number') {
      rawPredictions = [{ class: data.top, confidence: data.confidence }];
    }

    // ── Guard 1: Empty predictions ────────────────────────────────────────────
    if (!rawPredictions || rawPredictions.length === 0) {
      console.log('[Roboflow] Predictions array is empty. Returning not_identified.');
      return {
        status: 'not_identified',
        machineId: null,
        machineName: null,
        category: 'Unknown',
        confidence: 0,
        reason: 'Empty prediction result list returned from Roboflow model.',
        candidates: [],
        rawOutput: {
          machineName: 'Unknown',
          category: 'Unknown',
          confidence: 0,
          confidenceLevel: 'low',
          exactModelIdentified: false,
          exercise: 'None',
          visualFeatures: ['No detection extracted by Roboflow'],
          possibleMatches: []
        },
        model: `roboflow-${modelId}`,
        processingTimeMs
      };
    }

    // ── Pre-filter 1: Bounding Box Area ───────────────────────────────────────
    // For object-detection responses each prediction has x, y, width, height
    // (pixel values relative to the image). Ignore detections whose bounding box
    // covers less than 15% of the total image area — these are almost certainly
    // background noise or tiny partial views of a machine rather than the primary
    // subject. Classification-only responses have no bbox fields, so we skip the
    // filter for those (width/height will be undefined).
    const imageWidth  = data.image?.width  || 0;
    const imageHeight = data.image?.height || 0;
    const imageArea   = imageWidth * imageHeight;
    const BBOX_MIN_AREA_RATIO = 0.15; // 15% of total image area

    const bboxFiltered = rawPredictions.filter(p => {
      // If there are no bbox fields this is a classification result — keep it.
      if (p.width === undefined || p.height === undefined) return true;
      if (imageArea === 0) return true; // Can't compute ratio — keep it.
      const bboxArea = (p.width || 0) * (p.height || 0);
      const ratio = bboxArea / imageArea;
      if (ratio < BBOX_MIN_AREA_RATIO) {
        console.log(`[Roboflow] BBox filter: dropping "${p.class}" — bbox ${Math.round(ratio * 100)}% < ${Math.round(BBOX_MIN_AREA_RATIO * 100)}% min area`);
        return false;
      }
      return true;
    });

    // ── Pre-filter 2: NMS — sort strictly by confidence (descending) ──────────
    // Non-Maximum Suppression: keep only the highest-confidence detection per
    // class and sort all remaining detections by confidence so top1 is always
    // the strongest signal.
    const seenClasses = new Set();
    const nmsFiltered = bboxFiltered
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .filter(p => {
        const cls = String(p.class || p.label || '').toLowerCase().trim();
        if (seenClasses.has(cls)) return false;
        seenClasses.add(cls);
        return true;
      });

    // ── Debug: log filtered predictions so we can verify the top detection ────
    console.log('[Roboflow] Filtered Predictions:', nmsFiltered.map(p => ({
      class: p.class,
      confidence: `${Math.round((p.confidence || 0) * 100)}%`,
      ...(p.width !== undefined ? { bboxArea: `${p.width}x${p.height}` } : {})
    })));

    // Use the NMS-filtered + sorted array going forward
    const sortedPredictions = nmsFiltered;

    // ── Guard 2: No top prediction ────────────────────────────────────────────
    const top1 = sortedPredictions[0];
    if (!top1) {
      return {
        status: 'not_identified',
        machineId: null,
        machineName: null,
        category: 'Unknown',
        confidence: 0,
        reason: 'No valid top prediction extracted.',
        candidates: [],
        model: `roboflow-${modelId}`,
        processingTimeMs
      };
    }

    const topRawClass      = String(top1.class || top1.label || 'Unknown').trim();
    const topRatio         = typeof top1.confidence === 'number' ? top1.confidence : 0;
    const topPct           = Math.round(topRatio * 100);

    // Load thresholds from config (defaults: HIGH=0.50, LOW=0.35)
    //   >= HIGH (50%)        → identified  (direct success)
    //   >= LOW  (35%), < HIGH → uncertain   (one-tap confirm UI)
    //   <  LOW  (35%)        → not_identified (manual search fallback)
    const HIGH = RECOGNITION_CONFIG.THRESHOLDS.HIGH_CONFIDENCE_MIN;
    const LOW  = RECOGNITION_CONFIG.THRESHOLDS.UNCERTAIN_MIN;

    console.log(`[Roboflow] Top: "${topRawClass}" @ ${topPct}%  (need >= ${Math.round(HIGH * 100)}% for identified, >= ${Math.round(LOW * 100)}% for uncertain)`);

    // Build top-3 candidates (always mapped through CLASS_MAPPING)
    const maxCandidates = RECOGNITION_CONFIG.MAX_CANDIDATES || 3;
    const candidates = sortedPredictions.slice(0, maxCandidates).map(p => {
      const rawCls = String(p.class || p.label || 'Unknown').trim();
      const resolved = resolveClass(rawCls);
      return {
        machineId: resolved.machineId,
        machineName: resolved.machineName,
        category: resolved.category,
        confidence: Math.round((p.confidence || 0) * 100)
      };
    });

    // ── Tier 3: < LOW  →  not_identified ─────────────────────────────────────
    if (topRatio < LOW) {
      console.log(`[Roboflow] ${topPct}% < ${Math.round(LOW * 100)}% threshold → not_identified`);
      return {
        status: 'not_identified',
        machineId: null,
        machineName: null,
        category: 'Unknown',
        confidence: topPct,
        reason: `Roboflow top confidence (${topPct}%) is below the required ${Math.round(LOW * 100)}% threshold.`,
        candidates: [],
        rawOutput: {
          machineName: 'Unknown',
          category: 'Unknown',
          confidence: topPct,
          confidenceLevel: 'low',
          exactModelIdentified: false,
          exercise: 'None',
          visualFeatures: [`Roboflow inference (${topPct}% — below ${Math.round(LOW * 100)}% threshold)`],
          possibleMatches: []
        },
        model: `roboflow-${modelId}`,
        processingTimeMs
      };
    }

    // Resolve top-1 class via CLASS_MAPPING
    const top1Resolved = resolveClass(topRawClass);

    // ── Tier 2: LOW <= confidence < HIGH  →  uncertain ────────────────────────
    if (topRatio < HIGH) {
      console.log(`[Roboflow] ${topPct}% in uncertain range [${Math.round(LOW * 100)}%–${Math.round(HIGH * 100)}%) → uncertain with ${candidates.length} suggestions`);
      return {
        status: 'uncertain',
        machineId: top1Resolved.machineId,
        machineName: top1Resolved.machineName,
        category: top1Resolved.category,
        confidence: topPct,
        reason: `Confidence (${topPct}%) is uncertain — please confirm one of the suggestions below.`,
        candidates,
        rawOutput: {
          machineName: top1Resolved.machineName,
          category: top1Resolved.category,
          confidence: topPct,
          confidenceLevel: 'medium',
          exactModelIdentified: false,
          exercise: top1Resolved.machineName,
          visualFeatures: [
            `Roboflow Model (${modelId})`,
            `Uncertain Detection: ${top1Resolved.machineName} (${topPct}%)`
          ],
          possibleMatches: candidates
        },
        model: `roboflow-${modelId}`,
        processingTimeMs
      };
    }

    // ── Tier 1: confidence >= HIGH  →  identified (success) ──────────────────
    console.log(`[Roboflow] ${topPct}% >= ${Math.round(HIGH * 100)}% → identified: ${top1Resolved.machineName}`);
    return {
      status: 'identified',
      machineId: top1Resolved.machineId,
      machineName: top1Resolved.machineName,
      category: top1Resolved.category,
      confidence: topPct,
      visualFeatures: [
        `Roboflow Model (${modelId})`,
        `Identified: ${top1Resolved.machineName} (${topPct}%)`
      ],
      candidates,
      rawOutput: {
        machineName: top1Resolved.machineName,
        category: top1Resolved.category,
        confidence: topPct,
        confidenceLevel: 'high',
        exactModelIdentified: true,
        exercise: top1Resolved.machineName,
        visualFeatures: [
          `Roboflow API (${modelId})`,
          `Confidence: ${topPct}%`
        ],
        possibleMatches: candidates
      },
      model: `roboflow-${modelId}`,
      processingTimeMs
    };

  } catch (err) {
    console.error('[Roboflow] Network/Execution error:', err);
    return {
      status: 'error',
      errorType: 'NETWORK_ERROR',
      message: `Failed to connect to Roboflow API: ${err.message}`
    };
  }
}
