// src/components/StripeProvider.tsx (NOTE: .tsx extension required)
import { StripeProvider as StripeProviderNative } from '@stripe/stripe-react-native';
import React, { useEffect } from 'react';
import { initializeStripe, STRIPE_PUBLISHABLE_KEY } from '../services/stripeService';

interface StripeProviderProps {
  children: React.ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  useEffect(() => {
    initializeStripe().catch(console.error);
  }, []);

  return (
    <StripeProviderNative
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.voltuoso.app"
      urlScheme="voltuoso"
    >
      {children}
    </StripeProviderNative>
  );
}