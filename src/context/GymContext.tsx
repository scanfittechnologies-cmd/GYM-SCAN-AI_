import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { 
  Machine, 
  ActivityRecord, 
  XPTransaction, 
  Achievement, 
  UserProfile, 
  ToastMessage,
  UserStreakInfo,
  LevelInfo
} from '../types';
import { MACHINES_DATABASE } from '../data/machines';
import { XP_REWARDS, LEVEL_CONFIG, PROMPT_ACHIEVEMENTS } from '../config/xpConfig';
import confetti from 'canvas-confetti';

interface GymContextType {
  machines: Machine[];
  discoveredMachineIds: string[];
  completedTutorialIds: string[];
  favoriteMachineIds: string[];
  activityLog: ActivityRecord[];
  scanRecords: ActivityRecord[];
  xpTransactions: XPTransaction[];
  achievements: Achievement[];
  userProfile: UserProfile;
  toasts: ToastMessage[];
  totalXP: number;
  currentLevel: LevelInfo;
  streakInfo: UserStreakInfo;
  isDemoMode: boolean;
  isLoading: boolean;
  simulatedError: string | null;

  // Actions
  recordMachineScan: (
    machineId: string, 
    scanType: 'qr' | 'photo' | 'manual', 
    imageUrl?: string, 
    confidence?: number
  ) => { isNew: boolean; xpEarned: number; machine: Machine; status: string };
  markTutorialCompleted: (machineId: string) => boolean;
  toggleFavorite: (machineId: string) => boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  reportMachineIssue: (machineId: string, issueType: string, description: string) => void;
  removeToast: (id: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  clearAllUserData: () => void;
  loadDemoSeedData: () => void;
  simulateLevelUp: () => void;
  setSimulatedError: (error: string | null) => void;
  
  // Helpers
  getMachineById: (id: string) => Machine | undefined;
  getMachineByQRCode: (qrCode: string) => Machine | undefined;
  isMachineDiscovered: (id: string) => boolean;
  isTutorialCompleted: (id: string) => boolean;
  isFavorite: (id: string) => boolean;
}

const STORAGE_KEYS = {
  DISCOVERED: 'gym_scan_discovered_machines_v2',
  TUTORIALS: 'gym_scan_completed_tutorials_v2',
  FAVORITES: 'gym_scan_favorites_v2',
  ACTIVITY_LOG: 'gym_scan_activity_log_v2',
  XP_TRANSACTIONS: 'gym_scan_xp_transactions_v2',
  ACHIEVEMENTS: 'gym_scan_achievements_v2',
  PROFILE: 'gym_scan_user_profile_v2',
  REPORTS: 'gym_scan_bug_reports_v2',
  DEMO_MODE: 'gym_scan_demo_mode_v2'
};

const DEFAULT_PROFILE: UserProfile = {
  displayName: 'Gym Explorer',
  avatarSeed: 'lifter_01',
  role: 'user',
  experienceLevel: 'Beginner',
  joinedDate: Date.now(),
  soundEnabled: true,
  hapticEnabled: true,
  cameraPermissionGranted: false,
  privacyMode: false,
  totalXP: 0,
  currentLevel: 1,
  uniqueMachineCount: 0,
  achievementsUnlockedCount: 0,
};

// Seed demo activity records
const SEED_ACTIVITY_LOG: ActivityRecord[] = [
  {
    id: 'act-demo-1',
    userId: 'demo-user-01',
    machineId: 'seated-chest-press',
    machineName: 'Seated Chest Press',
    machineCategory: 'Chest',
    activityType: 'qr_scan',
    scanMethod: 'qr',
    xpAwarded: 20, // 10 scan + 10 unique discovery
    timestamp: Date.now() - 3600000 * 24 * 3, // 3 days ago
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    status: 'Verified',
    notes: 'QR Tag #GYM-CHEST-01 scanned at Main Free Weight Area'
  },
  {
    id: 'act-demo-2',
    userId: 'demo-user-01',
    machineId: 'seated-chest-press',
    machineName: 'Seated Chest Press',
    machineCategory: 'Chest',
    activityType: 'tutorial_viewed',
    scanMethod: 'none',
    xpAwarded: 5,
    timestamp: Date.now() - 3600000 * 24 * 3 + 300000,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3 + 300000).toISOString(),
    status: 'Completed',
    tutorialId: 'seated-chest-press-tut',
    notes: '2-step setup and movement checklist verified'
  },
  {
    id: 'act-demo-3',
    userId: 'demo-user-01',
    machineId: 'lat-pulldown',
    machineName: 'Lat Pulldown Machine',
    machineCategory: 'Back',
    activityType: 'photo_scan',
    scanMethod: 'photo',
    xpAwarded: 20, // 10 photo + 10 unique discovery
    timestamp: Date.now() - 3600000 * 24 * 2, // 2 days ago
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    status: 'Verified',
    confidence: 96,
    notes: 'Neural Vision match with 96% confidence'
  },
  {
    id: 'act-demo-4',
    userId: 'demo-user-01',
    machineId: 'lat-pulldown',
    machineName: 'Lat Pulldown Machine',
    machineCategory: 'Back',
    activityType: 'tutorial_viewed',
    scanMethod: 'none',
    xpAwarded: 5,
    timestamp: Date.now() - 3600000 * 24 * 2 + 600000,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2 + 600000).toISOString(),
    status: 'Completed',
    tutorialId: 'lat-pulldown-tut',
    notes: 'Grip width & scapular retraction tutorial finished'
  },
  {
    id: 'act-demo-5',
    userId: 'demo-user-01',
    machineName: 'First Discovery',
    activityType: 'achievement_unlocked',
    scanMethod: 'none',
    xpAwarded: 25,
    timestamp: Date.now() - 3600000 * 24 * 3 + 400000,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3 + 400000).toISOString(),
    status: 'Unlocked',
    achievementId: 'first-discovery',
    notes: 'Milestone badge for first verified scan'
  },
  {
    id: 'act-demo-6',
    userId: 'demo-user-01',
    machineId: 'incline-chest-press',
    machineName: 'Incline Chest Press',
    machineCategory: 'Chest',
    activityType: 'qr_scan',
    scanMethod: 'qr',
    xpAwarded: 20, // 10 scan + 10 unique discovery
    timestamp: Date.now() - 3600000 * 12,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'Verified',
    notes: 'QR Tag #GYM-CHEST-03 scanned at Upper Free Weight Area'
  }
];

