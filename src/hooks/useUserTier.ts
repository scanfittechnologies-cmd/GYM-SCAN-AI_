import { useState, useEffect, useCallback } from 'react';

export type UserTier = 'free' | 'plus' | 'pro';

const STORAGE_KEY_TIER = 'user_tier';

export const FREE_SCAN_LIMIT = 3;

// ─── Storage key helpers ──────────────────────────────────────────────────────
const STORAGE_KEY_DAILY_SCANS = 'scanCount_daily';
const STORAGE_KEY_RESET_TIMESTAMP = 'scanCount_lastResetTime';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Read scan count for the current 24-hour window from localStorage.
 * Automatically resets count if 24 hours have elapsed since last reset timestamp.
 */
export function getScanCount(): number {
  try {
    if (typeof localStorage === 'undefined') return 0;
    const now = Date.now();
    const lastReset = localStorage.getItem(STORAGE_KEY_RESET_TIMESTAMP);
    
    // If no reset timestamp exists, initialize it
    if (!lastReset) {
      localStorage.setItem(STORAGE_KEY_RESET_TIMESTAMP, now.toString());
      localStorage.setItem(STORAGE_KEY_DAILY_SCANS, '0');
      return 0;
    }

    const lastResetTime = parseInt(lastReset, 10) || 0;
    // Check if 24 hours have passed
    if (now - lastResetTime >= TWENTY_FOUR_HOURS_MS) {
      localStorage.setItem(STORAGE_KEY_RESET_TIMESTAMP, now.toString());
      localStorage.setItem(STORAGE_KEY_DAILY_SCANS, '0');
      return 0;
    }

    const raw = localStorage.getItem(STORAGE_KEY_DAILY_SCANS);
    if (raw !== null) {
      return parseInt(raw, 10) || 0;
    }

    return 0;
  } catch {
    return 0;
  }
}

/** Write the daily scan count into localStorage. */
function writeScanCount(count: number): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_DAILY_SCANS, count.toString());
    if (!localStorage.getItem(STORAGE_KEY_RESET_TIMESTAMP)) {
      localStorage.setItem(STORAGE_KEY_RESET_TIMESTAMP, Date.now().toString());
    }
  } catch {
    // Ignore storage quota errors
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUserTier() {
  const [tier, setTierState] = useState<UserTier>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TIER);
    if (saved === 'plus' || saved === 'pro' || saved === 'free') return saved;
    return 'free';
  });

  const [scanCount, setScanCountState] = useState<number>(() => getScanCount());

  // Sync tier changes to localStorage and dispatch custom event for cross-component sync
  const setTier = useCallback((newTier: UserTier) => {
    setTierState(newTier);
    localStorage.setItem(STORAGE_KEY_TIER, newTier);
    window.dispatchEvent(new Event('tier_change'));
  }, []);

  const incrementScanCount = useCallback(() => {
    const current = getScanCount();
    const nextCount = current + 1;
    writeScanCount(nextCount);
    setScanCountState(nextCount);
    // Dispatch event so progress pill / any other listener updates immediately
    window.dispatchEvent(new Event('scan_count_change'));
    return nextCount;
  }, []);

  const resetScanCount = useCallback(() => {
    writeScanCount(0);
    setScanCountState(0);
    window.dispatchEvent(new Event('scan_count_change'));
  }, []);

  // Listen to cross-tab or cross-component changes
  useEffect(() => {
    const handleTierChange = () => {
      const saved = localStorage.getItem(STORAGE_KEY_TIER);
      if (saved === 'plus' || saved === 'pro' || saved === 'free') {
        setTierState(saved);
      }
    };

    const handleScanChange = () => {
      setScanCountState(getScanCount());
    };

    window.addEventListener('tier_change', handleTierChange);
    window.addEventListener('scan_count_change', handleScanChange);
    window.addEventListener('storage', handleTierChange);

    return () => {
      window.removeEventListener('tier_change', handleTierChange);
      window.removeEventListener('scan_count_change', handleScanChange);
      window.removeEventListener('storage', handleTierChange);
    };
  }, []);

  const isFree = tier === 'free';
  const isPlus = tier === 'plus';
  const isPro = tier === 'pro';

  // Daily Beta Scan Limit: Exactly 3 scans per user/session every 24 hours
  const hasReachedScanLimit = isFree && scanCount >= FREE_SCAN_LIMIT;
  const remainingFreeScans = Math.max(0, FREE_SCAN_LIMIT - scanCount);

  return {
    tier,
    setTier,
    scanCount,
    getScanCount,
    incrementScanCount,
    resetScanCount,
    isFree,
    isPlus,
    isPro,
    hasReachedScanLimit,
    remainingFreeScans,
    freeScanLimit: FREE_SCAN_LIMIT,
  };
}
