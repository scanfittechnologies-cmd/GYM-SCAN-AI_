import { useState, useEffect, useCallback } from 'react';

export type UserTier = 'free' | 'plus' | 'pro';

const STORAGE_KEY_TIER = 'user_tier';

export const FREE_SCAN_LIMIT = 3;

// ─── Storage key helpers ──────────────────────────────────────────────────────

/** Returns the current-month storage key, e.g. "scanCount_2026-10" */
function monthKey(date = new Date()): string {
  return `scanCount_${date.toISOString().slice(0, 7)}`;
}

/**
 * Read scan count for the current month from localStorage.
 * Handles legacy migration from old 'scanCount' + 'scanMonth' keys.
 */
export function getScanCount(): number {
  const key = monthKey();
  const raw = localStorage.getItem(key);
  if (raw !== null) {
    return parseInt(raw, 10) || 0;
  }

  // ── Legacy migration: old separate 'scanCount' + 'scanMonth' keys ──
  const currentMonth = new Date().toISOString().slice(0, 7);
  const legacyMonth = localStorage.getItem('scanMonth');
  const legacyCount = localStorage.getItem('scanCount');
  if (legacyMonth === currentMonth && legacyCount !== null) {
    const count = parseInt(legacyCount, 10) || 0;
    localStorage.setItem(key, count.toString());
    localStorage.removeItem('scanCount');
    localStorage.removeItem('scanMonth');
    return count;
  }

  return 0;
}

/** Write the scan count for the current month into localStorage. */
function writeScanCount(count: number): void {
  localStorage.setItem(monthKey(), count.toString());
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

  // Free Beta Testing Mode: Unlimited scans for all users without soft paywall
  const hasReachedScanLimit = false;
  const remainingFreeScans = Infinity;

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
