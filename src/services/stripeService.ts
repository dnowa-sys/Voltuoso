// src/services/stripeService.ts
import { initStripe } from '@stripe/stripe-react-native';
import { mockStripeBackend, shouldUseMockBackend } from './stripeMockBackend';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const STRIPE_MERCHANT_ID = process.env.EXPO_PUBLIC_STRIPE_MERCHANT_ID;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing Stripe publishable key in environment variables');
}

// Initialize Stripe
export const initializeStripe = async () => {
  try {
    await initStripe({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: STRIPE_MERCHANT_ID,
      urlScheme: 'voltuoso', // Your app scheme
    });
    console.log('✅ Stripe initialized successfully');
  } catch (error) {
    console.error('❌ Stripe initialization failed:', error);
    throw error;
  }
};

// Payment intent creation (calls your backend or mock)
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  try {
    if (shouldUseMockBackend()) {
      console.log('🔄 Using mock backend for payment intent');
      const response = await mockStripeBackend.createPaymentIntent(amount, currency);
      return response.client_secret;
    }

    // Real backend call
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to cents
        currency,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const { client_secret } = await response.json();
    return client_secret;
  } catch (error) {
    console.error('❌ Payment intent creation failed:', error);
    throw error;
  }
};

// Customer creation for storing payment methods
export const createCustomer = async (email: string, userId: string) => {
  try {
    if (shouldUseMockBackend()) {
      console.log('🔄 Using mock backend for customer creation');
      const response = await mockStripeBackend.createCustomer(email, userId);
      return response.customer;
    }

    // Real backend call
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/create-customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer');
    }

    const { customer } = await response.json();
    return customer;
  } catch (error) {
    console.error('❌ Customer creation failed:', error);
    throw error;
  }
};

// Setup intent for saving payment methods
export const createSetupIntent = async (customerId: string) => {
  try {
    if (shouldUseMockBackend()) {
      console.log('🔄 Using mock backend for setup intent');
      const response = await mockStripeBackend.createSetupIntent(customerId);
      return response.client_secret;
    }

    // Real backend call
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/create-setup-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create setup intent');
    }

    const { client_secret } = await response.json();
    return client_secret;
  } catch (error) {
    console.error('❌ Setup intent creation failed:', error);
    throw error;
  }
};

// Get payment methods for a customer
export const getPaymentMethods = async (customerId: string) => {
  try {
    if (shouldUseMockBackend()) {
      console.log('🔄 Using mock backend for payment methods');
      const response = await mockStripeBackend.getPaymentMethods(customerId);
      return response.data;
    }

    // Real backend call
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/payment-methods/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get payment methods');
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Get payment methods failed:', error);
    throw error;
  }
};

// Create charging session
export const createChargingSession = async (sessionData: {
  customerId: string;
  stationId: string;
  paymentMethodId?: string;
  estimatedAmount: number;
}) => {
  try {
    if (shouldUseMockBackend()) {
      console.log('🔄 Using mock backend for charging session');
      const response = await mockStripeBackend.createChargingSession(sessionData);
      return response.session;
    }

    // Real backend call
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/charging-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });

    if (!response.ok) {
      throw new Error('Failed to create charging session');
    }

    const { session } = await response.json();
    return session;
  } catch (error) {
    console.error('❌ Charging session creation failed:', error);
    throw error;
  }
};

export { STRIPE_PUBLISHABLE_KEY };
