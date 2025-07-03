// src/components/ActiveChargingSession.tsx - REAL-TIME CHARGING MONITOR
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ActiveChargingSessionProps {
  session: {
    id: string;
    stationName: string;
    stationAddress: string;
    startTime: Date;
    authorizedAmount: number;
    pricePerKwh: number;
  };
  onSessionComplete: (completedSession: any) => void;
}

export function ActiveChargingSession({ session, onSessionComplete }: ActiveChargingSessionProps) {
  const [energyDelivered, setEnergyDelivered] = useState(0);
  const [currentPower, setCurrentPower] = useState(0);
  const [currentCost, setCurrentCost] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCharging, setIsCharging] = useState(true);
  const [stopping, setStopping] = useState(false);

  // Simulate real-time charging progress
  useEffect(() => {
    if (!isCharging) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      
      // Simulate power delivery curve (starts high, tapers off)
      const timeInMinutes = elapsedTime / 60;
      let power = 0;
      
      if (timeInMinutes < 10) {
        power = 120 + Math.random() * 30; // High power initially
      } else if (timeInMinutes < 30) {
        power = 80 + Math.random() * 40; // Medium power
      } else {
        power = 20 + Math.random() * 30; // Lower power as battery fills
      }
      
      setCurrentPower(power);
      
      // Update energy delivered (power * time)
      setEnergyDelivered(prev => {
        const newEnergy = prev + (power / 3600); // Convert to kWh per second
        const newCost = newEnergy * session.pricePerKwh;
        setCurrentCost(newCost);
        return newEnergy;
      });
      
      // Auto-complete after reasonable time (simulate full charge)
      if (timeInMinutes > 45 && power < 25) {
        setIsCharging(false);
        setTimeout(() => {
          handleSessionComplete();
        }, 2000);
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isCharging, elapsedTime, session.pricePerKwh]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  };

  const getChargingSpeed = () => {
    if (currentPower > 100) return 'Fast';
    if (currentPower > 50) return 'Normal';
    if (currentPower > 20) return 'Slow';
    return 'Trickle';
  };

  const getSpeedColor = () => {
    if (currentPower > 100) return '#2ECC71';
    if (currentPower > 50) return '#F39C12';
    if (currentPower > 20) return '#E67E22';
    return '#E74C3C';
  };

  const handleStopCharging = () => {
    Alert.alert(
      'Stop Charging?',
      'Are you sure you want to stop the charging session? You will be charged for the energy already delivered.',
      [
        { text: 'Continue Charging', style: 'cancel' },
        {
          text: 'Stop Charging',
          style: 'destructive',
          onPress: () => {
            setStopping(true);
            setIsCharging(false);
            setTimeout(() => {
              handleSessionComplete();
            }, 2000);
          },
        },
      ]
    );
  };

  const handleSessionComplete = () => {
    const completedSession = {
      ...session,
      endTime: new Date(),
      energyDelivered: energyDelivered.toFixed(1),
      finalCost: currentCost.toFixed(2),
      duration: formatTime(elapsedTime),
      status: 'completed',
    };
    
    onSessionComplete(completedSession);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Charging in Progress</Text>
        <View style={[styles.statusBadge, { backgroundColor: getSpeedColor() }]}>
          <View style={styles.chargingDot} />
          <Text style={styles.statusText}>{getChargingSpeed()}</Text>
        </View>
      </View>

      {/* Station Info */}
      <View style={styles.stationCard}>
        <Text style={styles.stationName}>{session.stationName}</Text>
        <Text style={styles.stationAddress}>{session.stationAddress}</Text>
        <Text style={styles.sessionTime}>
          Started at {session.startTime.toLocaleTimeString()}
        </Text>
      </View>

      {/* Real-time Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.mainStat}>
          <Text style={styles.mainStatValue}>{energyDelivered.toFixed(1)}</Text>
          <Text style={styles.mainStatLabel}>kWh Delivered</Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getSpeedColor() }]}>
              {currentPower.toFixed(0)} kW
            </Text>
            <Text style={styles.statLabel}>Current Power</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${currentCost.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Current Cost</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${session.pricePerKwh}/kWh</Text>
            <Text style={styles.statLabel}>Rate</Text>
          </View>
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Charging Progress</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min((energyDelivered / 60) * 100, 100)}%`,
                backgroundColor: getSpeedColor(),
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {energyDelivered < 50 ? 'Charging...' : 'Nearly complete'}
        </Text>
      </View>

      {/* Control Button */}
      <View style={styles.controls}>
        {isCharging ? (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopCharging}
            disabled={stopping}
          >
            {stopping ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.stopButtonText}>🛑 Stop Charging</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.completingCard}>
            <ActivityIndicator size="large" color="#2ECC71" />
            <Text style={styles.completingText}>
              {stopping ? 'Stopping session...' : 'Charging complete, processing payment...'}
            </Text>
          </View>
        )}
      </View>

      {/* Safety Notice */}
      <View style={styles.safetyNotice}>
        <Text style={styles.safetyText}>
          💡 You can safely leave your vehicle. You'll receive a notification when charging completes.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chargingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stationCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sessionTime: {
    fontSize: 12,
    color: '#999',
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mainStatValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 4,
  },
  mainStatLabel: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  controls: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  stopButton: {
    backgroundColor: '#E74C3C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completingCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  safetyNotice: {
    backgroundColor: '#E8F5E8',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
  },
  safetyText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});