// File: app/_layout.tsx
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    async function prepare() {
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
