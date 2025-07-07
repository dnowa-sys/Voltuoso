// app/(app)/charging-complete.tsx - UPDATED WITH RECEIPT INTEGRATION
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { emailReceiptService, TransactionData } from '../../src/services/emailReceiptService';

export default function ChargingCompleteScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get session data from params
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    // Extract session data from route params
    const session = {
      id: params.sessionId as string || `session_${Date.now()}`,
      stationName: params.stationName as string || 'Voltuoso Station',
      stationAddress: params.stationAddress as string || 'Unknown Address',
      energyDelivered: parseFloat(params.energyDelivered as string) || 18.2,
      finalCost: parseFloat(params.finalCost as string) || 5.10,
      duration: params.duration as string || '45m',
      startTime: params.startTime ? new Date(params.startTime as string) : new Date(Date.now() - 2700000),
      endTime: new Date(),
      paymentMethod: 'VISA ••••4242',
    };
    
    setSessionData(session);
    
    // Auto-save transaction and send receipt
    handleTransactionSave(session);
  }, [params]);

  const handleTransactionSave = async (session: any) => {
    if (!user) return;

    const transactionData: TransactionData = {
      id: session.id,
      userId: user.id,
      userEmail: user.email,
      stationName: session.stationName,
      stationAddress: session.stationAddress,
      amount: session.finalCost,
      energyDelivered: session.energyDelivered,
      sessionDuration: session.duration,
      paymentMethod: session.paymentMethod,
      sessionStartTime: session.startTime,
      sessionEndTime: session.endTime,
      status: 'completed',
    };

    try {
      await emailReceiptService.saveTransactionWithReceipt(transactionData);
    } catch (error) {
      console.error('Failed to save transaction:', error);
      Alert.alert('Transaction Error', 'Failed to save transaction. Please contact support.');
    }
  };

  const handleGetReceipt = async () => {
    if (!sessionData || !user) return;

    try {
      await emailReceiptService.resendReceipt(sessionData.id, user.email);
    } catch (error) {
      console.error('Failed to resend receipt:', error);
    }
  };

  const handleViewHistory = () => {
    router.push({
      pathname: '/(app)/transaction-history',
      params: { highlightTransaction: sessionData?.id }
    });
  };

  const handleGoHome = () => {
    router.replace('/(app)');
  };

  const handleStartNewSession = () => {
    router.replace('/(app)');
  };

  if (!sessionData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Processing completion...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>✅</Text>
        </View>
        
        <Text style={styles.title}>Charging Complete!</Text>
        <Text style={styles.subtitle}>Your session has finished successfully</Text>

        {/* Session Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Session Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Station</Text>
            <Text style={styles.summaryValue}>{sessionData.stationName}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{sessionData.duration}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Energy Delivered</Text>
            <Text style={styles.summaryValue}>{sessionData.energyDelivered} kWh</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Cost</Text>
            <Text style={[styles.summaryValue, styles.totalCost]}>
              ${sessionData.finalCost}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method</Text>
            <Text style={styles.summaryValue}>{sessionData.paymentMethod}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Session Time</Text>
            <Text style={styles.summaryValue}>
              {sessionData.startTime.toLocaleTimeString()} - {sessionData.endTime.toLocaleTimeString()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.receiptButton}
            onPress={handleGetReceipt}
          >
            <Text style={styles.receiptButtonText}>📧 Email Receipt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewHistory}
          >
            <Text style={styles.secondaryButtonText}>📋 View in History</Text>
          </TouchableOpacity>
          
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={handleGoHome}
            >
              <Text style={styles.homeButtonText}>🏠 Back to Map</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.newSessionButton}
              onPress={handleStartNewSession}
            >
              <Text style={styles.newSessionButtonText}>⚡ Charge Again</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What's Next?</Text>
          <Text style={styles.infoText}>
            • Your receipt has been automatically sent to {user?.email}{'\n'}
            • Transaction details are saved in your history{'\n'}
            • Rate your charging experience in the app{'\n'}
            • Share Voltuoso with friends and earn rewards
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  totalCost: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  actionButtons: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  receiptButton: {
    backgroundColor: '#2ECC71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  receiptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#2ECC71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2ECC71',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  homeButton: {
    flex: 1,
    backgroundColor: '#6C757D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  newSessionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  newSessionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});