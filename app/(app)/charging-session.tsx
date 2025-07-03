// app/(app)/charging-session.tsx - ENHANCED WITH REAL PAYMENT FLOW
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActiveChargingSession } from '../../src/components/ActiveChargingSession';
import { ChargingSessionPayment } from '../../src/components/ChargingSessionPayment';
import { useAuth } from '../../src/context/AuthContext';

export default function ChargingSessionScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [sessionState, setSessionState] = useState<'payment' | 'active' | 'completed'>('payment');
  const [currentSession, setCurrentSession] = useState<any>(null);
  
  // Get station info from params or use defaults
  const stationInfo = {
    id: params.stationId as string || 'station_1',
    name: params.stationName as string || 'Voltuoso Bethesda',
    address: params.stationAddress as string || '9525 Starmont Rd, Bethesda, MD 20817',
    pricePerKwh: parseFloat(params.pricePerKwh as string) || 0.28,
    maxPower: parseInt(params.maxPower as string) || 150,
  };

  const estimatedCost = 15.50; // Could be calculated based on user's car/charging needs

  const handlePaymentSuccess = (sessionData: any) => {
    console.log('💳 Payment authorized, starting session:', sessionData);
    
    setCurrentSession({
      id: sessionData.sessionId,
      stationId: stationInfo.id,
      stationName: stationInfo.name,
      stationAddress: stationInfo.address,
      paymentIntentId: sessionData.paymentIntentId,
      authorizedAmount: estimatedCost,
      startTime: new Date(),
      status: 'active',
      energyDelivered: 0,
      currentPower: 0,
      estimatedCost: 0,
      pricePerKwh: stationInfo.pricePerKwh,
    });
    
    setSessionState('active');
  };

  const handlePaymentCancel = () => {
    console.log('💳 Payment cancelled');
    Alert.alert(
      'Payment Cancelled',
      'Would you like to try a different payment method or go back?',
      [
        { text: 'Try Again', style: 'default' },
        { 
          text: 'Go Back', 
          style: 'cancel',
          onPress: () => router.back()
        },
      ]
    );
  };

  const handleSessionComplete = (completedSession: any) => {
    console.log('⚡ Charging session completed:', completedSession);
    setCurrentSession(completedSession);
    setSessionState('completed');
  };

  const handleGoHome = () => {
    router.replace('/(app)');
  };

  const handleViewReceipt = () => {
    router.push({
      pathname: '/(app)/transaction-history',
      params: { highlightTransaction: currentSession?.id }
    });
  };

  if (sessionState === 'payment') {
    return (
      <View style={styles.container}>
        <ChargingSessionPayment
          stationId={stationInfo.id}
          stationName={stationInfo.name}
          stationAddress={stationInfo.address}
          estimatedCost={estimatedCost}
          pricePerKwh={stationInfo.pricePerKwh}
          maxPower={stationInfo.maxPower}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentCancel={handlePaymentCancel}
        />
      </View>
    );
  }

  if (sessionState === 'active') {
    return (
      <View style={styles.container}>
        <ActiveChargingSession
          session={currentSession}
          onSessionComplete={handleSessionComplete}
        />
      </View>
    );
  }

  // Session completed
  return (
    <View style={styles.container}>
      <View style={styles.completedContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>✅</Text>
        </View>
        
        <Text style={styles.completedTitle}>Charging Complete!</Text>
        <Text style={styles.completedSubtitle}>Your session has finished successfully</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Session Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>
              {currentSession?.duration || '45m'}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Energy Delivered</Text>
            <Text style={styles.summaryValue}>
              {currentSession?.energyDelivered || '18.2'} kWh
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Cost</Text>
            <Text style={[styles.summaryValue, styles.totalCost]}>
              ${currentSession?.finalCost || '5.10'}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method</Text>
            <Text style={styles.summaryValue}>VISA ••••4242</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.receiptButton}
            onPress={handleViewReceipt}
          >
            <Text style={styles.receiptButtonText}>📧 View Receipt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleGoHome}
          >
            <Text style={styles.homeButtonText}>🏠 Back to Map</Text>
          </TouchableOpacity>
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
  completedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successEmoji: {
    fontSize: 40,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  receiptButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#2ECC71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  receiptButtonText: {
    color: '#2ECC71',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#2ECC71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});