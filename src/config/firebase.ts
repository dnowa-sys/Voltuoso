// src/config/firebase.ts - WORKING VERSION FOR REACT NATIVE
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};

console.log('🔥 Initializing Firebase...');
console.log('📋 Config check:', {
  apiKey: firebaseConfig.apiKey ? 'Present' : 'MISSING',
  authDomain: firebaseConfig.authDomain || 'MISSING',
  projectId: firebaseConfig.projectId || 'MISSING',
});

// Initialize Firebase App (avoid duplicate initialization)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
} else {
  app = getApp();
  console.log('✅ Using existing Firebase app');
}

// Initialize Auth with proper React Native setup
let auth;
try {
  // Try to get existing auth instance first
  auth = getAuth(app);
  console.log('✅ Using existing Firebase Auth instance');
} catch (error) {
  try {
    // If no existing auth, initialize with AsyncStorage
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
  } catch (initError: any) {
    // Final fallback
    console.warn('⚠️ Auth initialization failed, using basic getAuth:', initError.message);
    auth = getAuth(app);
  }
}

// Initialize Firestore
const db = getFirestore(app);
console.log('✅ Firestore initialized');

export { app, auth, db };
