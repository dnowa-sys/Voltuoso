// app/_layout.tsx - Fixed with proper Stripe setup
import { StripeProvider } from '@stripe/stripe-react-native';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { AuthProvider } from '../src/context/AuthContext';

// Prevent auto-hiding of splash screen
SplashScreen.preventAutoHideAsync();

// Replace with your actual Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_actual_key_here';

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after app is ready
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(console.warn);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Validate Stripe key
  if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.includes('your_')) {
    console.error('❌ Invalid Stripe publishable key. Please set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env file');
    console.error('You can find this key in your Stripe Dashboard > Developers > API keys');
  } else {
    console.log('✅ Stripe provider initialized with key:', STRIPE_PUBLISHABLE_KEY.substring(0, 12) + '...');
  }

  return (
    <ErrorBoundary>
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY}
        merchantIdentifier="merchant.com.voltuoso.app" // Optional: for Apple Pay
        urlScheme="voltuoso" // Required for 3D Secure and return URLs
        // Add these for better error handling
        threeDSecureParams={{
          backgroundColor: '#ffffff',
          timeout: 5,
        }}
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