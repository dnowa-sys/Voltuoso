// src/services/paymentService.ts
import {
    useConfirmPayment,
    useConfirmSetupIntent,
    useStripe
} from '@stripe/stripe-react-native';
import {
    addDoc,
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../config/firebase';
import { PaymentMethod, Transaction } from '../config/stripe';

class PaymentService {
  private stripe = useStripe();
  
  // Create payment intent for charging session
  async createPaymentIntent(stationId: string, estimatedAmount: number): Promise<string> {
    try {
      const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
      const result = await createPaymentIntent({
        stationId,
        amount: estimatedAmount, // in cents
        currency: 'usd',
      });
      
      return (result.data as any).clientSecret;
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