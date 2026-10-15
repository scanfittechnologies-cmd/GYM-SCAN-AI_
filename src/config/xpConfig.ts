import { Achievement } from '../types';

/**
 * Centralized XP reward rules configuration
 */
export const XP_REWARDS = {
  VERIFIED_QR_SCAN: 10,
  CONFIRMED_PHOTO_SCAN: 10,
  TUTORIAL_COMPLETED: 5,
  UNIQUE_MACHINE_DISCOVERY_BONUS: 10,
  SAVED_TO_FAVORITES: 2,
};

/**
 * Configurable Level thresholds based on Prompt 6 specifications:
 * - Level 1: 0 XP
 * - Level 2: 100 XP
 * - Level 3: 250 XP
 * - Level 4: 500 XP
 * - Level 5: 1,000 XP
 */
export const LEVEL_CONFIG = [
  { level: 1, title: 'Gym Rookie', minXP: 0, nextXP: 100 },
  { level: 2, title: 'Form Apprentice', minXP: 100, nextXP: 250 },
  { level: 3, title: 'Machine Explorer', minXP: 250, nextXP: 500 },
  { level: 4, title: 'Equipment Expert', minXP: 500, nextXP: 1000 },
  { level: 5, title: 'Gym Master', minXP: 1000, nextXP: 1000 }, // Max level
];

/**
 * 6 Official prompt-specified achievements:
 * 1. First Discovery (Verify your first machine scan | 25 XP)
 * 2. Machine Explorer (Discover 5 unique machines | 50 XP)
 * 3. Equipment Expert (Discover 10 unique machines | 100 XP)
 * 4. QR Scanner (Complete 5 verified QR scans | 50 XP)
 * 5. Tutorial Learner (Complete 5 machine tutorials | 50 XP)
 * 6. Gym Explorer (Discover machines from 5 different categories | 100 XP)
 */
export const PROMPT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-discovery',
    title: 'First Discovery',
    description: 'Verify your first gym machine scan with QR or photo vision.',
    requirement: 'Verify your first machine scan.',
    icon: 'compass',
    category: 'discovery',
    targetCount: 1,
    currentCount: 0,
    unlocked: false,
    rewardXP: 25
  },
  {
    id: 'machine-explorer',
    title: 'Machine Explorer',
    description: 'Discover and log 5 distinct machines in the gym database.',
    requirement: 'Discover 5 unique machines.',
    icon: 'map-pin',
    category: 'discovery',
    targetCount: 5,
    currentCount: 0,
    unlocked: false,
    rewardXP: 50
  },
  {
    id: 'equipment-expert',
    title: 'Equipment Expert',
    description: 'Expand your gym competence by discovering 10 unique machines.',
    requirement: 'Discover 10 unique machines.',
    icon: 'award',
    category: 'discovery',
    targetCount: 10,
    currentCount: 0,
    unlocked: false,
    rewardXP: 100
  },
  {
    id: 'qr-scanner',
    title: 'QR Scanner',
    description: 'Scan and verify physical QR codes directly on gym equipment.',
    requirement: 'Complete 5 verified QR scans.',
    icon: 'qr-code',
    category: 'mastery',
    targetCount: 5,
    currentCount: 0,
    unlocked: false,
    rewardXP: 50
  },
  {
    id: 'tutorial-learner',
    title: 'Tutorial Learner',
    description: 'Complete form setups and movement guide checklists for 5 machines.',
    requirement: 'Complete 5 machine tutorials.',
    icon: 'book-open',
    category: 'learning',
    targetCount: 5,
    currentCount: 0,
    unlocked: false,
    rewardXP: 50
  },
  {
    id: 'gym-explorer-categories',
    title: 'Gym Explorer',
    description: 'Diversify workouts by scanning equipment across 5 muscle categories.',
    requirement: 'Discover machines from 5 different categories.',
    icon: 'layers',
    category: 'consistency',
    targetCount: 5,
    currentCount: 0,
    unlocked: false,
    rewardXP: 100
  }
];
