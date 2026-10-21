export type MachineCategory = 
  | 'Chest' 
  | 'Back' 
  | 'Shoulders' 
  | 'Arms' 
  | 'Legs' 
  | 'Cable Equipment' 
  | 'Cardio'
  | 'Core'
  | 'Other';

export interface MuscleInfo {
  name: string;
  isPrimary: boolean;
}

export interface MachineStep {
  title: string;
  description: string;
  icon: string;
  stage: string;
}

export interface MovementCues {
  exhale: string;
  inhale: string;
  tempo: string;
}

export interface MachineCommonMistake {
  mistake: string;
  fix: string;
  correction?: string;
}

export interface TutorialStep {
  stepNumber: number;
  title: string;
  description: string;
  tip?: string;
}

export interface MachineExercise {
  id: string;
  name: string;
  mainMuscle: string;
  secondaryMuscles?: string[];
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  setupGuidance: string[];
  movementSteps: string[];
  breathingCues: string;
  commonMistakes: MachineCommonMistake[];
  safetyReminder: string;
  imageSvg?: string;
}

export interface Machine {
  id: string;
  name: string;
  alternativeNames?: string[];
  category: MachineCategory;
  tagline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipmentType: 'Pin-Loaded (Selectorized)' | 'Plate-Loaded' | 'Cable Pulley' | 'Bodyweight Assisted' | 'Cardio Ergometer' | 'Free Motion / Other';
  qrCodeId: string;
  matchKeywords: string[];
  imageSvg: string;
  description: string;
  brand?: string;
  visualCharacteristics?: string[];
  frontReferenceImage?: string;
  sideReferenceImage?: string;
  setupInstructions: string[];
  movementGuidance: string[];
  commonMistakes: MachineCommonMistake[];
  safetyReminders: string[];
  tutorialSteps: TutorialStep[];
  videoDurationSec?: number;
  featured?: boolean;
  exercises?: MachineExercise[];
  galleryImages?: string[];
  videoUrl?: string;
  verificationStatus?: 'Verified' | 'Pending Review' | 'Community Sample' | 'Demo Sample';
  gymId?: string;
  location?: string;
  createdDate?: string;
  updatedDate?: string;
  availabilityStatus?: 'Available' | 'In Use' | 'Maintenance' | 'Availability Not Provided';
  isDiscovered?: boolean;
  steps?: MachineStep[];
  movementCues?: MovementCues;
}

export interface ActivityRecord {
  id: string;
  userId?: string;
  machineId?: string;
  machineName: string;
  machineCategory?: MachineCategory;
  activityType: 'qr_scan' | 'photo_scan' | 'tutorial_viewed' | 'achievement_unlocked' | 'favorite_saved';
  scanMethod: 'qr' | 'photo' | 'manual' | 'none';
  xpAwarded: number;
  timestamp: number;
  createdAt: string;
  status: 'Verified' | 'Completed' | 'Unlocked' | 'Demo' | 'Pending';
  tutorialId?: string;
  achievementId?: string;
  imageUrl?: string;
  confidence?: number;
  notes?: string;
}

export interface XPTransaction {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
  machineId?: string;
  activityType?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: string;
  icon: string;
  category: 'discovery' | 'learning' | 'consistency' | 'mastery';
  targetCount: number;
  currentCount: number;
  unlocked: boolean;
  unlockedAt?: number;
  rewardXP: number;
}

export interface UserStreakInfo {
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  nextXP: number;
  currentXP: number;
  xpNeededForNext: number;
  progressPercent: number;
  isMaxLevel: boolean;
}

export type UserRole = 'user' | 'editor' | 'admin';

export interface UserProfile {
  id?: string;
  email?: string;
  displayName: string;
  avatarSeed: string;
  role: UserRole;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  joinedDate: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  cameraPermissionGranted: boolean;
  privacyMode: boolean;
  totalXP?: number;
  currentLevel?: number;
  verifiedScanCount?: number;
  uniqueMachineCount?: number;
  tutorialsCompletedCount?: number;
  achievementsUnlockedCount?: number;
  lastActiveAt?: string;
  isUnder18?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarSeed: string;
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt: string;
  lastSignInAt?: string;
  emailVerified?: boolean;
}

export interface AuthSession {
  user: AuthUser | null;
  token: string | null;
  expiresAt: number | null;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail?: string;
  actionType: 'CREATE_MACHINE' | 'UPDATE_MACHINE' | 'DELETE_MACHINE' | 'CREATE_TUTORIAL' | 'UPDATE_TUTORIAL' | 'UPDATE_ROLE' | 'SECURITY_EVENT' | 'LOGIN' | 'QR_TAG_REASSIGN';
  targetEntity: string;
  targetId?: string;
  details: string;
  timestamp: number;
}

export interface SystemHealthStatus {
  backendMode: 'supabase' | 'local_adapter';
  databaseConnected: boolean;
  authConnected: boolean;
  rlsEnforced: boolean;
  totalMachines: number;
  totalUsers: number;
  totalScans: number;
  totalTutorials: number;
  pendingReviews: number;
}

export interface ToastMessage {
  id: string;
  type: 'xp' | 'achievement' | 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  xpAmount?: number;
}


