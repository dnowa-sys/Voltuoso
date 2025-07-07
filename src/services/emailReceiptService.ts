// src/services/emailReceiptService.ts
import { Alert } from 'react-native';

export interface TransactionData {
  id: string;
  userId: string;
  userEmail: string;
  stationName: string;
  stationAddress: string;
  amount: number;
  energyDelivered: number;
  sessionDuration: string;
  paymentMethod: string;
  sessionStartTime: Date;
  sessionEndTime: Date;
  status: 'completed' | 'refunded' | 'pending';
}

class EmailReceiptService {
  private static instance: EmailReceiptService;

  public static getInstance(): EmailReceiptService {
    if (!EmailReceiptService.instance) {
      EmailReceiptService.instance = new EmailReceiptService();
    }
    return EmailReceiptService.instance;
  }

  /**
   * Generate receipt text content
   */
  generateReceiptText(transaction: TransactionData): string {
    const receiptDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
VOLTUOSO CHARGING RECEIPT
========================

Receipt #: ${transaction.id}
Date: ${receiptDate}

CUSTOMER INFORMATION
-------------------
Email: ${transaction.userEmail}

SESSION DETAILS
--------------
Station: ${transaction.stationName}
Address: ${transaction.stationAddress}
Start Time: ${transaction.sessionStartTime.toLocaleString()}
End Time: ${transaction.sessionEndTime.toLocaleString()}
Duration: ${transaction.sessionDuration}

CHARGING SUMMARY
---------------
Energy Delivered: ${transaction.energyDelivered} kWh
Total Amount: $${transaction.amount.toFixed(2)}
Payment Method: ${transaction.paymentMethod}
Status: ${transaction.status.toUpperCase()}

Thank you for choosing Voltuoso!
For support, contact: support@voltuoso.com

This is an automated receipt.
    `.trim();
  }

  /**
   * Send receipt via email (mock implementation)
   */
  async sendViaEmail(transaction: TransactionData, receiptContent: string): Promise<boolean> {
    try {
      // In a real app, this would call your backend API to send email
      console.log('📧 Sending receipt email to:', transaction.userEmail);
      console.log('📧 Receipt content:', receiptContent);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate 90% success rate
      const success = Math.random() > 0.1;
      
      if (success) {
        console.log('✅ Receipt email sent successfully');
        return true;
      } else {
        throw new Error('Email service temporarily unavailable');
      }
    } catch (error) {
      console.error('❌ Failed to send receipt email:', error);
      return false;
    }
  }

  /**
   * Save transaction and send receipt
   */
  async saveTransactionWithReceipt(transaction: TransactionData): Promise<void> {
    try {
      // 1. Save transaction to database (mock)
      await this.saveTransaction(transaction);
      
      // 2. Generate and send receipt
      const receiptContent = this.generateReceiptText(transaction);
      const emailSent = await this.sendViaEmail(transaction, receiptContent);
      
      if (emailSent) {
        Alert.alert(
          'Receipt Sent! 📧',
          `Your receipt has been sent to ${transaction.userEmail}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Receipt Error',
          'Transaction saved but receipt email failed. You can resend it from your transaction history.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Transaction save error:', error);
      throw error;
    }
  }

  /**
   * Save transaction to database (mock)
   */
  private async saveTransaction(transaction: TransactionData): Promise<void> {
    try {
      console.log('💾 Saving transaction to database:', transaction.id);
      
      // Simulate database save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would save to Firebase/your backend
      const savedTransaction = {
        ...transaction,
        savedAt: new Date(),
      };
      
      console.log('✅ Transaction saved:', savedTransaction.id);
    } catch (error) {
      console.error('❌ Database save failed:', error);
      throw new Error('Failed to save transaction');
    }
  }

  /**
   * Resend receipt for existing transaction
   */
  async resendReceipt(transactionId: string, userEmail: string): Promise<void> {
    try {
      // In a real app, fetch transaction from database
      const mockTransaction: TransactionData = {
        id: transactionId,
        userId: 'user_123',
        userEmail: userEmail,
        stationName: 'Voltuoso Station',
        stationAddress: '123 Charging Way',
        amount: 15.50,
        energyDelivered: 18.2,
        sessionDuration: '45m',
        paymentMethod: 'VISA ••••4242',
        sessionStartTime: new Date(Date.now() - 2700000), // 45 min ago
        sessionEndTime: new Date(),
        status: 'completed',
      };

      const receiptContent = this.generateReceiptText(mockTransaction);
      const emailSent = await this.sendViaEmail(mockTransaction, receiptContent);
      
      if (emailSent) {
        Alert.alert(
          'Receipt Resent! 📧',
          `Receipt has been resent to ${userEmail}`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Failed to resend receipt');
      }
    } catch (error) {
      console.error('Resend receipt error:', error);
      Alert.alert(
        'Resend Failed',
        'Unable to resend receipt. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Generate PDF receipt (future enhancement)
   */
  async generatePDFReceipt(transaction: TransactionData): Promise<string | null> {
    try {
      // This would integrate with a PDF generation service
      console.log('📄 Generating PDF receipt for:', transaction.id);
      
      // Mock PDF URL
      const pdfUrl = `https://receipts.voltuoso.com/${transaction.id}.pdf`;
      return pdfUrl;
    } catch (error) {
      console.error('PDF generation error:', error);
      return null;
    }
  }

  /**
   * Format currency amount
   */
  private formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  /**
   * Format date for receipt
   */
  private formatReceiptDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

// Export singleton instance
export const emailReceiptService = EmailReceiptService.getInstance();