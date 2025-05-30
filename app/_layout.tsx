// app/_layout.tsx
import Constants from 'expo-constants';
import { Redirect, SplashScreen, Stack, usePathname } from "expo-router";
import { getApps, initializeApp } from 'firebase/app';
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";

// Load Firebase config from app constants or environment
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID,
};

// Initialize Firebase only once
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

// Prevent the splash from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const prepare = async () => {
      await SplashScreen.hideAsync();
    };
    prepare();
  }, []);

  // Wait for auth state to resolve
  if (loading) return null;

  const isAuthRoute = pathname.startsWith("/(auth)");

  // 🚫 If unauthenticated and trying to access app content → boot to login
  if (!user && !isAuthRoute) {
    return <Redirect href="/(auth)/login" />;
  }

  // ✅ If authenticated and trying to access auth screens → reroute home
  if (user && isAuthRoute) {
    return <Redirect href="/(app)" />;
  }

  // 🧭 Otherwise: render the appropriate layout
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}