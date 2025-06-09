// app/_layout.tsx - Fixed with proper Stripe setup
import { StripeProvider } from '@stripe/stripe-react-native';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { AuthProvider } from '../src/context/AuthContext';

// Prevent auto-hiding of splash screen
SplashScreen.preventAutoHideAsync();

// Your Stripe publishable key (replace with your actual key)
const STRIPE_PUBLISHABLE_KEY = 'STRIPE_PUBLISHABLE_KEY';

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after app is ready
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY}
        merchantIdentifier="merchant.com.voltuoso.app" // Optional: for Apple Pay
        urlScheme="voltuoso" // Required for 3D Secure
      >
        <AuthProvider>
          <SafeAreaProvider>
            <Stack 
              screenOptions={{ 
                headerShown: false,
                animation: 'slide_from_right'
              }} 
            />
          </SafeAreaProvider>
        </AuthProvider>
      </StripeProvider>
    </ErrorBoundary>
  );
}