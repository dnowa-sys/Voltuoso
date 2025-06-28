// src/context/AuthContext.tsx - HYBRID VERSION
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
const USE_FIREBASE = true; // Set to true when ready to test Firebase

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_FIREBASE) {
      // Firebase Auth State Listener
      console.log('🔥 Setting up Firebase auth state listener');
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
      console.log('🔥 Using mock auth mode');
      setLoading(false);
      return undefined;
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (USE_FIREBASE) {
        console.log('🔥 Firebase sign in:', email);
        const user = await signInWithEmail(email, password);
        setUser(user);
      } else {
        console.log('🔥 Mock sign in:', email);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser({ email, id: 'mock-user-id' });
      }
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (USE_FIREBASE) {
        console.log('🔥 Firebase sign up:', email);
        const user = await createUserWithEmail(email, password);
        setUser(user);
      } else {
        console.log('🔥 Mock sign up:', email);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser({ email, id: 'mock-user-id' });
      }
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (USE_FIREBASE) {
        console.log('🔥 Firebase sign out');
        await firebaseSignOut();
        // User will be set to null by the auth state listener
      } else {
        console.log('🔥 Mock sign out');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  const contextValue = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  console.log('🔥 AuthProvider render - Mode:', USE_FIREBASE ? 'Firebase' : 'Mock', 
              'User:', user?.email || 'None', 'Loading:', loading);

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