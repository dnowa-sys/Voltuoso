// src/services/stripeMockBackend.ts
// DEVELOPMENT ONLY - Mock backend responses for Stripe API calls
// Replace these with actual backend calls in production

export const mockStripeBackend = {
  // Mock create payment intent
  createPaymentIntent: async (amount: number, currency: string = 'usd') => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      client_secret: `pi_mock_${Date.now()}_secret_mock_key`,
      amount: amount * 100,
      currency,
      status: 'requires_payment_method',
    };
  },

  // Mock create customer
  createCustomer: async (email: string, userId: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      customer: {
        id: `cus_mock_${userId.substring(0, 8)}`,
        email,
        created: Date.now(),
        metadata: {
          userId,
        },
      },
    };
  },

  // Mock create setup intent
  createSetupIntent: async (customerId: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      client_secret: `seti_mock_${Date.now()}_secret_mock_key`,
      customer: customerId,
      usage: 'off_session',
    };
  },

  // Mock get payment methods
  getPaymentMethods: async (customerId: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      data: [
        {
          id: 'pm_mock_1234',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          },
          customer: customerId,
        },
        {
          id: 'pm_mock_5678',
          type: 'card',
          card: {
            brand: 'mastercard',
            last4: '8888',
            exp_month: 8,
            exp_year: 2026,
          },
          customer: customerId,
        },
      ],
    };
  },

  // Mock charging session creation
  createChargingSession: async (sessionData: {
    customerId: string;
    stationId: string;
    paymentMethodId?: string;
    estimatedAmount: number;
  }) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      session: {
        id: `cs_${Date.now()}`,
        customerId: sessionData.customerId,
        stationId: sessionData.stationId,
        status: 'active',
        startTime: new Date().toISOString(),
        estimatedAmount: sessionData.estimatedAmount,
        actualAmount: 0,
        energyDelivered: 0,
        paymentStatus: 'authorized',
      },
    };
  },

  // Mock charging session update
  updateChargingSession: async (sessionId: string, updates: {
    energyDelivered?: number;
    actualAmount?: number;
    status?: string;
  }) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      session: {
        id: sessionId,
        ...updates,
        lastUpdated: new Date().toISOString(),
      },
    };
  },
};

// Helper to check if we should use mock backend
export const shouldUseMockBackend = () => {
  // Use mock backend if API base URL contains 'localhost' or if in development
  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  return !apiUrl || apiUrl.includes('localhost') || __DEV__;
};