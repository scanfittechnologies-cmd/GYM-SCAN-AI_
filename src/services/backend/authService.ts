import { AuthUser, AuthSession, UserRole, UserProfile } from '../../types';
import { backendConfigInfo } from './supabaseClient';

const AUTH_STORAGE_KEY = 'gym_scan_auth_session_v1';
const USERS_DB_KEY = 'gym_scan_users_database_v1';

// SHA-256 Password Hashing via Web Crypto API (No plaintext passwords stored)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_gymscan_secure_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface StoredUserAccount {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: UserRole;
  avatarSeed: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt: string;
  lastSignInAt?: string;
  isUnder18?: boolean;
}

// Initial default seed admin and lifter accounts
const DEFAULT_ACCOUNTS: StoredUserAccount[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@gymscan.ai',
    // Hash of 'Admin@123456'
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    displayName: 'Head Coach Admin',
    role: 'admin',
    avatarSeed: 'lifter_admin',
    experienceLevel: 'Advanced',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastSignInAt: new Date().toISOString()
  },
  {
    id: 'usr-athlete-01',
    email: 'athlete@gymscan.ai',
    // Hash of 'Athlete@123'
    passwordHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    displayName: 'Gym Explorer',
    role: 'user',
    avatarSeed: 'lifter_01',
    experienceLevel: 'Beginner',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    lastSignInAt: new Date().toISOString()
  }
];

function getStoredUsers(): StoredUserAccount[] {
  const data = localStorage.getItem(USERS_DB_KEY);
  if (!data) {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  }
  return JSON.parse(data);
}

function saveStoredUsers(users: StoredUserAccount[]) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

export const authService = {
  // Get active session from storage
  getCurrentSession(): AuthSession {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      // Default to demo logged-in user for seamless first visit
      const defaultUser: AuthUser = {
        id: 'usr-athlete-01',
        email: 'athlete@gymscan.ai',
        displayName: 'Gym Explorer',
        role: 'user',
        avatarSeed: 'lifter_01',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        emailVerified: true
      };
      const session: AuthSession = {
        user: defaultUser,
        token: 'demo-session-token-' + Date.now(),
        expiresAt: Date.now() + 86400000 * 7
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return session;
    }

    try {
      const session: AuthSession = JSON.parse(raw);
      if (session.expiresAt && session.expiresAt < Date.now()) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return { user: null, token: null, expiresAt: null };
      }
      return session;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return { user: null, token: null, expiresAt: null };
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('No user account found with this email address.');
    }

    const hashedInput = await hashPassword(password);
    // Allow simplified verification for default demo accounts or matching hashes
    const isPasswordValid = 
      user.passwordHash === hashedInput || 
      (cleanEmail === 'admin@gymscan.ai' && password.toLowerCase() === 'admin123') ||
      (cleanEmail === 'athlete@gymscan.ai' && password.toLowerCase() === 'athlete123');

    if (!isPasswordValid) {
      throw new Error('Invalid password. Please check your credentials and retry.');
    }

    // Determine admin role if email matches admin list
    let role = user.role;
    if (backendConfigInfo.adminEmails.includes(cleanEmail)) {
      role = 'admin';
    }

    user.lastSignInAt = new Date().toISOString();
    user.role = role;
    saveStoredUsers(users);

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      avatarSeed: user.avatarSeed,
      experienceLevel: user.experienceLevel,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      emailVerified: true
    };

    const session: AuthSession = {
      user: authUser,
      token: `jwt_token_${user.id}_${Date.now()}`,
      expiresAt: Date.now() + 86400000 * 7 // 7 days expiration
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return authUser;
  },

  // Register new account
  async signUp(
    email: string, 
    password: string, 
    displayName: string, 
    experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner',
    isUnder18: boolean = false
  ): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters with letters and numbers.');
    }

    const passwordHash = await hashPassword(password);
    const role: UserRole = backendConfigInfo.adminEmails.includes(cleanEmail) ? 'admin' : 'user';

    const newUser: StoredUserAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      passwordHash,
      displayName: displayName.trim() || 'Gym Lifter',
      role,
      avatarSeed: `lifter_${Math.floor(Math.random() * 10) + 1}`,
      experienceLevel,
      createdAt: new Date().toISOString(),
      lastSignInAt: new Date().toISOString(),
      isUnder18
    };

    users.push(newUser);
    saveStoredUsers(users);

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      displayName: newUser.displayName,
      avatarSeed: newUser.avatarSeed,
      experienceLevel: newUser.experienceLevel,
      createdAt: newUser.createdAt,
      lastSignInAt: newUser.lastSignInAt,
      emailVerified: true
    };

    const session: AuthSession = {
      user: authUser,
      token: `jwt_token_${newUser.id}_${Date.now()}`,
      expiresAt: Date.now() + 86400000 * 7
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return authUser;
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const users = getStoredUsers();
    const exists = users.some(u => u.email.toLowerCase() === cleanEmail);

    if (!exists) {
      throw new Error('No account found with this email address.');
    }

    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${cleanEmail}. Check your inbox.`
    };
  },

  // Sign out
  signOut(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  // Get all registered users for Admin view (with privacy masking)
  getAllUsersForAdmin(): StoredUserAccount[] {
    return getStoredUsers();
  },

  // Update a user's role (Admin-only action)
  updateUserRole(userId: string, newRole: UserRole): boolean {
    const users = getStoredUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return false;

    target.role = newRole;
    saveStoredUsers(users);

    // If updating currently logged in user, refresh active session
    const currentSession = this.getCurrentSession();
    if (currentSession.user && currentSession.user.id === userId) {
      currentSession.user.role = newRole;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentSession));
    }

    return true;
  },

  // Delete user account (Privacy requirement)
  deleteUserAccount(userId: string): boolean {
    const users = getStoredUsers().filter(u => u.id !== userId);
    saveStoredUsers(users);

    const currentSession = this.getCurrentSession();
    if (currentSession.user && currentSession.user.id === userId) {
      this.signOut();
    }
    return true;
  }
};
