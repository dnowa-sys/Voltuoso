// src/components/StripeProviderSimple.tsx
import React from 'react';

interface StripeProviderSimpleProps {
  children: React.ReactNode;
}

export function StripeProviderSimple({ children }: StripeProviderSimpleProps) {
  // This is a simple wrapper that doesn't initialize Stripe
  // Useful for development when you want to test the app without Stripe setup
  console.log('📱 Using StripeProviderSimple (Stripe not initialized)');
  
  return <>{children}</>;
}