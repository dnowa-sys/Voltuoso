// src/services/paymentService.ts
import { 
  useStripe, 
  useConfirmPayment, 
  useConfirmSetupIntent,
  PaymentSheet,
  initPaymentSheet,
  presentPaymentSheet
} from '@stripe/stripe-react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import { firebaseService } from './firebaseService';
import { Transaction, PaymentMethod, ChargingSession } from '../types/payment';

class PaymentService {
  
  // Create payment intent for charging session
  async createPaymentIntent(stationId: string, amount: number): Promise<string> {
    try {
      const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
      const result = await createPaymentIntent({
        stationId,
        amount, // in cents
        currency: 'usd',
      });
      
      const data = result.data as any;
      return data.clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Save payment method for future use
  async savePaymentMethod(userId: string): Promise<PaymentMethod | null> {
    try {
      const { confirmSetupIntent } = useConfirmSetupIntent();
      
      // Create setup intent on backend
      const createSetupIntent = httpsCallable(functions, 'createSetupIntent');
      const result = await createSetupIntent({ userId });
      const data = result.data as any;
      const { clientSecret } = data;

      // Confirm setup intent
      const { setupIntent, error } = await confirmSetupIntent(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        throw new Error(error.message);
      }

      if (setupIntent?.paymentMethodId) {
        // Get payment method details from Stripe
        const getPaymentMethod = httpsCallable(functions, 'getPaymentMethod');
        const pmResult = await getPaymentMethod({ paymentMethodId: setupIntent.paymentMethodId });
        const pmData = pmResult.data as any;

        // Save payment method to Firestore
        const paymentMethodId = await firebaseService.savePaymentMethod({
          userId,
          stripePaymentMethodId: setupIntent.paymentMethodId,
          type: 'card',
          card: {
            brand: pmData.card.brand,
            last4: pmData.card.last4,
            expMonth: pmData.card.exp_month,
            expYear: pmData.card.exp_year,
          },
          isDefault: false,
        });

        return {
          id: paymentMethodId,
          userId,
          stripePaymentMethodId: setupIntent.paymentMethodId,
          type: 'card',
          card: {
            brand: pmData.card.brand,
            last4: pmData.card.last4,
            expMonth: pmData.card.exp_month,
            expYear: pmData.card.exp_year,
          },
          isDefault: false,
        };
      }

      return null;
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw new Error('Failed to save payment method');
    }
  }

  // Process one-time payment
  async processPayment(
    clientSecret: string, 
    paymentMethodId?: string
  ): Promise<{ success: boolean; paymentIntentId?: string }> {
    try {
      const { confirmPayment } = useConfirmPayment();

      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodId,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: paymentIntent?.status === 'succeeded',
        paymentIntentId: paymentIntent?.id,
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false };
    }
  }

  // Get user's saved payment methods
  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      return await firebaseService.getUserPaymentMethods(userId);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  // Save transaction record
  async saveTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> {
    try {
      return await firebaseService.createTransaction(transaction);
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw new Error('Failed to save transaction');
    }
  }

  // Get user's transaction history
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      return await firebaseService.getUserTransactions(userId);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  // Get station owner's transactions
  async getStationTransactions(stationOwnerId: string): Promise<Transaction[]> {
    try {
      return await firebaseService.getStationTransactions(stationOwnerId);
    } catch (error) {
      console.error('Error fetching station transactions:', error);
      return [];
    }
  }

  // Send receipt email
  async sendReceipt(transactionId: string): Promise<boolean> {
    try {
      const sendReceiptEmail = httpsCallable(functions, 'sendReceiptEmail');
      await sendReceiptEmail({ transactionId });

      // Update transaction to mark receipt as sent
      await firebaseService.updateTransaction(transactionId, {
        receiptSent: true,
      });

      return true;
    } catch (error) {
      console.error('Error sending receipt:', error);
      return false;
    }
  }

  // Refund transaction
  async refundPayment(transactionId: string): Promise<boolean> {
    try {
      const refundPayment = httpsCallable(functions, 'refundPayment');
      await refundPayment({ transactionId });

      // Update transaction status
      await firebaseService.updateTransaction(transactionId, {
        status: 'refunded',
        refundedAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }

  // Charging Session Management
  async createChargingSession(session: Omit<ChargingSession, 'id' | 'createdAt'>): Promise<string> {
    try {
      return await firebaseService.createChargingSession(session);
    } catch (error) {
      console.error('Error creating charging session:', error);
      throw new Error('Failed to create charging session');
    }
  }

  async updateChargingSession(sessionId: string, updates: Partial<ChargingSession>): Promise<void> {
    try {
      await firebaseService.updateChargingSession(sessionId, updates);
    } catch (error) {
      console.error('Error updating charging session:', error);
      throw new Error('Failed to update charging session');
    }
  }

  async getChargingSession(sessionId: string): Promise<ChargingSession | null> {
    try {
      return await firebaseService.getChargingSession(sessionId);
    } catch (error) {
      console.error('Error getting charging session:', error);
      return null;
    }
  }

  // Real-time subscriptions
  subscribeToChargingSession(
    sessionId: string,
    callback: (session: ChargingSession | null) => void
  ): () => void {
    return firebaseService.subscribeToChargingSession(sessionId, callback);
  }

  subscribeToUserTransactions(
    userId: string,
    callback: (transactions: Transaction[]) => void
  ): () => void {
    return firebaseService.subscribeToUserTransactions(userId, callback);
  }

  // Station Management
  async getStation(stationId: string) {
    try {
      return await firebaseService.getStation(stationId);
    } catch (error) {
      console.error('Error getting station:', error);
      return null;
    }
  }

  async updateStationAvailability(stationId: string, availability: 'available' | 'in_use' | 'offline' | 'maintenance') {
    try {
      await firebaseService.updateStationAvailability(stationId, availability);
    } catch (error) {
      console.error('Error updating station availability:', error);
      throw new Error('Failed to update station availability');
    }
  }

  // User Statistics
  async getUserStats(userId: string) {
    try {
      return await firebaseService.getUserStats(userId);
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalSpent: 0,
        totalEnergy: 0,
        totalSessions: 0,
        averageSessionCost: 0,
      };
    }
  }

  // Payment method management
  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    try {
      await firebaseService.setDefaultPaymentMethod(userId, paymentMethodId);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw new Error('Failed to set default payment method');
    }
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      // First get the payment method to get Stripe ID
      const paymentMethod = await firebaseService.getUserPaymentMethods(''); // We'll need userId here
      
      // Delete from Stripe
      const deleteStripePaymentMethod = httpsCallable(functions, 'deletePaymentMethod');
      await deleteStripePaymentMethod({ paymentMethodId });

      // Delete from Firestore
      await firebaseService.deletePaymentMethod(paymentMethodId);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw new Error('Failed to delete payment method');
    }
  }

  // Authorization and Capture for EV Charging
  async authorizePayment(stationId: string, amount: number): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    try {
      const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
      const result = await createPaymentIntent({
        stationId,
        amount,
        currency: 'usd',
        captureMethod: 'manual', // For authorization only
      });
      
      const data = result.data as any;
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
      };
    } catch (error) {
      console.error('Error authorizing payment:', error);
      throw new Error('Failed to authorize payment');
    }
  }

  async capturePayment(paymentIntentId: string, finalAmount: number): Promise<boolean> {
    try {
      const capturePayment = httpsCallable(functions, 'capturePayment');
      await capturePayment({
        paymentIntentId,
        amountToCapture: finalAmount,
      });
      
      return true;
    } catch (error) {
      console.error('Error capturing payment:', error);
      return false;
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<boolean> {
    try {
      const cancelPayment = htttsCallable(functions, 'cancelPaymentIntent');
      await cancelPayment({ paymentIntentId });
      
      return true;
    } catch (error) {
      console.error('Error canceling payment:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
export default PaymentService;data as any).clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Save payment method for future use
  async savePaymentMethod(userId: string): Promise<PaymentMethod | null> {
    try {
      const { confirmSetupIntent } = useConfirmSetupIntent();
      
      // Create setup intent on backend
      const createSetupIntent = httpsCallable(functions, 'createSetupIntent');
      const result = await createSetupIntent({ userId });
      const { clientSecret } = result.data as any;

      // Confirm setup intent
      const { setupIntent, error } = await confirmSetupIntent(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        throw new Error(error.message);
      }

      if (setupIntent?.paymentMethodId) {
        // Save payment method to Firestore
        const paymentMethodRef = await addDoc(collection(db, 'paymentMethods'), {
          userId,
          stripePaymentMethodId: setupIntent.paymentMethodId,
          isDefault: false,
          createdAt: new Date(),
        });

        return {
          id: paymentMethodRef.id,
          type: 'card',
          card: {
            brand: 'visa', // You'd get this from Stripe
            last4: '4242', // You'd get this from Stripe
            expMonth: 12,
            expYear: 2025,
          },
          isDefault: false,
        };
      }

      return null;
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw new Error('Failed to save payment method');
    }
  }

  // Process one-time payment
  async processPayment(
    clientSecret: string, 
    paymentMethodId?: string
  ): Promise<{ success: boolean; paymentIntentId?: string }> {
    try {
      const { confirmPayment } = useConfirmPayment();

      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodId,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: paymentIntent?.status === 'succeeded',
        paymentIntentId: paymentIntent?.id,
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false };
    }
  }

  // Get user's saved payment methods
  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const q = query(
        collection(db, 'paymentMethods'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const paymentMethods: PaymentMethod[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        paymentMethods.push({
          id: doc.id,
          type: 'card',
          card: {
            brand: data.brand || 'visa',
            last4: data.last4 || '****',
            expMonth: data.expMonth || 12,
            expYear: data.expYear || 2025,
          },
          isDefault: data.isDefault || false,
        });
      });

      return paymentMethods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  // Save transaction record
  async saveTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    try {
      const transactionRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        createdAt: new Date(),
      });

      return transactionRef.id;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw new Error('Failed to save transaction');
    }
  }

  // Get user's transaction history
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
          createdAt: data.createdAt.toDate(),
          sessionStartTime: data.sessionStartTime?.toDate(),
          sessionEndTime: data.sessionEndTime?.toDate(),
        } as Transaction);
      });

      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  // Get station owner's transactions
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
          createdAt: data.createdAt.toDate(),
          sessionStartTime: data.sessionStartTime?.toDate(),
          sessionEndTime: data.sessionEndTime?.toDate(),
        } as Transaction);
      });

      return transactions;
    } catch (error) {
      console.error('Error fetching station transactions:', error);
      return [];
    }
  }

  // Send receipt email
  async sendReceipt(transactionId: string): Promise<boolean> {
    try {
      const sendReceiptEmail = httpsCallable(functions, 'sendReceiptEmail');
      await sendReceiptEmail({ transactionId });

      // Update transaction to mark receipt as sent
      await updateDoc(doc(db, 'transactions', transactionId), {
        receiptSent: true,
      });

      return true;
    } catch (error) {
      console.error('Error sending receipt:', error);
      return false;
    }
  }

  // Refund transaction
  async refundPayment(transactionId: string): Promise<boolean> {
    try {
      const refundPayment = httpsCallable(functions, 'refundPayment');
      await refundPayment({ transactionId });

      // Update transaction status
      await updateDoc(doc(db, 'transactions', transactionId), {
        status: 'refunded',
      });

      return true;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
export default PaymentService;