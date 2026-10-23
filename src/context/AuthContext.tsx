import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthUser, AuthSession, UserRole } from '../types';
import { authService } from '../services/backend/authService';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession;
  role: UserRole;
  isAdmin: boolean;
  isEditor: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup' | 'reset';
  softGateMessage: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (email: string, password: string, displayName: string, experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced', isUnder18?: boolean) => Promise<AuthUser>;
  signOut: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  openAuthModal: (mode?: 'signin' | 'signup' | 'reset') => void;
  openSoftGate: (message: string, mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  setDevRole: (newRole: UserRole) => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession>(() => authService.getCurrentSession());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [softGateMessage, setSoftGateMessage] = useState<string | null>(null);

  const user = session.user;
  const role: UserRole = user?.role || 'user';
  const isAdmin = role === 'admin';
  const isEditor = role === 'editor' || role === 'admin';
  const isAuthenticated = Boolean(user && session.token);

  // Sync session on mount
  useEffect(() => {
    const current = authService.getCurrentSession();
    setSession(current);
  }, []);

  const openAuthModal = useCallback((mode: 'signin' | 'signup' | 'reset' = 'signin') => {
    setAuthModalMode(mode);
    setAuthError(null);
    setSoftGateMessage(null);
    setIsAuthModalOpen(true);
  }, []);

  const openSoftGate = useCallback((message: string, mode: 'signin' | 'signup' = 'signup') => {
    setSoftGateMessage(message);
    setAuthModalMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
    setSoftGateMessage(null);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const authUser = await authService.signIn(email, password);
      setSession(authService.getCurrentSession());
      setIsAuthModalOpen(false);
      return authUser;
    } catch (err: any) {
      const message = err.message || 'Failed to sign in. Please verify your email and password.';
      setAuthError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    displayName: string, 
    experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner',
    isUnder18: boolean = false
  ): Promise<AuthUser> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const authUser = await authService.signUp(email, password, displayName, experienceLevel, isUnder18);
      setSession(authService.getCurrentSession());
      setIsAuthModalOpen(false);
      return authUser;
    } catch (err: any) {
      const message = err.message || 'Failed to register account.';
      setAuthError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    authService.signOut();
    setSession({ user: null, token: null, expiresAt: null });
    setSoftGateMessage(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      return await authService.requestPasswordReset(email);
    } catch (err: any) {
      const message = err.message || 'Unable to process password reset request.';
      setAuthError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sandbox switch role helper for prompt testing
  const setDevRole = useCallback((newRole: UserRole) => {
    if (!session.user) return;
    authService.updateUserRole(session.user.id, newRole);
    setSession(authService.getCurrentSession());
  }, [session.user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isAdmin,
        isEditor,
        isAuthenticated,
        isLoading,
        authError,
        isAuthModalOpen,
        authModalMode,
        softGateMessage,
        signIn,
        signUp,
        signOut,
        requestPasswordReset,
        openAuthModal,
        openSoftGate,
        closeAuthModal,
        setDevRole,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
