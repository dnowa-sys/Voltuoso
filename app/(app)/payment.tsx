// app/(app)/payment.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, Card, Chip, Divider, Switch } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PaymentMethod } from '../../src/types/payment';

// Mock saved payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    card: {
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
    },
    isDefault: true,
  },
  {
    id: 'pm_2',
    type: 'card',
    card: {
      brand: 'mastercard',
      last4: '5555',
      expMonth: 8,
      expYear: 2026,
    },
    isDefault: false,
  },
];

export default function Payment() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Extract params from Expo Router
  const { 
    stationId = 'station_001', 
    stationName = 'Test Charging Station', 
    estimatedAmount = '2500', 
    userId = 'user123'
  } = params;
  
  // Convert estimatedAmount to number
  const amountInCents = parseInt(estimatedAmount as string, 10);
  
  const [loading, setLoading] = useState(false);
  const [savedMethods, setSavedMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [saveCard, setSaveCard] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvc: '',
    zip: '',
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSavedMethods(mockPaymentMethods);
      
      // Select default method if available
      const defaultMethod = mockPaymentMethods.find(m => m.isDefault);
      if (defaultMethod) {
        setSelectedMethodId(defaultMethod.id);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const validateCardForm = () => {
    const { number, expiry, cvc, zip } = cardForm;
    
    if (!number || number.replace(/\s/g, '').length < 16) {
      Alert.alert('Invalid Card', 'Please enter a valid card number');
      return false;
    }
    
    if (!expiry || expiry.length < 5) {
      Alert.alert('Invalid Expiry', 'Please enter a valid expiry date');
      return false;
    }
    
    if (!cvc || cvc.length < 3) {
      Alert.alert('Invalid CVC', 'Please enter a valid CVC code');
      return false;
    }
    
    if (!zip || zip.length < 5) {
      Alert.alert('Invalid ZIP', 'Please enter a valid ZIP code');
      return false;
    }
    
    return true;
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Validate payment method
      if (!selectedMethodId && !showCardForm) {
        Alert.alert('Payment Method Required', 'Please select a payment method or add a new card');
        return;
      }

      if (showCardForm && !validateCardForm()) {
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success
      const success = Math.random() > 0.1; // 90% success rate for demo

      if (success) {
        Alert.alert(
          'Payment Authorized!',
          'Your charging session has been authorized. You can now start charging.',
          [
            {
              text: 'Start Charging',
              onPress: () => router.push({
                pathname: '/charging-session',
                params: { 
                  stationId, 
                  stationName,
                  paymentIntentId: 'pi_mock_' + Date.now(),
                  sessionId: 'session_mock_' + Date.now(),
                }
              }),
            },
          ]
        );
      } else {
        Alert.alert('Payment Failed', 'Please check your payment method and try again.');
      }
    } catch (error) {
      Alert.alert('Payment Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa': return 'credit-card';
      case 'mastercard': return 'credit-card';
      case 'amex': return 'credit-card';
      default: return 'credit-card';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Station Info Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.stationHeader}>
            <Icon name="ev-station" size={24} color="#007AFF" />
            <View style={styles.stationInfo}>
              <Text style={styles.stationName}>{stationName}</Text>
              <Text style={styles.stationId}>ID: {stationId}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Authorization Amount</Text>
            <Text style={styles.amount}>{formatAmount(amountInCents)}</Text>
          </View>
          
          <View style={styles.noteContainer}>
            <Icon name="info" size={16} color="#666" />
            <Text style={styles.note}>
              We'll only charge you for the actual energy consumed
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Saved Payment Methods */}
      {savedMethods.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
            {savedMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedMethodId === method.id && styles.selectedMethod,
                ]}
                onPress={() => {
                  setSelectedMethodId(method.id);
                  setShowCardForm(false);
                }}
              >
                <View style={styles.methodLeft}>
                  <Icon name={getCardIcon(method.card.brand)} size={24} color="#333" />
                  <View style={styles.methodInfo}>
                    <Text style={styles.cardBrand}>
                      {method.card.brand.toUpperCase()} •••• {method.card.last4}
                    </Text>
                    <Text style={styles.cardExpiry}>
                      Expires {method.card.expMonth}/{method.card.expYear}
                    </Text>
                  </View>
                </View>
                <View style={styles.methodRight}>
                  {method.isDefault && (
                    <Chip mode="outlined" compact style={styles.defaultChip}>
                      Default
                    </Chip>
                  )}
                  {selectedMethodId === method.id && (
                    <Icon name="check-circle" size={24} color="#4CAF50" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                styles.addNewMethod,
                showCardForm && styles.selectedMethod,
              ]}
              onPress={() => {
                setShowCardForm(true);
                setSelectedMethodId('');
              }}
            >
              <View style={styles.methodLeft}>
                <Icon name="add-circle-outline" size={24} color="#007AFF" />
                <Text style={styles.addNewText}>Add new payment method</Text>
              </View>
              {showCardForm && (
                <Icon name="check-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          </Card.Content>
        </Card>
      )}

      {/* New Card Form */}
      {showCardForm && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={styles.input}>
                <Text
                  style={styles.inputText}
                  onPress={() => Alert.alert('Card Input', 'Stripe integration coming soon!')}
                >
                  {cardForm.number || '1234 5678 9012 3456'}
                </Text>
              </View>
            </View>
            
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Expiry</Text>
                <View style={[styles.input, styles.inputHalf]}>
                  <Text
                    style={styles.inputText}
                    onPress={() => Alert.alert('Expiry Input', 'Stripe integration coming soon!')}
                  >
                    {cardForm.expiry || '12/25'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>CVC</Text>
                <View style={[styles.input, styles.inputHalf]}>
                  <Text
                    style={styles.inputText}
                    onPress={() => Alert.alert('CVC Input', 'Stripe integration coming soon!')}
                  >
                    {cardForm.cvc || '123'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ZIP Code</Text>
              <View style={styles.input}>
                <Text
                  style={styles.inputText}
                  onPress={() => Alert.alert('ZIP Input', 'Stripe integration coming soon!')}
                >
                  {cardForm.zip || '12345'}
                </Text>
              </View>
            </View>
            
            <View style={styles.saveCardContainer}>
              <Text style={styles.saveCardText}>Save this card for future use</Text>
              <Switch
                value={saveCard}
                onValueChange={setSaveCard}
                color="#007AFF"
              />
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Payment Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Authorization Amount:</Text>
            <Text style={styles.summaryValue}>{formatAmount(amountInCents)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Processing Fee:</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Authorization:</Text>
            <Text style={styles.summaryTotalValue}>{formatAmount(amountInCents)}</Text>
          </View>
          
          <View style={styles.disclaimerContainer}>
            <Icon name="info-outline" size={16} color="#666" />
            <Text style={styles.disclaimer}>
              This is an authorization hold. You'll only be charged for actual energy consumed during your charging session.
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          onPress={handlePayment}
          loading={loading}
          disabled={loading || (!selectedMethodId && !showCardForm)}
          style={styles.payButton}
          contentStyle={styles.buttonContent}
        >
          {loading ? 'Processing...' : `Authorize ${formatAmount(amountInCents)}`}
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.cancelButton}
          contentStyle={styles.buttonContent}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 3,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  stationId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 16,
    color: '#333',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    lineHeight: 16,
    flex: 1,
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    backgroundColor: 'white',
  },
  selectedMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  addNewMethod: {
    borderStyle: 'dashed',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodInfo: {
    marginLeft: 12,
  },
  cardBrand: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  cardExpiry: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  methodRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultChip: {
    height: 24,
  },
  addNewText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f8f8',
    minHeight: 48,
    justifyContent: 'center',
  },
  inputHalf: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  saveCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveCardText: {
    fontSize: 14,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    lineHeight: 16,
    flex: 1,
  },
  divider: {
    marginVertical: 12,
  },
  actionButtons: {
    padding: 16,
    paddingBottom: 32,
  },
  payButton: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    borderRadius: 8,
    borderColor: '#666',
  },
  buttonContent: {
    height: 50,
  },
});