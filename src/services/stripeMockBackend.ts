// src/services/stripeMockBackend.ts - COMPLETE FIXED VERSION
// Mock backend for Stripe operations during development

export const shouldUseMockBackend = (): boolean => {
  // Use mock backend if no API URL is configured or if explicitly enabled
  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const forceMock = process.env.EXPO_PUBLIC_USE_MOCK_STRIPE === 'true';
  
  return !apiUrl || forceMock || __DEV__;
};

export const mockStripeBackend = {
  async createPaymentIntent(amount: number, currency: string = 'usd') {
    console.log('🔄 Mock: Creating payment intent for', amount, currency);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      payment_intent: {
        id: `pi_mock_${Date.now()}`,
        amount: amount * 100, // Convert to cents
        currency,
        status: 'requires_payment_method',
      },
    };
  },

  async createCustomer(email: string, userId: string) {
    console.log('🔄 Mock: Creating customer for', email);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      customer: {
        id: `cus_mock_${userId}`,
        email,
        created: Math.floor(Date.now() / 1000),
        default_source: null,
        metadata: {
          userId,
        },
      },
    };
  },

  async createSetupIntent(customerId: string) {
    console.log('🔄 Mock: Creating setup intent for customer', customerId);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      client_secret: `seti_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      setup_intent: {
        id: `seti_mock_${Date.now()}`,
        customer: customerId,
        status: 'requires_payment_method',
      },
    };
  },

  async createEphemeralKey(customerId: string) {
    console.log('🔄 Mock: Creating ephemeral key for customer', customerId);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Return the ephemeral key in the correct format that Stripe expects
    return {
      secret: `ek_test_YWNjdF8xTmZEa1lMbkl1dEFfek1CTU1xYUhhS1VENEY1_${Math.random().toString(36).substr(2, 20)}`,
      ephemeral_key: {
        id: `ek_mock_${Date.now()}`,
        object: 'ephemeral_key',
        associated_objects: [{
          type: 'customer',
          id: customerId,
        }],
        created: Math.floor(Date.now() / 1000),
        expires: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      },
    };
  },

  async getPaymentMethods(customerId: string) {
    console.log('🔄 Mock: Getting payment methods for customer', customerId);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      data: [
        {
          id: 'pm_mock_visa_4242',
          object: 'payment_method',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
            funding: 'credit',
            country: 'US',
          },
          customer: customerId,
          created: Math.floor(Date.now() / 1000),
        },
        {
          id: 'pm_mock_mastercard_5555',
          object: 'payment_method',
          type: 'card',
          card: {
            brand: 'mastercard',
            last4: '5555',
            exp_month: 8,
            exp_year: 2026,
            funding: 'debit',
            country: 'US',
          },
          customer: customerId,
          created: Math.floor(Date.now() / 1000) - 86400,
        },
      ],
    };
  },

  async createChargingSession(sessionData: {
    customerId: string;
    stationId: string;
    paymentMethodId?: string;
    estimatedAmount: number;
  }) {
    console.log('🔄 Mock: Creating charging session', sessionData);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      session: {
        id: `cs_mock_${Date.now()}`,
        customerId: sessionData.customerId,
        stationId: sessionData.stationId,
        paymentMethodId: sessionData.paymentMethodId || 'pm_mock_visa_4242',
        estimatedAmount: sessionData.estimatedAmount,
        status: 'authorized',
        paymentIntentId: `pi_mock_${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
    };
  },

  async capturePayment(paymentIntentId: string, amount: number) {
    console.log('🔄 Mock: Capturing payment', paymentIntentId, amount);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate occasional failures for testing
    const shouldFail = Math.random() < 0.1; // 10% failure rate
    
    if (shouldFail) {
      throw new Error('Mock payment capture failed - insufficient funds');
    }
    
    return {
      success: true,
      payment_intent: {
        id: paymentIntentId,
        amount: amount * 100,
        status: 'succeeded',
        captured_at: Math.floor(Date.now() / 1000),
      },
    };
  },

  async cancelPaymentIntent(paymentIntentId: string) {
    console.log('🔄 Mock: Cancelling payment intent', paymentIntentId);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      payment_intent: {
        id: paymentIntentId,
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000),
      },
    };
  },

  async refundPayment(paymentIntentId: string, amount?: number) {
    console.log('🔄 Mock: Refunding payment', paymentIntentId, amount);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      refund: {
        id: `re_mock_${Date.now()}`,
        payment_intent: paymentIntentId,
        amount: amount ? amount * 100 : undefined,
        status: 'succeeded',
        created: Math.floor(Date.now() / 1000),
      },
    };
  },

  // Simulate webhook events for testing
  async simulateWebhook(eventType: string, data: any) {
    console.log('🔄 Mock: Simulating webhook', eventType, data);
    
    const webhookEvent = {
      id: `evt_mock_${Date.now()}`,
      object: 'event',
      type: eventType,
      data: {
        object: data,
      },
      created: Math.floor(Date.now() / 1000),
    };
    
    // In a real app, this would be sent to your webhook endpoint
    console.log('📨 Mock webhook event:', webhookEvent);
    
    return webhookEvent;
  },
};