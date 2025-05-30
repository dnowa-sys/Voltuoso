// app/firebase.tsx
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

const firebaseConfig = {
  apiKey: "FIREBASE_AUTH_API_KEY",
  authDomain: "FIREBASE_AUTH_DOMAIN",
  projectId: "FIREBASE_PROJECT_ID",
  storageBucket: "FIREBASE_STORAGE_BUCKET",
  appId: "FIREBASE_APP_ID", // <-- Add your Firebase appId here
  // …other config…
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { auth };
