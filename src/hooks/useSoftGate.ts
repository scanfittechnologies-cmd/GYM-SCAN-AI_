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
   * If authenticated, executes the callback immediately.
   * If unauthenticated, opens the auth modal with a contextual soft gate message.
   */
  const requireAuth = useCallback(
    (callback: () => void, message?: string) => {
      if (isAuthenticated) {
        callback();
      } else {
        openSoftGate(
          message || 'Create a free account to save your progress and track your workout XP!',
          'signup'
        );
      }
    },
    [isAuthenticated, openSoftGate]
  );

  return { requireAuth, isAuthenticated };
}
