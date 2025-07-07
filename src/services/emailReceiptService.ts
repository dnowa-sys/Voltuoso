// src/services/emailReceiptService.ts - COMPLETE EMAIL RECEIPT SERVICE
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { Alert, Linking } from 'react-native';
import { db } from '../config/firebase';

interface TransactionData {
  id: string;
  userId: string;
  userEmail: string;
  stationName: string;
  stationAddress: string;
  amount: number;
  energyDelivered: number;
  sessionDuration: string;
  paymentMethod: string;
  sessionStartTime?: Date;
  sessionEndTime?: Date;
  status: string;
}

interface ReceiptResult {
  sent: boolean;
  method: string;
}

// Email service that works without Cloud Functions
export const emailReceiptService = {
  // Save transaction and handle receipt
  async saveTransactionWithReceipt(transactionData: TransactionData) {
    try {
      console.log('💾 Saving transaction with receipt...', transactionData);
      
      // Save transaction to Firestore
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        createdAt: new Date(),
        receiptSent: false,
        receiptMethod: 'email_pending',
      });
      
      console.log('✅ Transaction saved:', docRef.id);
      
      // Generate receipt content
      const receiptContent = this.generateReceiptText(transactionData);
      
      // Handle receipt sending
      const receiptResult = await this.handleReceiptDelivery(transactionData, receiptContent);
      
      // Update transaction with receipt status
      await updateDoc(doc(db, 'transactions', docRef.id), {
        receiptSent: receiptResult.sent,
        receiptMethod: receiptResult.method,
        receiptSentAt: receiptResult.sent ? new Date() : null,
      });
      
      return {
        success: true,
        transactionId: docRef.id,
        receiptSent: receiptResult.sent,
        receiptMethod: receiptResult.method,
      };
      
    } catch (error) {
      console.error('❌ Error saving transaction:', error);
      throw error;
    }
  },

  // Generate receipt text content
  generateReceiptText(transaction: TransactionData): string {
    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
    const formatDate = (date?: Date) => {
      if (!date) return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return `
VOLTUOSO CHARGING RECEIPT
========================

Transaction ID: ${transaction.id}
Date: ${formatDate(transaction.sessionStartTime)}

STATION DETAILS
Station: ${transaction.stationName}
Address: ${transaction.stationAddress}

SESSION DETAILS  
Duration: ${transaction.sessionDuration}
Energy Delivered: ${transaction.energyDelivered} kWh
Payment Method: ${transaction.paymentMethod}

CHARGES
Total Amount: ${formatCurrency(transaction.amount)}
Status: ${transaction.status}

Thank you for choosing Voltuoso!
For support: support@voltuoso.com
App: voltuoso.com

This receipt was generated automatically.
Save this email for your records.
    `.trim();
  },

  // Handle receipt delivery with multiple options
  async handleReceiptDelivery(transaction: TransactionData, receiptContent: string): Promise<ReceiptResult> {
    return new Promise((resolve) => {
      Alert.alert(
        'Receipt Ready 📧',
        'How would you like to receive your receipt?',
        [
          {
            text: 'Email Receipt',
            onPress: async () => {
              await this.sendViaEmail(transaction, receiptContent);
              resolve({ sent: true, method: 'email_app' });
            },
          },
          {
            text: 'Save to App Only', 
            onPress: () => {
              Alert.alert('Receipt Saved', 'Your receipt has been saved to your transaction history.');
              resolve({ sent: true, method: 'app_only' });
            },
          },
          {
            text: 'Skip Receipt',
            style: 'cancel',
            onPress: () => {
              resolve({ sent: false, method: 'skipped' });
            },
          },
        ]
      );
    });
  },

  // Send receipt via device email app
  async sendViaEmail(transaction: TransactionData, receiptContent: string) {
    try {
      const subject = `Voltuoso Charging Receipt - ${transaction.stationName}`;
      const body = receiptContent;
      
      const emailUrl = `mailto:${transaction.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      const canOpen = await Linking.canOpenURL(emailUrl);
      
      if (canOpen) {
        await Linking.openURL(emailUrl);
        console.log('✅ Opened email app for receipt');
        Alert.alert(
          'Email Opened 📧',
          'Your email app has been opened with the receipt. Please send the email to complete the process.',
          [{ text: 'OK' }]
        );
      } else {
        // Fallback: show receipt content to copy
        Alert.alert(
          'Email Receipt',
          'Please copy this receipt and email it to yourself:\n\n' + receiptContent,
          [
            { text: 'Copy Text', onPress: () => {
              // Note: Clipboard copy would require expo-clipboard
              console.log('Receipt content ready to copy:', receiptContent);
            }},
            { text: 'OK' }
          ]
        );
      }
      
    } catch (error) {
      console.error('❌ Error opening email app:', error);
      Alert.alert(
        'Receipt Content',
        'Here is your receipt:\n\n' + receiptContent,
        [{ text: 'OK' }]
      );
    }
  },

  // Alternative: Send receipt via SMS (if user prefers)
  async sendViaSMS(transaction: TransactionData, receiptContent: string) {
    try {
      // This would require user's phone number
      const smsUrl = `sms:?body=${encodeURIComponent(receiptContent)}`;
      const canOpen = await Linking.canOpenURL(smsUrl);
      
      if (canOpen) {
        await Linking.openURL(smsUrl);
        Alert.alert('SMS Opened', 'Your messaging app has been opened with the receipt.');
      } else {
        Alert.alert('SMS Not Available', 'SMS is not available on this device.');
      }
    } catch (error) {
      console.error('SMS sending failed:', error);
      Alert.alert('SMS Error', 'Unable to open SMS app.');
    }
  },

  // Simple version that just saves to Firebase (no email prompt)
  async saveTransactionOnly(transactionData: TransactionData) {
    try {
      console.log('💾 Saving transaction only...', transactionData);
      
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        createdAt: new Date(),
        receiptSent: false,
        receiptMethod: 'app_only',
      });
      
      console.log('✅ Transaction saved:', docRef.id);
      
      return {
        success: true,
        transactionId: docRef.id,
        receiptSent: false,
        receiptMethod: 'app_only',
      };
      
    } catch (error) {
      console.error('❌ Error saving transaction:', error);
      throw error;
    }
  },

  // Manual receipt sending (for use in transaction history)
  async resendReceipt(transactionData: TransactionData) {
    try {
      const receiptContent = this.generateReceiptText(transactionData);
      await this.sendViaEmail(transactionData, receiptContent);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error resending receipt:', error);
      Alert.alert('Error', 'Failed to send receipt. Please try again.');
      return { success: false };
    }
  },

  // For future: Integration with third-party email services
  async sendViaEmailService(transaction: TransactionData, receiptContent: string) {
    // This is where you'd integrate with:
    // - EmailJS
    // - SendGrid 
    // - Mailgun
    // - Your own backend API
    
    console.log('📧 Would send via email service:', {
      to: transaction.userEmail,
      subject: `Voltuoso Receipt - ${transaction.stationName}`,
      content: receiptContent,
    });
    
    // Mock implementation
    Alert.alert(
      'Email Service',
      'In production, this would send via a professional email service.',
      [{ text: 'OK' }]
    );
    
    return { success: true, provider: 'future_email_service' };
  },

  // Validate transaction data before processing
  validateTransactionData(transaction: TransactionData): boolean {
    const required = ['id', 'userId', 'userEmail', 'stationName', 'amount'];
    
    for (const field of required) {
      if (!transaction[field as keyof TransactionData]) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }
    
    if (transaction.amount <= 0) {
      console.error('Invalid amount:', transaction.amount);
      return false;
    }
    
    if (!transaction.userEmail.includes('@')) {
      console.error('Invalid email:', transaction.userEmail);
      return false;
    }
    
    return true;
  },

  // Create a sample transaction for testing
  createSampleTransaction(userEmail: string): TransactionData {
    return {
      id: `txn_sample_${Date.now()}`,
      userId: 'user_sample',
      userEmail: userEmail,
      stationName: 'Voltuoso Bethesda',
      stationAddress: '9525 Starmont Rd, Bethesda, MD 20817',
      amount: 15.50,
      energyDelivered: 18.2,
      sessionDuration: '45m',
      paymentMethod: 'VISA ••••4242',
      sessionStartTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      sessionEndTime: new Date(),
      status: 'completed',
    };
  },
};