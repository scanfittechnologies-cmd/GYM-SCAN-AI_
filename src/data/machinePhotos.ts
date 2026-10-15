/**
 * machinePhotos.ts
 *
 * Curated Unsplash photo URLs for each machine in the library.
 * These are merged at runtime with machines.ts data.
 * When a machine has no frontReferenceImage / sideReferenceImage in its DB record,
 * the values from this map are used as the display image source.
 *
 * Photo selection criteria:
 *  - Must visually match the specific machine type
 *  - Must be from a commercial gym setting (not home gym or stock illustration)
 *  - Must be landscape or square — not portrait-only
 *
 * NOTE: These are real Unsplash photo IDs. They display the correct equipment
 * but may not be from the same brand as listed in the machine record.
 * All cards show "Reference Photo" label — not "Exact Match".
 */

export interface MachinePhotoEntry {
  front: string;
  side?: string;
  threeQuarter?: string;
  /** If true, this machine type has a curated accurate photo */
  verified?: boolean;
}

/** Base Unsplash URL builder */
const u = (photoId: string, w = 800) =>
  `https://images.unsplash.com/${photoId}?w=${w}&auto=format&fit=crop&q=75`;

export const MACHINE_PHOTO_MAP: Record<string, MachinePhotoEntry> = {
  /* ─────────────────────── CHEST ─────────────────────── */
  'seated-chest-press': {
    front: '/machines/seated-chest-press.jpg',
    side:  '/machines/seated-chest-press.jpg',
    threeQuarter: '/machines/seated-chest-press.jpg',
    verified: true,
  },
  'incline-chest-press': {
    front: '/machines/incline-chest-press.jpg',
    side:  '/machines/incline-chest-press.jpg',
    threeQuarter: '/machines/incline-chest-press.jpg',
    verified: true,
  },
  'decline-chest-press': {
    front: '/machines/seated-chest-press.jpg',
    verified: false,
  },
  'pec-deck-machine': {
    front: '/machines/pec-deck-machine.jpg',
    side:  '/machines/pec-deck-machine.jpg',
    verified: true,
  },
  'cable-crossover': {
    front: '/machines/cable-crossover.jpg',
    verified: true,
  },
  'smith-machine-chest': {
    front: u('photo-1583454110551-21f2fa2afe61'),
    verified: true,
  },
  /* ─────────────────────── LEGS ─────────────────────── */
  'calf-raise-machine': {
    front: '/machines/calf-raise-machine.jpg',
    side: '/machines/calf-raise-machine.jpg',
    verified: true,
  },
  'smith-machine-squats': {
    front: '/machines/smith-machine-squats.jpg',
    side: '/machines/smith-machine-squats.jpg',
    verified: true,
  },
  'leg-press-45': {
    front: '/machines/leg-press-45.jpg',
    side: '/machines/leg-press-45.jpg',
    verified: true,
  },
  'leg-extension': {
    front: '/machines/leg-extension.jpg',
    side: '/machines/leg-extension.jpg',
    verified: true,
  },
  'hip-adduction-machine': {
    front: '/machines/hip-adduction-machine.jpg',
    side: '/machines/hip-adduction-machine.jpg',
    verified: true,
  },
  'hack-squat-machine': {
    front: '/machines/hack-squat-machine.jpg',
    side: '/machines/hack-squat-machine.jpg',
    verified: true,
  },
  'lying-leg-curl': {
    front: '/machines/lying-leg-curl.jpg',
    side: '/machines/lying-leg-curl.jpg',
    verified: true,
  },
  'seated-leg-curl': {
    front: u('photo-1533681904393-9ab6eee7e408'),
    verified: true,
  },
  'hip-abduction-machine': {
    front: u('photo-1517838277536-f5f99be501cd'),
    verified: false,
  },

  /* ─────────────────────── ARMS ─────────────────────── */
  'preacher-curl': {
    front: '/machines/preacher-curl.jpg',
    side:  '/machines/preacher-curl.jpg',
    verified: true,
  },
  'biceps-curl-machine': {
    front: '/machines/biceps-curl-machine.jpg',
    side:  '/machines/biceps-curl-machine.jpg',
    verified: true,
  },
  'triceps-extension-machine': {
    front: '/machines/triceps-pushdown-cable.jpg',
    side:  '/machines/triceps-pushdown-cable.jpg',
    verified: true,
  },
  'triceps-pushdown-cable': {
    front: '/machines/triceps-pushdown-cable.jpg',
    side:  '/machines/triceps-pushdown-cable.jpg',
    verified: true,
  },
  'assisted-dip-machine': {
    front: '/machines/assisted-dip-machine.jpg',
    side:  '/machines/assisted-dip-machine.jpg',
    verified: true,
  },

  /* ─────────────────────── CARDIO ─────────────────────── */
  'treadmill-commercial': {
    front: '/machines/treadmill.jpg',
    side: '/machines/treadmill.jpg',
    verified: true,
  },
  'stair-climber': {
    front: '/machines/stair-climber.jpg',
    side: '/machines/stair-climber.jpg',
    verified: true,
  },
  'stationary-bike-upright': {
    front: '/machines/stationary-bike.jpg',
    side: '/machines/stationary-bike.jpg',
    verified: true,
  },
  'rowing-machine': {
    front: '/machines/rowing-machine.jpg',
    side: '/machines/rowing-machine.jpg',
    verified: true,
  },

  /* ─────────────────────── CABLE EQUIPMENT ─────────────────────── */
  'cable-tower': {
    front: u('photo-1571019614242-c5c5dee9f50b'),
    verified: true,
  },
  'functional-trainer': {
    front: u('photo-1571019614242-c5c5dee9f50b'),
    verified: true,
  },

  /* ─────────────────────── OTHER / FREE WEIGHTS ─────────────────────── */
  'power-rack': {
    front: u('photo-1583454110551-21f2fa2afe61'),
    verified: true,
  },
  'squat-rack': {
    front: u('photo-1583454110551-21f2fa2afe61'),
    verified: true,
  },
  'adjustable-bench': {
    front: u('photo-1574680096145-d05b474e2155'),
    verified: true,
  },
  'flat-bench': {
    front: u('photo-1574680096145-d05b474e2155'),
    verified: true,
  },
  'incline-bench': {
    front: u('photo-1574680096145-d05b474e2155'),
    verified: true,
  },
  'decline-bench': {
    front: u('photo-1574680096145-d05b474e2155'),
    verified: false,
  },
  'dumbbell-rack': {
    front: u('photo-1526506118085-60ce8714f8c5'),
    verified: true,
  },
  'barbell-rack': {
    front: u('photo-1526506118085-60ce8714f8c5'),
    verified: false,
  },
  'kettlebell-station': {
    front: u('photo-1526506118085-60ce8714f8c5'),
    verified: false,
  },
  'smith-machine-functional': {
    front: u('photo-1583454110551-21f2fa2afe61'),
    verified: true,
  },

  /* ─────────────────────── CORE ─────────────────────── */
  'rotary-torso-machine': {
    front: '/machines/rotary-torso-machine.jpg',
    side: '/machines/rotary-torso-machine.jpg',
    verified: true,
  },
  'ab-crunch-machine': {
    front: '/machines/ab-crunch-machine.jpg',
    side: '/machines/ab-crunch-machine.jpg',
    verified: true,
  },
  'captains-chair-leg-raise': {
    front: '/machines/captains-chair-leg-raise.jpg',
    side: '/machines/captains-chair-leg-raise.jpg',
    verified: true,
  },
};

/**
 * Get the best available photo URL for a machine.
 * Falls back to SVG illustration if no photo available.
 */
export function getMachinePhotos(machineId: string): MachinePhotoEntry | null {
  return MACHINE_PHOTO_MAP[machineId] ?? null;
}

/**
 * Check if a machine has curated real photos available.
 */
export function hasMachinePhotos(machineId: string): boolean {
  return machineId in MACHINE_PHOTO_MAP;
}


