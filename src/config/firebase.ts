// src/config/firebase.ts - Proper React Native setup
import { getAuth } from '@react-native-firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
// import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCnBI7EleabBwbW6eN1M23tTWzJYhSrihA",
  authDomain: "voltuoso-91370.firebaseapp.com",
  projectId: "voltuoso-91370", 
  storageBucket: "voltuoso-91370.firebasestorage.app",
  messagingSenderId: "601405213922",
  appId: "1:601405213922:ios:6930153889c4189133e2bb"
};

console.log('🔥 Firebase initializing...');

// Initialize Firebase (prevent multiple initialization)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Auth for React Native
const auth = getAuth();

// Initialize Firestore
const db = getFirestore(app);

console.log('✅ Firebase initialized successfully');

export { app, auth, db };
export default app;