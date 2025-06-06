// app/(app)/charging-session.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ActivityIndicator, Button, Card, Chip, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export default function ChargingSession() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extract params
  const {
    stationId = 'station_001',
    stationName = 'Test Charging Station',
    paymentIntentId = 'pi_test_123',
    sessionId = 'session_test_456',
  } = params;

  // Session state
  const [loading, setLoading] = useState(true);
  const [isCharging, setIsCharging] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'charging' | 'error'>('connecting');
  
  // Charging metrics
  const [energyDelivered, setEnergyDelivered] = useState(0);
  const [currentPower, setCurrentPower] = useState(0);
  const [chargingTime, setChargingTime] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(45); // Mock initial battery level
  const [targetBatteryLevel, setTargetBatteryLevel] = useState(80);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0.45)).current;
  const powerGaugeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeSession();
    
    return () => {
      // Cleanup polling when component unmounts
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      if (chargingTimer.current) {
        clearInterval(chargingTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isCharging) {
      startPulseAnimation();
      startChargingTimer();
      startStatusPolling();
    } else {
      stopPulseAnimation();
      stopChargingTimer();
    }
  }, [isCharging]);

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const chargingTimer = useRef<NodeJS.Timeout | null>(null);

  const initializeSession = async () => {
    try {
      setLoading(true);
      
      // Simulate connection process
      setTimeout(() => {
        setConnectionStatus('connected');
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize charging session');
      console.error('Session initialization error:', error);
      setLoading(false);
    }
  };

  const startStatusPolling = () => {
    // Poll charging status every 3 seconds during charging
    pollingInterval.current = setInterval(() => {
      updateChargingStatus();
    }, 3000);
  };

  const stopStatusPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const updateChargingStatus = () => {
    if (isCharging && batteryLevel < targetBatteryLevel) {
      // Simulate realistic charging progress
      const chargingRate = Math.random() * 1.5 + 0.5; // 0.5-2% per update
      const newBatteryLevel = Math.min(targetBatteryLevel, batteryLevel + chargingRate);
      
      const newEnergyDelivered = energyDelivered + (Math.random() * 0.8 + 0.4); // 0.4-1.2 kWh per update
      const newCurrentPower = Math.random() * 15 + 40; // 40-55 kW
      
      setBatteryLevel(newBatteryLevel);
      setEnergyDelivered(newEnergyDelivered);
      setCurrentPower(newCurrentPower);
      
      // Calculate cost (mock rate: $0.35/kWh)
      const cost = newEnergyDelivered * 35; // cents
      setEstimatedCost(cost);
      
      // Update animations
      Animated.timing(progressAnim, {
        toValue: newBatteryLevel / 100,
        duration: 2000,
        useNativeDriver: false,
      }).start();
      
      Animated.timing(powerGaugeAnim, {
        toValue: newCurrentPower / 60, // Max 60 kW for animation
        duration: 2000,
        useNativeDriver: false,
      }).start();
      
      // Auto-stop when target reached
      if (newBatteryLevel >= targetBatteryLevel) {
        setTimeout(() => {
          handleStopCharging();
        }, 1000);
      }
    }
  };

  const startChargingTimer = () => {
    chargingTimer.current = setInterval(() => {
      setChargingTime(prev => prev + 1);
    }, 1000);
  };

  const stopChargingTimer = () => {
    if (chargingTimer.current) {
      clearInterval(chargingTimer.current);
      chargingTimer.current = null;
    }
  };

  const startPulseAnimation = () => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isCharging) pulse();
      });
    };
    pulse();
  };

  const stopPulseAnimation = () => {
    pulseAnim.setValue(1);
  };

  const handleStartCharging = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsCharging(true);
      setConnectionStatus('charging');
      
      Alert.alert('Charging Started!', `Your vehicle is now charging to ${targetBatteryLevel}%.`);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to start charging. Please try again.');
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleStopCharging = async () => {
    try {
      setLoading(true);
      
      setIsCharging(false);
      stopChargingTimer();
      stopStatusPolling();
      setConnectionStatus('connected');
      
      // Simulate saving session data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to completion screen
      router.push({
        pathname: '/charging-complete',
        params: {
          energyDelivered: energyDelivered.toFixed(2),
          finalCost: (estimatedCost / 100).toFixed(2),
          chargingTime: formatTime(chargingTime),
          batteryLevel: Math.round(batteryLevel).toString(),
          stationName: stationName as string,
        },
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to stop charging properly.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyStop = () => {
    Alert.alert(
      'Emergency Stop',
      'Are you sure you want to immediately stop charging?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Emergency Stop',
          style: 'destructive',
          onPress: async () => {
            setIsCharging(false);
            stopChargingTimer();
            stopStatusPolling();
            setConnectionStatus('connected');
            Alert.alert('Charging Stopped', 'Charging has been stopped immediately.');
          },
        },
      ]
    );
  };

  const adjustTargetBattery = (increment: number) => {
    const newTarget = Math.max(50, Math.min(95, targetBatteryLevel + increment));
    setTargetBatteryLevel(newTarget);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getEstimatedTimeRemaining = () => {
    if (!isCharging || batteryLevel >= targetBatteryLevel) return 'Complete';
    
    const remainingPercent = targetBatteryLevel - batteryLevel;
    const averageRatePerMinute = 1.2; // Mock: 1.2% per minute
    const minutesRemaining = Math.round(remainingPercent / averageRatePerMinute);
    
    if (minutesRemaining < 60) {
      return `${minutesRemaining}m remaining`;
    }
    const hours = Math.floor(minutesRemaining / 60);
    const minutes = minutesRemaining % 60;
    return `${hours}h ${minutes}m remaining`;
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'charging': return '#4CAF50';
      case 'connected': return '#2196F3';
      case 'connecting': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'charging': return 'Charging Active';
      case 'connected': return 'Ready to Charge';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Unknown';
    }
  };

  if (loading && connectionStatus === 'connecting') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Connecting to charging station...</Text>
        <Text style={styles.loadingSubtext}>Please wait while we establish connection</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[
        styles.headerGradient,
        { backgroundColor: isCharging ? '#4CAF50' : '#2196F3' }
      ]}>
        <View style={styles.header}>
          <Text style={styles.stationName}>{stationName}</Text>
          <Chip
            mode="flat"
            textStyle={styles.statusChipText}
            style={[styles.statusChip, { backgroundColor: getStatusColor() }]}
          >
            {getStatusText()}
          </Chip>
        </View>
      </View>

      {/* Charging Animation */}
      <View style={styles.chargingAnimation}>
        <Animated.View style={[styles.chargingIcon, { transform: [{ scale: pulseAnim }] }]}>
          <Icon
            name={isCharging ? 'electric-bolt' : 'ev-station'}
            size={80}
            color={isCharging ? '#4CAF50' : '#2196F3'}
          />
        </Animated.View>
        
        {/* Battery Level */}
        <View style={styles.batteryContainer}>
          <Text style={styles.batteryLabel}>Battery Level</Text>
          <View style={styles.batteryOutline}>
            <Animated.View
              style={[
                styles.batteryFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: batteryLevel > 80 ? '#4CAF50' : batteryLevel > 20 ? '#FF9800' : '#F44336',
                },
              ]}
            />
          </View>
          <Text style={styles.batteryText}>{Math.round(batteryLevel)}%</Text>
          <Text style={styles.estimatedTime}>{getEstimatedTimeRemaining()}</Text>
        </View>
      </View>

      {/* Target Battery Level Control */}
      {!isCharging && (
        <Card style={styles.targetCard}>
          <Card.Content>
            <Text style={styles.targetTitle}>Charge Target</Text>
            <View style={styles.targetControls}>
              <Button
                mode="outlined"
                onPress={() => adjustTargetBattery(-5)}
                disabled={targetBatteryLevel <= 50}
                compact
              >
                -5%
              </Button>
              <Text style={styles.targetValue}>{targetBatteryLevel}%</Text>
              <Button
                mode="outlined"
                onPress={() => adjustTargetBattery(5)}
                disabled={targetBatteryLevel >= 95}
                compact
              >
                +5%
              </Button>
            </View>
            <Text style={styles.targetNote}>
              Recommended: 80% for daily use, 95% for long trips
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Charging Metrics */}
      <View style={styles.metricsContainer}>
        <Card style={styles.metricCard}>
          <Card.Content style={styles.metricContent}>
            <Icon name="flash-on" size={24} color="#FF9800" />
            <Text style={styles.metricValue}>{energyDelivered.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>kWh Delivered</Text>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content style={styles.metricContent}>
            <Icon name="speed" size={24} color="#2196F3" />
            <Text style={styles.metricValue}>{currentPower.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>kW Power</Text>
            
            {/* Power Gauge */}
            <View style={styles.powerGauge}>
              <Animated.View
                style={[
                  styles.powerGaugeFill,
                  {
                    width: powerGaugeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }
                ]}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content style={styles.metricContent}>
            <Icon name="schedule" size={24} color="#9C27B0" />
            <Text style={styles.metricValue}>{formatTime(chargingTime)}</Text>
            <Text style={styles.metricLabel}>Duration</Text>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content style={styles.metricContent}>
            <Icon name="attach-money" size={24} color="#4CAF50" />
            <Text style={styles.metricValue}>${(estimatedCost / 100).toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Cost</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Progress Bar */}
      <Card style={styles.progressCard}>
        <Card.Content>
          <Text style={styles.progressTitle}>Charging Progress</Text>
          <ProgressBar
            progress={batteryLevel / 100}
            color={batteryLevel > 80 ? '#4CAF50' : '#2196F3'}
            style={styles.progressBar}
          />
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>0%</Text>
            <Text style={styles.progressLabel}>25%</Text>
            <Text style={styles.progressLabel}>50%</Text>
            <Text style={styles.progressLabel}>75%</Text>
            <Text style={styles.progressLabel}>100%</Text>
          </View>
          
          {/* Target indicator */}
          <View 
            style={[
              styles.targetIndicator, 
              { left: `${targetBatteryLevel}%` }
            ]}
          >
            <Text style={styles.targetIndicatorText}>Target</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Control Buttons */}
      <View style={styles.controlButtons}>
        {!isCharging && connectionStatus === 'connected' && (
          <Button
            mode="contained"
            onPress={handleStartCharging}
            loading={loading}
            disabled={loading}
            style={[styles.controlButton, styles.startButton]}
            contentStyle={styles.buttonContent}
          >
            Start Charging to {targetBatteryLevel}%
          </Button>
        )}

        {isCharging && (
          <Button
            mode="contained"
            onPress={handleStopCharging}
            loading={loading}
            disabled={loading}
            style={[styles.controlButton, styles.stopButton]}
            contentStyle={styles.buttonContent}
          >
            Stop Charging
          </Button>
        )}

        <Button
          mode="outlined"
          onPress={handleEmergencyStop}
          style={[styles.controlButton, styles.emergencyButton]}
          contentStyle={styles.buttonContent}
          textColor="#F44336"
        >
          Emergency Stop
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back to Map
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  statusChip: {
    marginLeft: 16,
  },
  statusChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chargingAnimation: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  chargingIcon: {
    marginBottom: 24,
  },
  batteryContainer: {
    alignItems: 'center',
  },
  batteryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  batteryOutline: {
    width: 200,
    height: 40,
    borderWidth: 3,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 4,
  },
  batteryText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#333',
  },
  estimatedTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  targetCard: {
    margin: 16,
    elevation: 2,
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  targetControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  targetValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 24,
    color: '#007AFF',
  },
  targetNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metricCard: {
    width: (width - 48) / 2,
    margin: 4,
    elevation: 2,
  },
  metricContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  powerGauge: {
    width: 60,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  powerGaugeFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  progressCard: {
    margin: 16,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  targetIndicator: {
    position: 'absolute',
    top: 40,
    transform: [{ translateX: -15 }],
    alignItems: 'center',
  },
  targetIndicatorText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  controlButtons: {
    padding: 16,
    paddingBottom: 32,
  },
  controlButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  buttonContent: {
    height: 50,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#FF9800',
  },
  emergencyButton: {
    borderColor: '#F44336',
  },
  backButton: {
    marginTop: 16,
  },
});