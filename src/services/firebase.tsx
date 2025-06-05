// src/services/firebase.tsx
import Constants from 'expo-constants';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const cfg = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY!,
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN!,
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID!,
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID!,
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID!
};

const app = !getApps().length ? initializeApp(cfg) : getApps()[0];
export const auth = getAuth(app);