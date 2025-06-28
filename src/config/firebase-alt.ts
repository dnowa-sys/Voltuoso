// src/config/firebase-alt.ts - ALTERNATIVE CONFIGURATION
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Function to get environment variable from multiple sources
const getEnvVar = (key: string): string | undefined => {
  // Try process.env first
  if (process.env[key]) {
    return process.env[key];
  }
  
  // Try Constants.expoConfig.extra
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key];
  }
  
  // Try Constants.manifest.extra (legacy)
  if (Constants.manifest?.extra?.[key]) {
    return Constants.manifest.extra[key];
  }
  
  return undefined;
};

// Hardcoded configuration as fallback (based on your files)
const FALLBACK_CONFIG = {
  apiKey: "AIzaSyCeLN9qSrTNRng22QDOJuK-RFwbZh8EHjU",
  authDomain: "voltuoso-91370.firebaseapp.com",
  projectId: "voltuoso-91370",
  storageBucket: "voltuoso-91370.firebasestorage.app",
  messagingSenderId: "601405213922",
  appId: "1:601405213922:ios:6930153889c4189133e2bb",
  databaseURL: "https://voltuoso-91370-default-rtdb.firebaseio.com",
};

// Get configuration with fallbacks
const getFirebaseConfig = () => {
  const config = {
    apiKey: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY') || FALLBACK_CONFIG.apiKey,
    authDomain: getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN') || FALLBACK_CONFIG.authDomain,
    projectId: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID') || FALLBACK_CONFIG.projectId,
    storageBucket: getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET') || FALLBACK_CONFIG.storageBucket,
    messagingSenderId: getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') || FALLBACK_CONFIG.messagingSenderId,
    appId: getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID') || FALLBACK_CONFIG.appId,
    measurementId: getEnvVar('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID'),
    databaseURL: getEnvVar('EXPO_PUBLIC_FIREBASE_DATABASE_URL') || FALLBACK_CONFIG.databaseURL,
  };

  console.log('🔥 Firebase Config Sources:');
  console.log('- API Key:', getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY') ? 'from env' : 'from fallback');
  console.log('- Auth Domain:', getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN') ? 'from env' : 'from fallback');
  console.log('- Project ID:', config.projectId);

  return config;
};

// Get Firebase configuration
const firebaseConfig = getFirebaseConfig();

// Validate critical fields
const validateConfig = (config: any) => {
  const required = ['apiKey', 'authDomain', 'projectId'];
  const missing = required.filter(field => !config[field]);
  
  if (missing.length > 0) {
    const error = `Missing required Firebase config: ${missing.join(', ')}`;
    console.error('❌', error);
    throw new Error(error);
  }
  
  console.log('✅ Firebase configuration validated');
};

// Validate configuration
validateConfig(firebaseConfig);

// Initialize Firebase App
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
} catch (error: any) {
  console.error('❌ Firebase app initialization failed:', error);
  throw error;
}

// Initialize Firebase Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('✅ Firebase Auth initialized with persistence');
} catch (error: any) {
  // If initializeAuth fails, try getAuth
  console.log('⚠️ initializeAuth failed, trying getAuth:', error.message);
  try {
    auth = getAuth(app);
    console.log('✅ Firebase Auth initialized with getAuth');
  } catch (secondError: any) {
    console.error('❌ Both initializeAuth and getAuth failed:', secondError);
    throw secondError;
  }
}

// Initialize Firestore
let db;
try {
  db = getFirestore(app);
  console.log('✅ Firestore initialized');
} catch (error: any) {
  console.error('❌ Firestore initialization failed:', error);
  throw error;
}

export { app, auth, db, firebaseConfig };
