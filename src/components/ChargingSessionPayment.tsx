// src/components/ChargingSessionPayment.tsx
import { useStripe } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { createPaymentIntent } from '../services/stripeService';

interface ChargingSessionPaymentProps {
  stationId: string;
  stationName: string;
  estimatedCost: number;
  onPaymentSuccess: (sessionId: string) => void;
  onPaymentCancel: () => void;
}

export function ChargingSessionPayment({
  stationId,
  stationName,
  estimatedCost,
  onPaymentSuccess,
  onPaymentCancel,
}: ChargingSessionPaymentProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const startChargingSession = async () => {
    setLoading(true);
    try {
      // Create payment intent for estimated amount
      const clientSecret = await createPaymentIntent(estimatedCost);

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Voltuoso',
        defaultBillingDetails: {
          name: 'EV Charging Session',
        },
      });

      if (initError) {
        console.error('Payment sheet init error:', initError);
        Alert.alert('Error', 'Failed to initialize payment');
        return;
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Payment sheet present error:', presentError);
        if (presentError.code !== 'Canceled') {
          Alert.alert('Payment Failed', 'Unable to process payment');
        }
        return;
      }

      // Payment successful - start charging session
      const sessionId = `session_${Date.now()}`;
      Alert.alert(
        'Payment Authorized',
        'Your payment has been authorized. Charging session is starting...',
        [
          {
            text: 'OK',
            onPress: () => onPaymentSuccess(sessionId),
          },
        ]
      );
    } catch (error) {
      console.error('Charging session payment error:', error);
      Alert.alert('Error', 'Failed to start charging session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Charging Session</Text>
      
      <View style={styles.stationInfo}>
        <Text style={styles.stationName}>{stationName}</Text>
        <Text style={styles.stationId}>Station ID: {stationId}</Text>
      </View>

      <View style={styles.costInfo}>
        <Text style={styles.costLabel}>Estimated Cost</Text>
        <Text style={styles.costAmount}>${estimatedCost.toFixed(2)}</Text>
        <Text style={styles.costNote}>
          Final amount will be based on actual kWh consumed
        </Text>
      </View>

      <View style={styles.paymentInfo}>
        <Text style={styles.paymentTitle}>Payment Authorization</Text>
        <Text style={styles.paymentDescription}>
          We'll authorize your payment method for the estimated amount. 
          You'll only be charged for the actual energy consumed.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onPaymentCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.startButton, loading && styles.startButtonDisabled]}
          onPress={startChargingSession}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.startButtonText}>Authorize & Start</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  stationInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stationId: {
    fontSize: 14,
    color: '#666',
  },
  costInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  costLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  costAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 8,
  },
  costNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    maxWidth: 250,
  },
  paymentInfo: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ECC71',
    marginBottom: 8,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  startButton: {
    flex: 2,
    backgroundColor: '#2ECC71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});