// src/services/paymentService.ts
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

// Firebase Cloud Functions
const createPaymentIntentFn = httpsCallable(functions, 'createPaymentIntent');
const createCustomerFn = httpsCallable(functions, 'createStripeCustomer');
const getPaymentMethodsFn = httpsCallable(functions, 'getCustomerPaymentMethods');
const savePaymentMethodFn = httpsCallable(functions, 'savePaymentMethod');
const capturePaymentFn = httpsCallable(functions, 'capturePayment');
const cancelPaymentIntentFn = httpsCallable(functions, 'cancelPaymentIntent');
const sendReceiptFn = httpsCallable(functions, 'sendReceipt');

export const paymentService = {
  // Create a Stripe PaymentIntent
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerId: string;
    stationId: string;
    metadata?: Record<string, string>;
  }): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      const result = await createPaymentIntentFn(params);
      const data = result.data as any;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment intent');
      }
      
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Get customer's saved payment methods
  async getCustomerPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const result = await getPaymentMethodsFn({ customerId: userId });
      const data = result.data as any;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get payment methods');
      }
      
      return data.paymentMethods.map((pm: any) => ({
        id: pm.id,
        type: pm.type,
        card: {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        },
        isDefault: pm.metadata?.is_default === 'true',
      }));
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  },

  // Save a payment method to customer
  async savePaymentMethod(params: {
    customerId: string;
    paymentMethodId: string;
    setAsDefault?: boolean;
  }): Promise<boolean> {
    try {
      const result = await savePaymentMethodFn(params);
      const data = result.data as any;
      
      return data.success;
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw error;
    }
  },

  // Create a charging session
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
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating charging session:', error);
      throw error;
    }
  },

  // Update charging session
  async updateChargingSession(
    sessionId: string, 
    updates: Partial<ChargingSession>
  ): Promise<void> {
    try {
      const sessionRef = doc(db, 'charging_sessions', sessionId);
      
      const updateData = {
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
    } catch (error) {
      console.error('Error updating charging session:', error);
      throw error;
    }
  },

  // Subscribe to charging session updates
  subscribeToChargingSession(
    sessionId: string, 
    callback: (session: ChargingSession | null) => void
  ): () => void {
    const sessionRef = doc(db, 'charging_sessions', sessionId);
    
    return onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const session: ChargingSession = {
          id: doc.id,
          ...data,
          // Convert Timestamps back to Dates
          createdAt: data.createdAt?.toDate(),
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          lastHeartbeat: data.lastHeartbeat?.toDate(),
        } as ChargingSession;
        
        callback(session);
      } else {
        callback(null);
      }
    });
  },

  // Capture payment (when charging is complete)
  async capturePayment(paymentIntentId: string, amount: number): Promise<boolean> {
    try {
      const result = await capturePaymentFn({ 
        paymentIntentId, 
        amount 
      });
      const data = result.data as any;
      
      return data.success;
    } catch (error) {
      console.error('Error capturing payment:', error);
      return false;
    }
  },

  // Cancel payment intent
  async cancelPaymentIntent(paymentIntentId: string): Promise<boolean> {
    try {
      const result = await cancelPaymentIntentFn({ paymentIntentId });
      const data = result.data as any;
      
      return data.success;
    } catch (error) {
      console.error('Error canceling payment intent:', error);
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
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  },

  // Send receipt email
  async sendReceipt(transactionId: string): Promise<boolean> {
    try {
      const result = await sendReceiptFn({ transactionId });
      const data = result.data as any;
      
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
      console.error('Error sending receipt:', error);
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
          createdAt: data.createdAt?.toDate(),
          sessionStartTime: data.sessionStartTime?.toDate(),
          sessionEndTime: data.sessionEndTime?.toDate(),
          receiptSentAt: data.receiptSentAt?.toDate(),
          refundedAt: data.refundedAt?.toDate(),
        } as Transaction);
      });
      
      return transactions;
    } catch (error) {
      console.error('Error getting user transactions:', error);
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
    } catch (error) {
      console.error('Error updating station availability:', error);
      // Don't throw - this is not critical for payment flow
    }
  },

  // Get station owner transactions (for dashboard)
  async getStationTransactions(stationOwnerId: string): Promise<Transaction[]> {
    try {
      // First get stations owned by this user
      const stationsQuery = query(
        collection(db, 'stations'),
        where('ownerId', '==', stationOwnerId)
      );
      
      const stationsSnapshot = await getDocs(stationsQuery);
      const stationIds = stationsSnapshot.docs.map(doc => doc.id);
      
      if (stationIds.length === 0) {
        return [];
      }
      
      // Get transactions for these stations
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('stationId', 'in', stationIds),
        orderBy('createdAt', 'desc')
      );
      
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions: Transaction[] = [];
      
      transactionsSnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          sessionStartTime: data.sessionStartTime?.toDate(),
          sessionEndTime: data.sessionEndTime?.toDate(),
          receiptSentAt: data.receiptSentAt?.toDate(),
          refundedAt: data.refundedAt?.toDate(),
        } as Transaction);
      });
      
      return transactions;
    } catch (error) {
      console.error('Error getting station transactions:', error);
      return [];
    }
  },
};