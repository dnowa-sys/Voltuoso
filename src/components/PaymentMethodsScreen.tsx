// src/components/PaymentMethodsScreen.tsx
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
import { createCustomer, createSetupIntent } from '../services/stripeService';

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  isDefault: boolean;
}

export function PaymentMethodsScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setupCustomer();
      loadPaymentMethods();
    }
  }, [user]);

  const setupCustomer = async () => {
    if (!user) return;
    
    try {
      // In a real app, you'd check if customer already exists
      const customer = await createCustomer(user.email, user.id);
      setCustomerId(customer.id);
    } catch (error) {
      console.error('Customer setup failed:', error);
    }
  };

  const loadPaymentMethods = async () => {
    // This would load payment methods from your backend
    // For now, we'll use mock data
    const mockMethods: PaymentMethod[] = [
      {
        id: 'pm_1234',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
        isDefault: true,
      },
    ];
    setPaymentMethods(mockMethods);
  };

  const addPaymentMethod = async () => {
    if (!customerId) {
      Alert.alert('Error', 'Customer not set up. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // Create setup intent for saving payment method
      const clientSecret = await createSetupIntent(customerId);

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Voltuoso',
        customerId,
        customerEphemeralKeySecret: clientSecret, // In real app, get from backend
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          email: user?.email,
        },
      });

      if (initError) {
        console.error('Payment sheet init error:', initError);
        Alert.alert('Error', 'Failed to initialize payment sheet');
        return;
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Payment sheet present error:', presentError);
        if (presentError.code !== 'Canceled') {
          Alert.alert('Error', 'Failed to add payment method');
        }
        return;
      }

      // Success - reload payment methods
      Alert.alert('Success', 'Payment method added successfully!');
      loadPaymentMethods();
    } catch (error) {
      console.error('Add payment method error:', error);
      Alert.alert('Error', 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  const removePaymentMethod = (methodId: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // In real app, call backend to remove payment method
            setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
          },
        },
      ]
    );
  };

  const setDefaultPaymentMethod = (methodId: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId,
      }))
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Payment Methods</Text>
      <Text style={styles.subtitle}>Manage your payment methods for charging sessions</Text>

      {paymentMethods.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No payment methods added</Text>
          <Text style={styles.emptySubtext}>Add a payment method to start charging</Text>
        </View>
      ) : (
        <View style={styles.methodsList}>
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.methodCard}>
              <View style={styles.methodInfo}>
                <View style={styles.methodHeader}>
                  <Text style={styles.methodType}>
                    {method.card?.brand.toUpperCase()} •••• {method.card?.last4}
                  </Text>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.methodExpiry}>
                  Expires {method.card?.exp_month}/{method.card?.exp_year}
                </Text>
              </View>
              
              <View style={styles.methodActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    style={styles.setDefaultButton}
                    onPress={() => setDefaultPaymentMethod(method.id)}
                  >
                    <Text style={styles.setDefaultText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePaymentMethod(method.id)}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.addButton, loading && styles.addButtonDisabled]}
        onPress={addPaymentMethod}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  methodsList: {
    marginBottom: 30,
  },
  methodCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  methodInfo: {
    marginBottom: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  methodExpiry: {
    fontSize: 14,
    color: '#666',
  },
  methodActions: {
    flexDirection: 'row',
    gap: 12,
  },
  setDefaultButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  setDefaultText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },
  removeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d32f2f',
  },
  addButton: {
    backgroundColor: '#2ECC71',
    padding: 18,
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
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});