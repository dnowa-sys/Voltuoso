// app/_layout.tsx
import { Redirect, SplashScreen, Stack, usePathname } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";

// Prevent the splash from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
