// src/services/firebaseService.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  ChargingSession,
  PaymentMethod,
  Station,
  Transaction,
  User,
} from '../types/payment';

class FirebaseService {
  // Collections
  private readonly USERS = 'users';
  private readonly TRANSACTIONS = 'transactions';
  private readonly PAYMENT_METHODS = 'paymentMethods';
  private readonly CHARGING_SESSIONS = 'chargingSessions';
  private readonly STATIONS = 'stations';

  // User Management
  async createUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, this.USERS, userId), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, this.USERS, userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate(),
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to get user');
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, this.USERS, userId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  // Transaction Management
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.TRANSACTIONS), {
        ...transaction,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction');
    }
  }

  async getTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      const transactionDoc = await getDoc(doc(db, this.TRANSACTIONS, transactionId));
      if (transactionDoc.exists()) {
        const data = transactionDoc.data();
        return {
          id: transactionDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          sessionStartTime: data.sessionStartTime?.toDate(),
          sessionEndTime: data.sessionEndTime?.toDate(),
          refundedAt: data.refundedAt?.toDate(),
        } as Transaction;
      }
      return null;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw new Error('Failed to get transaction');
    }
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, this.TRANSACTIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          sessionStartTime: data.sessionStartTime?.toDate(),
          sessionEndTime: data.sessionEndTime?.toDate(),
          refundedAt: data.refundedAt?.toDate(),
        } as Transaction;
      });
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw new Error('Failed to get user transactions');
    }
  }

  async getStationTransactions(stationOwnerId: string): Promise<Transaction[]> {
    try {
      // First get stations owned by this user
      const stationsQuery = query(
        collection(db, this.STATIONS),
        where('ownerId', '==', stationOwnerId)
      );
      
      const stationsSnapshot = await getDocs(stationsQuery);
      const stationIds = stationsSnapshot.docs.map(doc => doc.id);

      if (stationIds.length === 0) {
        return [];
      }

      // Get transactions for these stations
      const transactionsQuery = query(
        collection(db, this.TRANSACTIONS),
        where('stationId', 'in', stationIds),
        orderBy('createdAt', 'desc')
      );

      const transactionsSnapshot = await getDocs(transactionsQuery);
      return transactionsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          sessionStartTime: data.sessionStartTime?.toDate(),
          sessionEndTime: data.sessionEndTime?.toDate(),
          refundedAt: data.refundedAt?.toDate(),
        } as Transaction;
      });
    } catch (error) {
      console.error('Error getting station transactions:', error);
      throw new Error('Failed to get station transactions');
    }
  }

  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<void> {
    try {
      const updateData: any = { ...updates };
      
      // Convert Date objects to Firestore timestamps
      if (updates.sessionStartTime) {
        updateData.sessionStartTime = Timestamp.fromDate(updates.sessionStartTime);
      }
      if (updates.sessionEndTime) {
        updateData.sessionEndTime = Timestamp.fromDate(updates.sessionEndTime);
      }
      if (updates.refundedAt) {
        updateData.refundedAt = Timestamp.fromDate(updates.refundedAt);
      }

      await updateDoc(doc(db, this.TRANSACTIONS, transactionId), updateData);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw new Error('Failed to update transaction');
    }
  }

  // Payment Methods Management
  async savePaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.PAYMENT_METHODS), {
        ...paymentMethod,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw new Error('Failed to save payment method');
    }
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const q = query(
        collection(db, this.PAYMENT_METHODS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PaymentMethod[];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw new Error('Failed to get payment methods');
    }
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.PAYMENT_METHODS, paymentMethodId));
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw new Error('Failed to delete payment method');
    }
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    try {
      // First, remove default from all user's payment methods
      const userMethodsQuery = query(
        collection(db, this.PAYMENT_METHODS),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(userMethodsQuery);
      const batch = writeBatch(db);
      
      if (batch) {
        snapshot.docs.forEach(doc => {
          batch.update(doc.ref, { isDefault: false });
        });
        
        // Set the new default
        batch.update(doc(db, this.PAYMENT_METHODS, paymentMethodId), { isDefault: true });
        await batch.commit();
      } else {
        // Fallback if batch is not available
        for (const docSnap of snapshot.docs) {
          await updateDoc(docSnap.ref, { isDefault: false });
        }
        await updateDoc(doc(db, this.PAYMENT_METHODS, paymentMethodId), { isDefault: true });
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw new Error('Failed to set default payment method');
    }
  }

  // Charging Sessions Management
  async createChargingSession(session: Omit<ChargingSession, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.CHARGING_SESSIONS), {
        ...session,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating charging session:', error);
      throw new Error('Failed to create charging session');
    }
  }

  async getChargingSession(sessionId: string): Promise<ChargingSession | null> {
    try {
      const sessionDoc = await getDoc(doc(db, this.CHARGING_SESSIONS, sessionId));
      if (sessionDoc.exists()) {
        const data = sessionDoc.data();
        return {
          id: sessionDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          lastHeartbeat: data.lastHeartbeat?.toDate(),
        } as ChargingSession;
      }
      return null;
    } catch (error) {
      console.error('Error getting charging session:', error);
      throw new Error('Failed to get charging session');
    }
  }

  async updateChargingSession(sessionId: string, updates: Partial<ChargingSession>): Promise<void> {
    try {
      const updateData: any = { ...updates };
      
      // Convert Date objects to Firestore timestamps
      if (updates.startTime) {
        updateData.startTime = Timestamp.fromDate(updates.startTime);
      }
      if (updates.endTime) {
        updateData.endTime = Timestamp.fromDate(updates.endTime);
      }
      if (updates.lastHeartbeat) {
        updateData.lastHeartbeat = Timestamp.fromDate(updates.lastHeartbeat);
      }

      await updateDoc(doc(db, this.CHARGING_SESSIONS, sessionId), updateData);
    } catch (error) {
      console.error('Error updating charging session:', error);
      throw new Error('Failed to update charging session');
    }
  }

  async getUserActiveSessions(userId: string): Promise<ChargingSession[]> {
    try {
      const q = query(
        collection(db, this.CHARGING_SESSIONS),
        where('userId', '==', userId),
        where('status', 'in', ['authorized', 'active']),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          lastHeartbeat: data.lastHeartbeat?.toDate(),
        } as ChargingSession;
      });
    } catch (error) {
      console.error('Error getting active sessions:', error);
      throw new Error('Failed to get active sessions');
    }
  }

  // Stations Management
  async getStation(stationId: string): Promise<Station | null> {
    try {
      const stationDoc = await getDoc(doc(db, this.STATIONS, stationId));
      if (stationDoc.exists()) {
        const data = stationDoc.data();
        return {
          id: stationDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Station;
      }
      return null;
    } catch (error) {
      console.error('Error getting station:', error);
      throw new Error('Failed to get station');
    }
  }

  async getAllStations(): Promise<Station[]> {
    try {
      const q = query(
        collection(db, this.STATIONS),
        where('isActive', '==', true),
        orderBy('name')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Station;
      });
    } catch (error) {
      console.error('Error getting stations:', error);
      throw new Error('Failed to get stations');
    }
  }

  async updateStationAvailability(stationId: string, availability: Station['availability']): Promise<void> {
    try {
      await updateDoc(doc(db, this.STATIONS, stationId), {
        availability,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating station availability:', error);
      throw new Error('Failed to update station availability');
    }
  }

  // Real-time Listeners
  subscribeToChargingSession(
    sessionId: string,
    callback: (session: ChargingSession | null) => void
  ): () => void {
    return onSnapshot(
      doc(db, this.CHARGING_SESSIONS, sessionId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const session: ChargingSession = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            startTime: data.startTime?.toDate(),
            endTime: data.endTime?.toDate(),
            lastHeartbeat: data.lastHeartbeat?.toDate(),
          } as ChargingSession;
          callback(session);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error in charging session listener:', error);
        callback(null);
      }
    );
  }

  subscribeToUserTransactions(
    userId: string,
    callback: (transactions: Transaction[]) => void
  ): () => void {
    const q = query(
      collection(db, this.TRANSACTIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const transactions = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            sessionStartTime: data.sessionStartTime?.toDate(),
            sessionEndTime: data.sessionEndTime?.toDate(),
            refundedAt: data.refundedAt?.toDate(),
          } as Transaction;
        });
        callback(transactions);
      },
      (error) => {
        console.error('Error in transactions listener:', error);
        callback([]);
      }
    );
  }

  // Analytics and Reporting
  async getUserStats(userId: string): Promise<{
    totalSpent: number;
    totalEnergy: number;
    totalSessions: number;
    averageSessionCost: number;
  }> {
    try {
      const q = query(
        collection(db, this.TRANSACTIONS),
        where('userId', '==', userId),
        where('status', '==', 'succeeded')
      );

      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => doc.data() as Transaction);

      const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const totalEnergy = transactions.reduce((sum, tx) => sum + (tx.energyDelivered || 0), 0);
      const totalSessions = transactions.length;
      const averageSessionCost = totalSessions > 0 ? totalSpent / totalSessions : 0;

      return {
        totalSpent,
        totalEnergy,
        totalSessions,
        averageSessionCost,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to get user stats');
    }
  }
}

export const firebaseService = new FirebaseService();
export default FirebaseService;