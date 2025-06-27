// src/services/paymentService.ts - Simplified for Expo with Web Firebase SDK
import Constants from "expo-constants";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import { ChargingSession, PaymentMethod, Transaction } from '../types/payment';

const API_BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL;

export const initiatePayment = async (sessionId: string) => {
  const response = await fetch(`${API_BASE_URL}/start-payment/${sessionId}`);
  return await response.json();
};


// Define the expected response types for Firebase Functions
interface FunctionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const paymentService = {
  // Create a Stripe PaymentIntent via Firebase Function
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerId: string;
    stationId: string;
    metadata?: Record<string, string>;
  }): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      const createPaymentIntentFn = httpsCallable(functions, 'createPaymentIntent');
      const result = await createPaymentIntentFn(params);
      const data = result.data as FunctionResponse;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment intent');
      }
      
      return {
        clientSecret: data.data.clientSecret,
        paymentIntentId: data.data.paymentIntentId,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      
      // Fallback: Create a mock payment intent for development
      if (__DEV__) {
        console.warn('🔄 Using mock payment intent for development');
        return {
          clientSecret: 'pi_mock_client_secret',
          paymentIntentId: 'pi_mock_' + Date.now(),
        };
      }
      
      throw error;
    }
  },

  // Get customer's saved payment methods
  async getCustomerPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const getPaymentMethodsFn = httpsCallable(functions, 'getCustomerPaymentMethods');
      const result = await getPaymentMethodsFn({ customerId: userId });
      const data = result.data as FunctionResponse;
      
      if (!data.success) {
        console.warn('Failed to get payment methods:', data.error);
        return [];
      }
      
      return data.data.paymentMethods || [];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      
      // Return mock data for development
      if (__DEV__) {
        return [
          {
            id: 'pm_mock_1',
            type: 'card',
            card: {
              brand: 'visa',
              last4: '4242',
              expMonth: 12,
              expYear: 2025,
            },
            isDefault: true,
          },
        ];
      }
      
      return [];
    }
  },

  // Create a charging session in Firestore
  async createChargingSession(sessionData: {
    userId: string;
    stationId: string;
    transactionId: string;
    paymentIntentId: string;
    status: 'authorized' | 'active' | 'completed' | 'cancelled';
    authorizedAmount: number;
    energyDelivered: number;
    hardwareStatus: string;
  }): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'charging_sessions'), {
        ...sessionData,
        createdAt: Timestamp.now(),
        lastHeartbeat: Timestamp.now(),
      });
      
      console.log('✅ Created charging session:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating charging session:', error);
      throw new Error('Failed to create charging session');
    }
  },

  // Update charging session
  async updateChargingSession(
    sessionId: string, 
    updates: Partial<ChargingSession>
  ): Promise<void> {
    try {
      const sessionRef = doc(db, 'charging_sessions', sessionId);
      
      const updateData: any = {
        ...updates,
        lastHeartbeat: Timestamp.now(),
      };
      
      // Convert Date objects to Timestamps
      if (updates.startTime) {
        updateData.startTime = Timestamp.fromDate(updates.startTime);
      }
      if (updates.endTime) {
        updateData.endTime = Timestamp.fromDate(updates.endTime);
      }
      
      await updateDoc(sessionRef, updateData);
      console.log('✅ Updated charging session:', sessionId);
    } catch (error) {
      console.error('❌ Error updating charging session:', error);
      throw new Error('Failed to update charging session');
    }
  },

  // Subscribe to charging session updates
  subscribeToChargingSession(
    sessionId: string, 
    callback: (session: ChargingSession | null) => void
  ): () => void {
    const sessionRef = doc(db, 'charging_sessions', sessionId);
    
    return onSnapshot(
      sessionRef, 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const session: ChargingSession = {
            id: doc.id,
            ...data,
            // Convert Timestamps back to Dates
            createdAt: data.createdAt?.toDate() || new Date(),
            startTime: data.startTime?.toDate(),
            endTime: data.endTime?.toDate(),
            lastHeartbeat: data.lastHeartbeat?.toDate() || new Date(),
          } as ChargingSession;
          
          callback(session);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('❌ Error in session subscription:', error);
        callback(null);
      }
    );
  },

  // Capture payment when charging is complete
  async capturePayment(paymentIntentId: string, amount: number): Promise<boolean> {
    try {
      const capturePaymentFn = httpsCallable(functions, 'capturePayment');
      const result = await capturePaymentFn({ 
        paymentIntentId, 
        amount 
      });
      const data = result.data as FunctionResponse;
      
      console.log('💳 Payment capture result:', data);
      return data.success;
    } catch (error) {
      console.error('❌ Error capturing payment:', error);
      
      // Mock success for development
      if (__DEV__) {
        console.warn('🔄 Mocking payment capture for development');
        return true;
      }
      
      return false;
    }
  },

  // Cancel payment intent
  async cancelPaymentIntent(paymentIntentId: string): Promise<boolean> {
    try {
      const cancelPaymentIntentFn = httpsCallable(functions, 'cancelPaymentIntent');
      const result = await cancelPaymentIntentFn({ paymentIntentId });
      const data = result.data as FunctionResponse;
      
      return data.success;
    } catch (error) {
      console.error('❌ Error canceling payment intent:', error);
      
      // Mock success for development
      if (__DEV__) {
        console.warn('🔄 Mocking payment cancellation for development');
        return true;
      }
      
      return false;
    }
  },

  // Save transaction record
  async saveTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        createdAt: Timestamp.now(),
        // Convert Date objects to Timestamps
        sessionStartTime: transactionData.sessionStartTime ? 
          Timestamp.fromDate(transactionData.sessionStartTime) : null,
        sessionEndTime: transactionData.sessionEndTime ? 
          Timestamp.fromDate(transactionData.sessionEndTime) : null,
      });
      
      console.log('✅ Saved transaction:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error saving transaction:', error);
      throw new Error('Failed to save transaction');
    }
  },

  // Send receipt email
  async sendReceipt(transactionId: string): Promise<boolean> {
    try {
      const sendReceiptFn = httpsCallable(functions, 'sendReceipt');
      const result = await sendReceiptFn({ transactionId });
      const data = result.data as FunctionResponse;
      
      // Update transaction to mark receipt as sent
      if (data.success) {
        const transactionRef = doc(db, 'transactions', transactionId);
        await updateDoc(transactionRef, {
          receiptSent: true,
          receiptSentAt: Timestamp.now(),
        });
      }
      
      return data.success;
    } catch (error) {
      console.error('❌ Error sending receipt:', error);
      
      // Mock success for development
      if (__DEV__) {
        console.warn('🔄 Mocking receipt send for development');
        return true;
      }
      
      return false;
    }
  },

  // Get user transactions
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          // Convert Timestamps back to Dates
          createdAt: data.createdAt?.toDate() || new Date(),
          sessionStartTime: data.sessionStartTime?.toDate(),
          sessionEndTime: data.sessionEndTime?.toDate(),
          receiptSentAt: data.receiptSentAt?.toDate(),
          refundedAt: data.refundedAt?.toDate(),
        } as Transaction);
      });
      
      return transactions;
    } catch (error) {
      console.error('❌ Error getting user transactions:', error);
      return [];
    }
  },

  // Update station availability
  async updateStationAvailability(
    stationId: string, 
    status: 'available' | 'in_use' | 'offline'
  ): Promise<void> {
    try {
      const stationRef = doc(db, 'stations', stationId);
      await updateDoc(stationRef, {
        status,
        lastUpdated: Timestamp.now(),
      });
      console.log('✅ Updated station availability:', stationId, status);
    } catch (error) {
      console.error('⚠️ Error updating station availability:', error);
      // Don't throw - this is not critical for payment flow
    }
  },

  // Development helper: Check if Firebase Functions are deployed
  async checkFunctionsAvailability(): Promise<boolean> {
    try {
      const testFn = httpsCallable(functions, 'ping');
      await testFn();
      return true;
    } catch (error) {
      console.warn('⚠️ Firebase Functions not available:', error);
      return false;
    }
  },
};