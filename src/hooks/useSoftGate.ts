import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Soft Gate Hook — Provides a clean way to gate actions behind authentication.
 * 
 * Usage:
 *   const { requireAuth, isAuthenticated } = useSoftGate();
 *   
 *   // Gate an action with a contextual message
 *   requireAuth(() => toggleFavorite(id), 'Create a free account to save your favorite machines!');
 *   
 *   // Check auth state for conditional rendering
 *   if (!isAuthenticated) { ... }
 */
export function useSoftGate() {
  const { isAuthenticated, openSoftGate } = useAuth();

  /**
   * Guest-First Mode: Executes the callback immediately without auth gating.
   */
  const requireAuth = useCallback(
    (callback: () => void, _message?: string) => {
      callback();
    },
    []
  );

  return { requireAuth, isAuthenticated };
}
