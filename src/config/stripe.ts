// src/config/stripe.ts

export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Stripe configuration
export const stripeConfig = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  merchantId: process.env.EXPO_PUBLIC_STRIPE_MERCHANT_ID,
  urlScheme: 'voltuoso', // Your app's URL scheme for redirects
};

// Payment method types
export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  stationId: string;
  stationName: string;
  amount: number; // in cents
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paymentMethodId: string;
  sessionStartTime?: Date;
  sessionEndTime?: Date;
  energyDelivered?: number; // kWh
  createdAt: Date;
  receiptSent: boolean;
}

// Charging session types
export interface ChargingSession {
  id: string;
  userId: string;
  stationId: string;
  paymentIntentId: string;
  status: 'authorized' | 'active' | 'completed' | 'cancelled';
  authorizedAmount: number;
  finalAmount?: number;
  startTime?: Date;
  endTime?: Date;
  energyDelivered: number;
  createdAt: Date;
}