const SEED_XP_TRANSACTIONS: XPTransaction[] = [
  {
    id: 'xp-seed-1',
    amount: 10,
    reason: 'Verified QR Scan: Seated Chest Press',
    timestamp: Date.now() - 3600000 * 24 * 3,
    machineId: 'seated-chest-press',
    activityType: 'qr_scan'
  },
  {
    id: 'xp-seed-2',
    amount: 10,
    reason: 'Unique Discovery Bonus: Seated Chest Press',
    timestamp: Date.now() - 3600000 * 24 * 3,
    machineId: 'seated-chest-press',
    activityType: 'discovery'
  },
  {
    id: 'xp-seed-3',
    amount: 5,
    reason: 'Tutorial Completed: Seated Chest Press',
    timestamp: Date.now() - 3600000 * 24 * 3 + 300000,
    machineId: 'seated-chest-press',
    activityType: 'tutorial'
  },
  {
    id: 'xp-seed-4',
    amount: 25,
    reason: 'Achievement Unlocked: First Discovery',
    timestamp: Date.now() - 3600000 * 24 * 3 + 400000,
    activityType: 'achievement'
  },
  {
    id: 'xp-seed-5',
    amount: 10,
    reason: 'Confirmed Photo Scan: Lat Pulldown Machine',
    timestamp: Date.now() - 3600000 * 24 * 2,
    machineId: 'lat-pulldown',
    activityType: 'photo_scan'
  },
  {
    id: 'xp-seed-6',
    amount: 10,
    reason: 'Unique Discovery Bonus: Lat Pulldown Machine',
    timestamp: Date.now() - 3600000 * 24 * 2,
    machineId: 'lat-pulldown',
    activityType: 'discovery'
  },
  {
    id: 'xp-seed-7',
    amount: 5,
    reason: 'Tutorial Completed: Lat Pulldown Machine',
    timestamp: Date.now() - 3600000 * 24 * 2 + 600000,
    machineId: 'lat-pulldown',
    activityType: 'tutorial'
  },
  {
    id: 'xp-seed-8',
    amount: 10,
    reason: 'Verified QR Scan: Incline Chest Press',
    timestamp: Date.now() - 3600000 * 12,
    machineId: 'incline-chest-press',
    activityType: 'qr_scan'
  },
  {
    id: 'xp-seed-9',
    amount: 10,
    reason: 'Unique Discovery Bonus: Incline Chest Press',
    timestamp: Date.now() - 3600000 * 12,
    machineId: 'incline-chest-press',
    activityType: 'discovery'
  }
];

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const machines = MACHINES_DATABASE;
  const [isDemoMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simulatedError, setSimulatedError] = useState<string | null>(null);

  // Core progression state (starts fresh for new users: 0 XP, Level 1)
  const [discoveredMachineIds, setDiscoveredMachineIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISCOVERED);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [completedTutorialIds, setCompletedTutorialIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TUTORIALS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [favoriteMachineIds, setFavoriteMachineIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [activityLog, setActivityLog] = useState<ActivityRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [xpTransactions, setXpTransactions] = useState<XPTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.XP_TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return PROMPT_ACHIEVEMENTS.map(ach => ({
      ...ach,
      currentCount: 0,
      unlocked: false,
    }));
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISCOVERED, JSON.stringify(discoveredMachineIds));
  }, [discoveredMachineIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TUTORIALS, JSON.stringify(completedTutorialIds));
  }, [completedTutorialIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteMachineIds));
  }, [favoriteMachineIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(activityLog));
  }, [activityLog]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.XP_TRANSACTIONS, JSON.stringify(xpTransactions));
  }, [xpTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  // Toast Helpers
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Compute Total XP
  const totalXP = useMemo(() => {
    return xpTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [xpTransactions]);

  // Compute Current Level based on Prompt 6 Thresholds
  const currentLevel: LevelInfo = useMemo(() => {
    let activeLevel = LEVEL_CONFIG[0];
    for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
      if (totalXP >= LEVEL_CONFIG[i].minXP) {
        activeLevel = LEVEL_CONFIG[i];
        break;
      }
    }

    const isMax = activeLevel.level === LEVEL_CONFIG[LEVEL_CONFIG.length - 1].level;
    const levelRange = isMax ? 1 : activeLevel.nextXP - activeLevel.minXP;
    const xpIntoLevel = totalXP - activeLevel.minXP;
    const progressPercent = isMax ? 100 : Math.min(100, Math.max(0, Math.round((xpIntoLevel / levelRange) * 100)));
    const xpNeededForNext = isMax ? 0 : Math.max(0, activeLevel.nextXP - totalXP);

    return {
      level: activeLevel.level,
      title: activeLevel.title,
      minXP: activeLevel.minXP,
      nextXP: activeLevel.nextXP,
      currentXP: totalXP,
      xpNeededForNext,
      progressPercent,
      isMaxLevel: isMax
    };
  }, [totalXP]);

  // Calculate Streak Info from real qualifying activity dates
  const streakInfo: UserStreakInfo = useMemo(() => {
    if (activityLog.length === 0) {
      return {
        activeDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null
      };
    }

    // Filter qualifying verified activities
    const qualifyingActivities = activityLog.filter(
      a => a.status === 'Verified' || a.status === 'Completed' || a.status === 'Unlocked'
    );

    if (qualifyingActivities.length === 0) {
      return {
        activeDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null
      };
    }

    // Extract unique ISO day strings (YYYY-MM-DD)
    const uniqueDays = Array.from(
      new Set(
        qualifyingActivities.map(a => new Date(a.timestamp).toISOString().split('T')[0])
      )
    ).sort().reverse(); // newest first

    const activeDays = uniqueDays.length;
    const lastActivityDate = uniqueDays[0] || null;

    // Calculate current streak
    let currentStreak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If active today or yesterday, streak is ongoing
    if (uniqueDays.includes(todayStr) || uniqueDays.includes(yesterdayStr)) {
      let checkDate = uniqueDays.includes(todayStr) ? new Date() : yesterday;
      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (uniqueDays.includes(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const longestStreak = Math.max(currentStreak, activeDays > 0 ? Math.min(activeDays, 3) : 0);

    return {
      activeDays,
      currentStreak,
      longestStreak,
      lastActivityDate
    };
  }, [activityLog]);

  // Helper Lookups
  const getMachineById = useCallback((id: string) => {
    return machines.find(m => m.id.toLowerCase() === id.toLowerCase() || m.qrCodeId.toLowerCase() === id.toLowerCase());
  }, [machines]);

  const getMachineByQRCode = useCallback((qrCode: string) => {
    const cleanCode = qrCode.trim().toUpperCase();
    return machines.find(m => m.qrCodeId.toUpperCase() === cleanCode || m.id.toUpperCase() === cleanCode);
  }, [machines]);

  const isMachineDiscovered = useCallback((id: string) => {
    return discoveredMachineIds.includes(id);
  }, [discoveredMachineIds]);

  const isTutorialCompleted = useCallback((id: string) => {
    return completedTutorialIds.includes(id);
  }, [completedTutorialIds]);

  const isFavorite = useCallback((id: string) => {
    return favoriteMachineIds.includes(id);
  }, [favoriteMachineIds]);

  // Evaluate and unlock achievements automatically
  const evaluateAchievements = useCallback((
    updatedDiscovered: string[],
    updatedTutorials: string[],
    updatedActivityLog: ActivityRecord[]
  ) => {
    // Unique categories discovered
    const discoveredCategories = new Set<string>();
    updatedDiscovered.forEach(id => {
      const m = machines.find(mach => mach.id === id);
      if (m) discoveredCategories.add(m.category);
    });

    // Count QR scans
    const qrScansCount = updatedActivityLog.filter(
      a => a.activityType === 'qr_scan' && a.status === 'Verified'
    ).length;

    setAchievements(prev => {
      return prev.map(ach => {
        let currentCount = ach.currentCount;

        if (ach.id === 'first-discovery') {
          currentCount = updatedDiscovered.length;
        } else if (ach.id === 'machine-explorer') {
          currentCount = updatedDiscovered.length;
        } else if (ach.id === 'equipment-expert') {
          currentCount = updatedDiscovered.length;
        } else if (ach.id === 'qr-scanner') {
          currentCount = qrScansCount;
        } else if (ach.id === 'tutorial-learner') {
          currentCount = updatedTutorials.length;
        } else if (ach.id === 'gym-explorer-categories') {
          currentCount = discoveredCategories.size;
        }

        const shouldUnlock = !ach.unlocked && currentCount >= ach.targetCount;

        if (shouldUnlock) {
          // Award XP for achievement
          const xpTx: XPTransaction = {
            id: `ach-xp-${Date.now()}-${ach.id}`,
            amount: ach.rewardXP,
            reason: `Achievement Unlocked: ${ach.title}`,
            timestamp: Date.now(),
            activityType: 'achievement'
          };
          setXpTransactions(curr => [xpTx, ...curr]);

          // Add to activity history
          const achRecord: ActivityRecord = {
            id: `act-ach-${Date.now()}-${ach.id}`,
            userId: 'local-user',
            machineName: ach.title,
            activityType: 'achievement_unlocked',
            scanMethod: 'none',
            xpAwarded: ach.rewardXP,
            timestamp: Date.now(),
            createdAt: new Date().toISOString(),
            status: 'Unlocked',
            achievementId: ach.id,
            notes: `Milestone reached: ${ach.requirement}`
          };
          setActivityLog(curr => [achRecord, ...curr]);

          // Trigger Confetti
          try {
            confetti({
              particleCount: 85,
              spread: 65,
              origin: { y: 0.75 },
              colors: ['#00F59B', '#00D2FF', '#FFB800', '#EC4899']
            });
          } catch (e) {
            console.error(e);
          }

          addToast({
            type: 'achievement',
            title: `🏆 Achievement Unlocked!`,
            message: `${ach.title} (+${ach.rewardXP} XP)`,
            xpAmount: ach.rewardXP
          });

          return {
            ...ach,
            currentCount,
            unlocked: true,
            unlockedAt: Date.now()
          };
        }

        return { ...ach, currentCount };
      });
    });
  }, [machines, addToast]);

  // Record Machine Scan (QR or Photo)
  const recordMachineScan = useCallback((
    machineId: string, 
    scanType: 'qr' | 'photo' | 'manual', 
    imageUrl?: string, 
    confidence?: number
  ) => {
    if (simulatedError) {
      addToast({
        type: 'error',
        title: 'Backend Offline',
        message: 'Simulated network failure. Check connection and retry.'
      });
      throw new Error(simulatedError);
    }

    const machine = getMachineById(machineId);
    if (!machine) {
      throw new Error(`Machine ${machineId} not found.`);
    }

    // Debounce duplicate accidental scans within 5 seconds
    const recentDuplicate = activityLog.find(
      s => s.machineId === machine.id && (Date.now() - s.timestamp < 5000)
    );

    if (recentDuplicate) {
      addToast({
        type: 'info',
        title: 'Scan Verified Already',
        message: `${machine.name} was already verified just now.`,
      });
      return {
        isNew: false,
        xpEarned: 0,
        machine,
        status: 'Duplicate Ignored'
      };
    }

    const isFirstTime = !discoveredMachineIds.includes(machine.id);
    const newDiscovered = isFirstTime ? [...discoveredMachineIds, machine.id] : discoveredMachineIds;
    
    // XP Calculation:
    // - Every verified machine scan (QR or Photo): +10 XP
    // - First-time unique machine discovery bonus: +10 XP additional
    const scanBaseXP = scanType === 'qr' ? XP_REWARDS.VERIFIED_QR_SCAN : XP_REWARDS.CONFIRMED_PHOTO_SCAN;
    const discoveryBonusXP = isFirstTime ? XP_REWARDS.UNIQUE_MACHINE_DISCOVERY_BONUS : 0;
    const totalAwarded = scanBaseXP + discoveryBonusXP;

    const newActivity: ActivityRecord = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: 'local-user',
      machineId: machine.id,
      machineName: machine.name,
      machineCategory: machine.category,
      activityType: scanType === 'qr' ? 'qr_scan' : 'photo_scan',
      scanMethod: scanType,
      xpAwarded: totalAwarded,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'Verified',
      confidence: scanType === 'photo' ? (confidence || 95) : 100,
      imageUrl,
      notes: isFirstTime 
        ? `First discovery! Scanned via ${scanType.toUpperCase()} (+${totalAwarded} XP)` 
        : `Verified scan via ${scanType.toUpperCase()} (+${scanBaseXP} XP)`
    };

    const nextActivityLog = [newActivity, ...activityLog];
    setActivityLog(nextActivityLog);

    if (isFirstTime) {
      setDiscoveredMachineIds(newDiscovered);
    }

    const txs: XPTransaction[] = [
      {
        id: `xp-scan-${Date.now()}`,
        amount: scanBaseXP,
        reason: scanType === 'qr' ? `Verified QR Scan: ${machine.name}` : `Confirmed Photo Scan: ${machine.name}`,
        timestamp: Date.now(),
        machineId: machine.id,
        activityType: `${scanType}_scan`
      },
      ...(isFirstTime ? [{
        id: `xp-bonus-${Date.now()}`,
        amount: discoveryBonusXP,
        reason: `Unique Discovery Bonus: ${machine.name}`,
        timestamp: Date.now() + 1,
        machineId: machine.id,
        activityType: 'discovery' as const
      }] : [])
    ];

    setXpTransactions(prev => [...txs, ...prev]);

    addToast({
      type: 'xp',
      title: isFirstTime ? '🌟 Machine Discovered!' : '⚡ Scan Verified!',
      message: isFirstTime 
        ? `${machine.name} verified (+${totalAwarded} XP: scan + discovery bonus)`
        : `${machine.name} verified (+${scanBaseXP} XP)`,
      xpAmount: totalAwarded
    });

    evaluateAchievements(newDiscovered, completedTutorialIds, nextActivityLog);

    return {
      isNew: isFirstTime,
      xpEarned: totalAwarded,
      machine,
      status: 'Verified'
    };
  }, [activityLog, discoveredMachineIds, completedTutorialIds, getMachineById, simulatedError, addToast, evaluateAchievements]);

  // Complete Tutorial
  const markTutorialCompleted = useCallback((machineId: string) => {
    if (simulatedError) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Simulated backend database error. Retry later.'
      });
      return false;
    }

    const machine = getMachineById(machineId);
    if (!machine) return false;

    if (completedTutorialIds.includes(machine.id)) {
      addToast({
        type: 'info',
        title: 'Tutorial Already Mastered',
        message: `You have already earned XP for ${machine.name}'s tutorial.`
      });
      return false;
    }

    const updatedTutorials = [...completedTutorialIds, machine.id];
    setCompletedTutorialIds(updatedTutorials);

    const xpAward = XP_REWARDS.TUTORIAL_COMPLETED;

    const newActivity: ActivityRecord = {
      id: `act-tut-${Date.now()}`,
      userId: 'local-user',
      machineId: machine.id,
      machineName: machine.name,
      machineCategory: machine.category,
      activityType: 'tutorial_viewed',
      scanMethod: 'none',
      xpAwarded: xpAward,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'Completed',
      tutorialId: `${machine.id}-tutorial`,
      notes: `Completed 2-step setup and movement guidance tutorial`
    };

    const nextActivityLog = [newActivity, ...activityLog];
    setActivityLog(nextActivityLog);

    const xpTx: XPTransaction = {
      id: `xp-tut-${Date.now()}`,
      amount: xpAward,
      reason: `Tutorial Completed: ${machine.name}`,
      timestamp: Date.now(),
      machineId: machine.id,
      activityType: 'tutorial'
    };
    setXpTransactions(prev => [xpTx, ...prev]);

    addToast({
      type: 'xp',
      title: '🎯 Tutorial Completed!',
      message: `Mastered form guide for ${machine.name} (+${xpAward} XP)`,
      xpAmount: xpAward
    });

    evaluateAchievements(discoveredMachineIds, updatedTutorials, nextActivityLog);
    return true;
  }, [completedTutorialIds, discoveredMachineIds, activityLog, getMachineById, simulatedError, addToast, evaluateAchievements]);

  // Toggle Favorite
  const toggleFavorite = useCallback((machineId: string) => {
    const machine = getMachineById(machineId);
    if (!machine) return false;

    const exists = favoriteMachineIds.includes(machine.id);
    let updatedFavorites: string[];

    if (exists) {
      updatedFavorites = favoriteMachineIds.filter(id => id !== machine.id);
      addToast({
        type: 'info',
        title: 'Removed from Favorites',
        message: `${machine.name} was removed from your workout routine.`
      });
    } else {
      updatedFavorites = [...favoriteMachineIds, machine.id];
      const xpTx: XPTransaction = {
        id: `xp-fav-${Date.now()}`,
        amount: XP_REWARDS.SAVED_TO_FAVORITES,
        reason: `Saved to Routine: ${machine.name}`,
        timestamp: Date.now(),
        machineId: machine.id,
        activityType: 'favorite'
      };
      setXpTransactions(prev => [xpTx, ...prev]);

      addToast({
        type: 'xp',
        title: '⭐ Added to Favorites',
        message: `${machine.name} added to your routine (+${XP_REWARDS.SAVED_TO_FAVORITES} XP)`,
        xpAmount: XP_REWARDS.SAVED_TO_FAVORITES
      });
    }

    setFavoriteMachineIds(updatedFavorites);
    return !exists;
  }, [favoriteMachineIds, getMachineById, addToast]);

  // Update Profile
  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your settings and preferences have been updated.'
    });
  }, [addToast]);

  // Report Issue
  const reportMachineIssue = useCallback((machineId: string, issueType: string, description: string) => {
    const existingReports = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
    const newReport = {
      id: `report-${Date.now()}`,
      machineId,
      issueType,
      description,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([newReport, ...existingReports]));

    addToast({
      type: 'success',
      title: 'Report Submitted',
      message: 'Thank you for reporting equipment details to gym operations!'
    });
  }, [addToast]);

  // Simulate Level Up (for testing development thresholds)
  const simulateLevelUp = useCallback(() => {
    const bonusXP = 150;
    const xpTx: XPTransaction = {
      id: `xp-sim-${Date.now()}`,
      amount: bonusXP,
      reason: 'Sandbox Simulation: Level Progression Test',
      timestamp: Date.now(),
      activityType: 'test'
    };
    setXpTransactions(prev => [xpTx, ...prev]);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F59B', '#00D2FF', '#FFB800']
      });
    } catch (e) {
      console.error(e);
    }

    addToast({
      type: 'xp',
      title: '⚡ Progression Boosted',
      message: `Added +${bonusXP} XP for Level & Rank Verification`,
      xpAmount: bonusXP
    });
  }, [addToast]);

  // Load Seed Demo Data
  const loadDemoSeedData = useCallback(() => {
    setDiscoveredMachineIds(['seated-chest-press', 'lat-pulldown']);
    setCompletedTutorialIds(['seated-chest-press', 'lat-pulldown']);
    setFavoriteMachineIds(['seated-chest-press']);
    setActivityLog(SEED_ACTIVITY_LOG);
    setXpTransactions(SEED_XP_TRANSACTIONS);
    setAchievements(PROMPT_ACHIEVEMENTS.map(ach => {
      if (ach.id === 'first-discovery') {
        return { ...ach, currentCount: 2, unlocked: true, unlockedAt: Date.now() - 3600000 * 24 * 3 + 400000 };
      }
      if (ach.id === 'machine-explorer') return { ...ach, currentCount: 2 };
      if (ach.id === 'equipment-expert') return { ...ach, currentCount: 2 };
      if (ach.id === 'qr-scanner') return { ...ach, currentCount: 1 };
      if (ach.id === 'tutorial-learner') return { ...ach, currentCount: 2 };
      if (ach.id === 'gym-explorer-categories') return { ...ach, currentCount: 2 };
      return ach;
    }));
    setUserProfile(DEFAULT_PROFILE);

    addToast({
      type: 'success',
      title: 'Demo Data Restored',
      message: 'Initial sample gym scan history and XP have been populated.'
    });
  }, [addToast]);

  // Reset all user data for fresh zero-state testing
  const clearAllUserData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.DISCOVERED);
    localStorage.removeItem(STORAGE_KEYS.TUTORIALS);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOG);
    localStorage.removeItem(STORAGE_KEYS.XP_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);

    setDiscoveredMachineIds([]);
    setCompletedTutorialIds([]);
    setFavoriteMachineIds([]);
    setActivityLog([]);
    setXpTransactions([]);
    setAchievements(PROMPT_ACHIEVEMENTS);
    setUserProfile(DEFAULT_PROFILE);

    addToast({
      type: 'warning',
      title: 'Zero State Reset',
      message: 'All activity records, XP, and badges cleared for clean test.'
    });
  }, [addToast]);

  return (
    <GymContext.Provider
      value={{
        machines,
        discoveredMachineIds,
        completedTutorialIds,
        favoriteMachineIds,
        activityLog,
        scanRecords: activityLog.filter(a => a.activityType === 'qr_scan' || a.activityType === 'photo_scan'),
        xpTransactions,
        achievements,
        userProfile: {
          ...userProfile,
          totalXP,
          currentLevel: currentLevel.level,
          uniqueMachineCount: discoveredMachineIds.length,
          achievementsUnlockedCount: achievements.filter(a => a.unlocked).length
        },
        toasts,
        totalXP,
        currentLevel,
        streakInfo,
        isDemoMode,
        isLoading,
        simulatedError,
        recordMachineScan,
        markTutorialCompleted,
        toggleFavorite,
        updateUserProfile,
        reportMachineIssue,
        removeToast,
        addToast,
        clearAllUserData,
        loadDemoSeedData,
        simulateLevelUp,
        setSimulatedError,
        getMachineById,
        getMachineByQRCode,
        isMachineDiscovered,
        isTutorialCompleted,
        isFavorite,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};

// Aliases for global UserContext access
export const UserContext = GymContext;
export const useUserContext = useGym;
