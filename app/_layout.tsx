// app/_layout.tsx - WITH FULL STRIPE INTEGRATION
import { Stack } from 'expo-router';
import React from 'react';
import { StripeProvider } from '../src/components/StripeProvider';
import { AuthProvider } from '../src/context/AuthContext';
// import { StripeProviderSimple } from '../src/components/StripeProviderSimple';

function RootLayout() {
  // Toggle between full Stripe integration and simple mode
  const useFullStripe = true; // Set to false to use simple mode without Stripe

  if (useFullStripe) {
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

  // Simple mode without Stripe (for development/testing)
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="station/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}

export default RootLayout;