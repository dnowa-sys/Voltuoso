// app/(app)/charging-session.tsx - WITH PAYMENT INTEGRATION
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChargingSessionPayment } from '../../src/components/ChargingSessionPayment';

export default function ChargingSessionScreen() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const handlePaymentSuccess = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setSessionStarted(true);
    console.log('Charging session started:', sessionId);
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    // Navigate back or show different screen
  };

  if (sessionStarted && currentSessionId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Charging Session Active</Text>
        <Text style={styles.sessionId}>Session: {currentSessionId}</Text>
        <Text style={styles.status}>⚡ Charging in progress...</Text>
        
        <View style={styles.sessionInfo}>
          <Text style={styles.infoLabel}>Duration</Text>
          <Text style={styles.infoValue}>15:32</Text>
          
          <Text style={styles.infoLabel}>Energy Delivered</Text>
          <Text style={styles.infoValue}>12.5 kWh</Text>
          
          <Text style={styles.infoLabel}>Current Cost</Text>
          <Text style={styles.infoValue}>$4.75</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ChargingSessionPayment
        stationId="STATION_001"
        stationName="Voltuoso Supercharger"
        estimatedCost={15.50}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentCancel={handlePaymentCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5',
    paddingTop: 50, // Account for status bar
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  sessionId: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  status: {
    fontSize: 18,
    color: '#2ECC71',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '600',
  },
  sessionInfo: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginTop: 16,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});