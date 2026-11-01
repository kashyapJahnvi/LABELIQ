import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  authError: string | null;
  isConfigured: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  authError: null,
  isConfigured: false,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  resetPassword: async () => false,
  getIdToken: async () => null,
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Friendly error message mapper for Firebase Auth error codes
export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'The email address format is invalid.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'The password is too weak. Please choose a password with at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. Try again later.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    case 'auth/missing-password':
      return 'Password cannot be empty.';
    case 'auth/missing-email':
      return 'Email address cannot be empty.';
    default:
      return error.message || 'Authentication operation failed.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const configured = isFirebaseConfigured();

  // Helper to fetch server-side claims & allowlist
  const checkAdminPrivileges = async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    try {
      // 1. Check Firebase token claims
      const tokenResult = await currentUser.getIdTokenResult();
      if (tokenResult.claims && tokenResult.claims.admin === true) {
        setIsAdmin(true);
        return;
      }

      // 2. Query backend /api/auth/me for server-side allowlist check
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(Boolean(data.isAdmin));
        return;
      }
    } catch (err) {
      console.warn('[AuthContext] Failed checking admin status:', err);
    }
    setIsAdmin(false);
  };

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await checkAdminPrivileges(currentUser);
      setLoading(false);
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (currentUser) => {
      if (currentUser) {
        await checkAdminPrivileges(currentUser);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeToken();
    };
  }, [configured]);

  const getIdToken = async (forceRefresh = false): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken(forceRefresh);
    } catch (err) {
      console.error('[AuthContext] Error retrieving ID token:', err);
      return null;
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      return true;
    } catch (err: any) {
      const msg = formatAuthError(err);
      setAuthError(msg);
      return false;
    }
  };

  const signup = async (email: string, pass: string, name?: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name && name.trim() && cred.user) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      return true;
    } catch (err: any) {
      const msg = formatAuthError(err);
      setAuthError(msg);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setAuthError(null);
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
    } catch (err: any) {
      setAuthError(formatAuthError(err));
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (err: any) {
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        authError,
        isConfigured: configured,
        login,
        signup,
        logout,
        resetPassword,
        getIdToken,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
