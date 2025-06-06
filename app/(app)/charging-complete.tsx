// app/(app)/charging-complete.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Button, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export default function ChargingComplete() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extract completion data
  const {
    energyDelivered = '25.5',
    finalCost = '18.25',
    chargingTime = '45:30',
    batteryLevel = '80',
    stationName = 'Charging Station',
  } = params;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Delayed checkmark animation
    setTimeout(() => {
      Animated.spring(checkmarkAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }, 500);
  }, []);

  const handleViewReceipt = () => {
    router.push({
      pathname: '/transaction-details',
      params: {
        transactionId: 'tx_' + Date.now(),
        energyDelivered,
        finalCost,
        chargingTime,
        stationName,
      }
    });
  };

  const handleNewSession = () => {
    router.push('/');
  };

  const handleViewHistory = () => {
    router.push('/transaction-history');
  };

  const calculateSavings = () => {
    // Mock calculation: compare to gas cost
    const gasEquivalent = parseFloat(energyDelivered as string) * 3.5; // ~3.5 gallons equivalent
    const avgGasPrice = 3.85; // $3.85/gallon
    const gasCost = gasEquivalent * avgGasPrice;
    const savings = gasCost - parseFloat(finalCost as string);
    return Math.max(0, savings);
  };

  const calculateCO2Savings = () => {
    // Mock calculation: CO2 savings vs gas
    const energyKwh = parseFloat(energyDelivered as string);
    const co2SavedLbs = energyKwh * 0.85; // ~0.85 lbs CO2 saved per kWh vs gas
    return co2SavedLbs;
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Success Header */}
      <View style={styles.successHeader}>
        <Animated.View
          style={[
            styles.checkmarkContainer,
            {
              transform: [{ scale: checkmarkAnim }],
            },
          ]}
        >
          <Icon name="check-circle" size={80} color="#4CAF50" />
        </Animated.View>
        
        <Text style={styles.successTitle}>Charging Complete!</Text>
        <Text style={styles.successSubtitle}>
          Your vehicle has been successfully charged at {stationName}
        </Text>
      </View>

      {/* Session Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Session Summary</Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Icon name="battery-charging-full" size={32} color="#4CAF50" />
              <Text style={styles.summaryValue}>{batteryLevel}%</Text>
              <Text style={styles.summaryLabel}>Battery Level</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Icon name="flash-on" size={32} color="#FF9800" />
              <Text style={styles.summaryValue}>{energyDelivered} kWh</Text>
              <Text style={styles.summaryLabel}>Energy Added</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Icon name="schedule" size={32} color="#2196F3" />
              <Text style={styles.summaryValue}>{chargingTime}</Text>
              <Text style={styles.summaryLabel}>Duration</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Icon name="attach-money" size={32} color="#4CAF50" />
              <Text style={styles.summaryValue}>${finalCost}</Text>
              <Text style={styles.summaryLabel}>Total Cost</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Environmental Impact */}
      <Card style={styles.impactCard}>
        <Card.Content>
          <View style={styles.impactHeader}>
            <Icon name="eco" size={24} color="#4CAF50" />
            <Text style={styles.impactTitle}>Environmental Impact</Text>
          </View>
          
          <View style={styles.impactRow}>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>${calculateSavings().toFixed(2)}</Text>
              <Text style={styles.impactLabel}>Saved vs. Gas</Text>
            </View>
            
            <View style={styles.impactDivider} />
            
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>{calculateCO2Savings().toFixed(1)} lbs</Text>
              <Text style={styles.impactLabel}>CO₂ Avoided</Text>
            </View>
          </View>
          
          <Text style={styles.impactNote}>
            Great job! You're helping create a cleaner future 🌱
          </Text>
        </Card.Content>
      </Card>

      {/* Cost Breakdown */}
      <Card style={styles.costCard}>
        <Card.Content>
          <Text style={styles.costTitle}>Cost Breakdown</Text>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Energy ({energyDelivered} kWh × $0.35)</Text>
            <Text style={styles.costValue}>${(parseFloat(energyDelivered as string) * 0.35).toFixed(2)}</Text>
          </View>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Session Fee</Text>
            <Text style={styles.costValue}>$1.00</Text>
          </View>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Tax</Text>
            <Text style={styles.costValue}>$0.89</Text>
          </View>
          
          <View style={styles.costDivider} />
          
          <View style={styles.costRow}>
            <Text style={styles.costTotalLabel}>Total Charged</Text>
            <Text style={styles.costTotalValue}>${finalCost}</Text>
          </View>
          
          <Text style={styles.receiptNote}>
            Receipt sent to your email • Transaction ID: TX{Date.now().toString().slice(-6)}
          </Text>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          onPress={handleViewReceipt}
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
        >
          View Receipt
        </Button>
        
        <View style={styles.secondaryButtons}>
          <Button
            mode="outlined"
            onPress={handleViewHistory}
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
          >
            View History
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleNewSession}
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
          >
            Find Stations
          </Button>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  checkmarkContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  summaryCard: {
    marginBottom: 16,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: (width - 80) / 2,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  impactCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#f8fdf8',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactItem: {
    flex: 1,
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  impactDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  impactNote: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  costCard: {
    marginBottom: 24,
    elevation: 2,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  costDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  costTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  costTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  receiptNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
  actionButtons: {
    marginBottom: 32,
  },
  primaryButton: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#007AFF',
  },
  buttonContent: {
    height: 50,
  },
});