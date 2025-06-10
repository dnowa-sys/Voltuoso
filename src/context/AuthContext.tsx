// src/context/AuthContext.tsx - Fixed for Expo with Web Firebase SDK
import {
  User,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { User as AppUser } from '../types/payment';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: Partial<AppUser>) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<AppUser>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || undefined,
              photoURL: firebaseUser.photoURL || undefined,
              role: userData.role || 'customer',
              stripeCustomerId: userData.stripeCustomerId,
              defaultPaymentMethodId: userData.defaultPaymentMethodId,
              stationIds: userData.stationIds || [],
              totalSpent: userData.totalSpent || 0,
              totalEnergyConsumed: userData.totalEnergyConsumed || 0,
              membershipLevel: userData.membershipLevel || 'basic',
              createdAt: userData.createdAt?.toDate() || new Date(),
              lastLoginAt: new Date(),
              // Legacy fields for backward compatibility
              firstName: userData.firstName,
              lastName: userData.lastName,
              username: userData.username,
              carType: userData.carType,
            } as AppUser);
          } else {
            // Create user document if it doesn't exist
            const newUser: AppUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || undefined,
              photoURL: firebaseUser.photoURL || undefined,
              role: 'customer',
              stationIds: [],
              totalSpent: 0,
              totalEnergyConsumed: 0,
              membershipLevel: 'basic',
              createdAt: new Date(),
              lastLoginAt: new Date(),
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...newUser,
              createdAt: new Date(),
              lastLoginAt: new Date(),
            });
            
            setUser(newUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Create minimal user object if Firestore fails
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || undefined,
            role: 'customer',
            stationIds: [],
            totalSpent: 0,
            totalEnergyConsumed: 0,
            membershipLevel: 'basic',
            createdAt: new Date(),
            lastLoginAt: new Date(),
          } as AppUser);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Update last login time
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          lastLoginAt: new Date(),
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: Partial<AppUser>) => {
    setLoading(true);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile if display name provided
      if (userData?.displayName) {
        await updateProfile(firebaseUser, {
          displayName: userData.displayName,
        });
      }
      
      // Create user document in Firestore
      const newUser: AppUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: userData?.displayName || firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        role: userData?.role || 'customer',
        stationIds: [],
        totalSpent: 0,
        totalEnergyConsumed: 0,
        membershipLevel: 'basic',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        // Legacy fields
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        username: userData?.username,
        carType: userData?.carType,
        ...userData,
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data: Partial<AppUser>) => {
    if (!firebaseUser || !user) {
      throw new Error('No user signed in');
    }

    try {
      // Update Firebase Auth profile if needed
      if (data.displayName !== undefined) {
        await updateProfile(firebaseUser, {
          displayName: data.displayName || null,
        });
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        ...data,
        updatedAt: new Date(),
      });

      // Update local state
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error: any) {
      console.error('Update user error:', error);
      throw new Error('Failed to update user profile');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to convert Firebase error codes to user-friendly messages
function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'An error occurred. Please try again';
  }
}