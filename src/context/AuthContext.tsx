// src/context/AuthContext.tsx - ENHANCED ERROR HANDLING
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthUser,
  createUserWithEmail,
  signOut as firebaseSignOut,
  getCurrentUser,
  onAuthStateChange,
  signInWithEmail
} from '../services/firebaseAuth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🚀 TOGGLE THIS FLAG TO SWITCH BETWEEN MOCK AND FIREBASE
const USE_FIREBASE = true; // Keep Firebase enabled
const FALLBACK_TO_MOCK_ON_NETWORK_ERROR = false; // Disable fallback now that network works

// Helper function to get user-friendly error messages
const getErrorMessage = (error: any): string => {
  const errorCode = error.code || error.message;
  
  switch (errorCode) {
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not enabled. Please contact support.';
    default:
      console.error('Auth error details:', error);
      return error.message || 'An error occurred. Please try again.';
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_FIREBASE) {
      // Firebase Auth State Listener
      const unsubscribe = onAuthStateChange((user) => {
        setUser(user);
        setLoading(false);
      });

      // Check if user is already signed in
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);

      return unsubscribe;
    } else {
      // Mock mode - no persistent auth
      setLoading(false);
      return undefined;
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (USE_FIREBASE) {
        const user = await signInWithEmail(email, password);
        setUser(user);
      } else {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser({ email, id: 'mock-user-id' });
      }
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      
      // Fallback to mock auth on network errors (disabled for now)
      if (FALLBACK_TO_MOCK_ON_NETWORK_ERROR && error.code === 'auth/network-request-failed') {
        console.log('🔄 Network error detected, falling back to mock auth for testing');
        setUser({ email, id: 'mock-user-id-network-fallback' });
        setLoading(false);
        return;
      }
      
      const friendlyMessage = getErrorMessage(error);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (USE_FIREBASE) {
        const user = await createUserWithEmail(email, password);
        setUser(user);
      } else {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser({ email, id: 'mock-user-id' });
      }
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      
      // NEW: Fallback to mock auth on network errors
      if (FALLBACK_TO_MOCK_ON_NETWORK_ERROR && error.code === 'auth/network-request-failed') {
        console.log('🔄 Network error detected, falling back to mock auth for testing');
        setUser({ email, id: 'mock-user-id-network-fallback' });
        setLoading(false);
        return;
      }
      
      const friendlyMessage = getErrorMessage(error);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (USE_FIREBASE && user?.id !== 'mock-user-id-network-fallback') {
        await firebaseSignOut();
        // User will be set to null by the auth state listener
      } else {
        setUser(null);
      }
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      const friendlyMessage = getErrorMessage(error);
      throw new Error(friendlyMessage);
    }
  };

  const contextValue = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}