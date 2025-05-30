// app/_layout.tsx
import { Redirect, SplashScreen, Stack, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';

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

  if (loading) return null;

  const isAuthRoute = pathname.startsWith('/(auth)');
  if (!user && !isAuthRoute) return <Redirect href="/(auth)/login" />;
  if (user && isAuthRoute) return <Redirect href="/(app)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutNav />
    </SafeAreaProvider>
  );
}