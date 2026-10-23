import { useState, useEffect, useCallback } from 'react';

export type UserTier = 'free' | 'plus' | 'pro';

const STORAGE_KEY_TIER = 'user_tier';
const STORAGE_KEY_SCANS = 'scanCount';
const STORAGE_KEY_MONTH = 'scanMonth';

export const FREE_SCAN_LIMIT = 3;

export function useUserTier() {
  const [tier, setTierState] = useState<UserTier>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TIER);
    if (saved === 'plus' || saved === 'pro' || saved === 'free') {
      return saved;
    }
    return 'free';
  });

  const [scanCount, setScanCountState] = useState<number>(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const storedMonth = localStorage.getItem(STORAGE_KEY_MONTH);
    if (storedMonth !== currentMonth) {
      localStorage.setItem(STORAGE_KEY_MONTH, currentMonth);
      localStorage.setItem(STORAGE_KEY_SCANS, '0');
      return 0;
    }
    const val = localStorage.getItem(STORAGE_KEY_SCANS);
    return val ? parseInt(val, 10) || 0 : 0;
  });

  // Sync tier changes to localStorage and dispatch custom event for cross-component sync
  const setTier = useCallback((newTier: UserTier) => {
    setTierState(newTier);
    localStorage.setItem(STORAGE_KEY_TIER, newTier);
    window.dispatchEvent(new Event('tier_change'));
  }, []);

  const incrementScanCount = useCallback(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const storedMonth = localStorage.getItem(STORAGE_KEY_MONTH);
    let nextCount = 1;
    if (storedMonth === currentMonth) {
      const current = parseInt(localStorage.getItem(STORAGE_KEY_SCANS) || '0', 10) || 0;
      nextCount = current + 1;
    } else {
      localStorage.setItem(STORAGE_KEY_MONTH, currentMonth);
    }
    localStorage.setItem(STORAGE_KEY_SCANS, nextCount.toString());
    setScanCountState(nextCount);
    window.dispatchEvent(new Event('scan_count_change'));
    return nextCount;
  }, []);

  const resetScanCount = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_SCANS, '0');
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
      const val = localStorage.getItem(STORAGE_KEY_SCANS);
      setScanCountState(val ? parseInt(val, 10) || 0 : 0);
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

  // Check if scan limit reached
  const hasReachedScanLimit = isFree && scanCount >= FREE_SCAN_LIMIT;
  const remainingFreeScans = Math.max(0, FREE_SCAN_LIMIT - scanCount);

  return {
    tier,
    setTier,
    scanCount,
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
