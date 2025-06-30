// app/_layout.tsx - WITH STRIPE PROVIDER
import { Stack } from 'expo-router';
import React from 'react';
import { StripeProvider } from '../src/components/StripeProvider';
import { AuthProvider } from '../src/context/AuthContext';

function RootLayout() {
  return (
    <AuthProvider>
      <StripeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="station/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </StripeProvider>
    </AuthProvider>
  );
}

export default RootLayout;