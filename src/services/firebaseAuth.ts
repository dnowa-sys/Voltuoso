// src/services/firebaseAuth.ts
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    User as FirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthUser {
  email: string;
  id: string;
}

// Convert Firebase User to our User interface
export const convertFirebaseUser = (firebaseUser: FirebaseUser): AuthUser => ({
  email: firebaseUser.email || '',
  id: firebaseUser.uid,
});

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    console.log('🔥 Attempting Firebase sign in:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = convertFirebaseUser(userCredential.user);
    console.log('✅ Firebase sign in successful:', user.email);
    return user;
  } catch (error: any) {
    console.error('❌ Firebase sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Create new user with email and password
export const createUserWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    console.log('🔥 Attempting Firebase user creation:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = convertFirebaseUser(userCredential.user);
    console.log('✅ Firebase user creation successful:', user.email);
    return user;
  } catch (error: any) {
    console.error('❌ Firebase user creation error:', error);
    throw new Error(error.message || 'Failed to create user');
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    console.log('🔥 Attempting Firebase sign out');
    await firebaseSignOut(auth);
    console.log('✅ Firebase sign out successful');
  } catch (error: any) {
    console.error('❌ Firebase sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      const user = convertFirebaseUser(firebaseUser);
      console.log('🔥 Auth state changed - User signed in:', user.email);
      callback(user);
    } else {
      console.log('🔥 Auth state changed - User signed out');
      callback(null);
    }
  });
};

// Get current user
export const getCurrentUser = (): AuthUser | null => {
  const firebaseUser = auth.currentUser;
  return firebaseUser ? convertFirebaseUser(firebaseUser) : null;
};