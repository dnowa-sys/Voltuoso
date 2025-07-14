// src/components/ChargingSessionPayment.tsx - ENHANCED VERSION
import { useStripe } from '@stripe/stripe-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { shouldUseMockBackend } from '../services/stripeMockBackend';
import { createCustomer, createPaymentIntent, getPaymentMethods } from '../services/stripeService';

interface ChargingSessionPaymentProps {
  stationId: string;
  stationName: string;
  stationAddress: string;
  estimatedCost: number;
  pricePerKwh: number;
  maxPower: number;
  onPaymentSuccess: (sessionData: { sessionId: string; paymentIntentId: string }) => void;
  onPaymentCancel: () => void;
}

export function ChargingSessionPayment({
  stationId,
  stationName,
  stationAddress,
  estimatedCost,
  pricePerKwh,
  maxPower,
  onPaymentSuccess,
  onPaymentCancel,
}: ChargingSessionPaymentProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setupCustomerAndPaymentMethods();
    }
  }, [user]);

  const setupCustomerAndPaymentMethods = async () => {
    try {
      // Create customer if needed
      const customer = await createCustomer(user?.email || '', user?.id || '');
      setCustomerId(customer.id);

      // Load existing payment methods
      const methods = await getPaymentMethods(customer.id);
      setPaymentMethods(methods);
      
      // Select first payment method as default
      if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0]);
      }
    } catch (error) {
      console.error('Setup failed:', error);
    }
  };

  // Modify src/components/ChargingSessionPayment.tsx
const startChargingSessionReal = async () => {
  setLoading(true);
  try {
    // Call Firebase Cloud Function
    const startCharging = httpsCallable(functions, 'startChargingSession');
    const result = await startCharging({
      stationId: stationInfo.id,
      paymentIntentId: clientSecret.split('_secret')[0],
      chargeCurrent: 32 // Default charging current
    });

    onPaymentSuccess({
      sessionId: result.data.sessionId,
      paymentIntentId: clientSecret.split('_secret')[0]
    });
  } catch (error) {
    console.error('Failed to start charging:', error);
    Alert.alert('Error', 'Failed to start charging session');
  } finally {
    setLoading(false);
  }
};

  const startChargingSessionReal = async () => {
    setLoading(true);
    try {
      // Create payment intent for estimated amount
      const clientSecret = await createPaymentIntent(estimatedCost, 'usd');

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Voltuoso',
        returnURL: 'voltuoso://payment-return',
        defaultBillingDetails: {
          email: user?.email,
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
      const sessionData = {
        sessionId: `session_${Date.now()}`,
        paymentIntentId: clientSecret.split('_secret')[0],
        customerId: customerId || '',
        stationId,
        authorizedAmount: estimatedCost,
      };

      Alert.alert(
        'Payment Authorized! 💳',
        'Your payment has been authorized. Starting charging session...',
        [
          {
            text: 'Start Charging',
            onPress: () => onPaymentSuccess(sessionData),
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

  const startChargingSession = () => {
    if (shouldUseMockBackend()) {
      startChargingSessionMock();
    } else {
      startChargingSessionReal();
    }
  };

  const estimatedDuration = Math.ceil((60 / maxPower) * 60); // Rough estimate

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Start Charging Session</Text>
        <Text style={styles.subtitle}>Authorize payment to begin charging</Text>
      </View>
      
      <View style={styles.stationCard}>
        <Text style={styles.stationName}>{stationName}</Text>
        <Text style={styles.stationAddress}>{stationAddress}</Text>
        
        <View style={styles.stationDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Max Power</Text>
            <Text style={styles.detailValue}>{maxPower} kW</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>${pricePerKwh}/kWh</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Est. Duration</Text>
            <Text style={styles.detailValue}>{estimatedDuration}min</Text>
          </View>
        </View>
      </View>

      <View style={styles.costCard}>
        <Text style={styles.costTitle}>Estimated Cost</Text>
        <Text style={styles.costAmount}>${estimatedCost.toFixed(2)}</Text>
        <Text style={styles.costNote}>
          Final amount will be based on actual energy consumed
        </Text>
      </View>

      {paymentMethods.length > 0 && (
        <View style={styles.paymentMethodCard}>
          <Text style={styles.paymentMethodTitle}>Payment Method</Text>
          <View style={styles.selectedMethod}>
            <Text style={styles.methodText}>
              {selectedPaymentMethod?.card?.brand?.toUpperCase()} ••••{selectedPaymentMethod?.card?.last4}
            </Text>
            <TouchableOpacity style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.termsCard}>
        <Text style={styles.termsTitle}>How it works</Text>
        <Text style={styles.termsText}>
          • We'll authorize your payment method for the estimated amount{'\n'}
          • You'll only be charged for actual energy consumed{'\n'}
          • Payment will be processed when charging completes{'\n'}
          • You can stop charging at any time
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
            <Text style={styles.startButtonText}>
              ⚡ Authorize & Start ({shouldUseMockBackend() ? 'Mock' : 'Real'})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  stationCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  stationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  costCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  costTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  costAmount: {
    fontSize: 32,
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
  paymentMethodCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  selectedMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2ECC71',
  },
  termsCard: {
    backgroundColor: '#E8F5E8',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    shadowOffset: { width: 0, height: 2 },
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