// app/station/[id].tsx - FIXED Station Details Screen
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function StationDetailsScreen() {
  const { id, name, vicinity, rating, lat, lng } = useLocalSearchParams<{
    id: string;
    name?: string;
    vicinity?: string;
    rating?: string;
    lat?: string;
    lng?: string;
  }>();
  const router = useRouter();

  // Use the passed parameters or fallback to mock data
  const stationData = {
    id: id || 'unknown',
    name: name || 'Unknown Station',
    vicinity: vicinity || 'Location not available',
    rating: rating ? parseFloat(rating) : 4.0,
    latitude: lat ? parseFloat(lat) : 0,
    longitude: lng ? parseFloat(lng) : 0,
  };

  const handleStartCharging = () => {
    Alert.alert(
      'Start Charging',
      `Connect to ${stationData.name}?\n\nThis is a demo feature. In the real app, you would:\n• Scan QR code or tap NFC\n• Select charging speed\n• Start the session`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Demo Start', 
          onPress: () => {
            Alert.alert(
              'Charging Started!', 
              `Demo charging session started at ${stationData.name}.\n\nIn the real app, you would see:\n• Real-time charging progress\n• Cost tracking\n• Estimated completion time`
            );
          }
        }
      ]
    );
  };

  const handleGetDirections = () => {
    if (stationData.latitude === 0 && stationData.longitude === 0) {
      Alert.alert('Error', 'Location coordinates not available');
      return;
    }
    
    const { latitude, longitude } = stationData;
    const url = Platform.OS === 'ios' 
      ? `maps://app?daddr=${latitude},${longitude}`
      : `google.navigation:q=${latitude},${longitude}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open maps application');
    });
  };

  const handleCallStation = () => {
    Alert.alert(
      'Contact Station',
      'In the real app, you would be able to:\n• Call station support\n• Report issues\n• Get real-time availability',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Station Details</Text>
        <TouchableOpacity onPress={handleCallStation} style={styles.callButton}>
          <Ionicons name="call" size={24} color="#2ECC71" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Station Info Card */}
        <View style={styles.card}>
          <View style={styles.stationHeader}>
            <View style={styles.stationInfo}>
              <Text style={styles.stationName}>{stationData.name}</Text>
              <Text style={styles.stationAddress}>{stationData.vicinity}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#ffd700" />
                <Text style={styles.rating}>{stationData.rating.toFixed(1)}</Text>
                <Text style={styles.ratingText}>({Math.floor(Math.random() * 200 + 50)} reviews)</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, styles.statusAvailable]}>
              <Ionicons name="flash" size={16} color="#2ECC71" />
              <Text style={styles.statusText}>Available</Text>
            </View>
          </View>
        </View>

        {/* Charging Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Charging Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Ionicons name="flash" size={20} color="#2ECC71" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Power Output</Text>
                <Text style={styles.infoValue}>50 kW DC Fast</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="card" size={20} color="#2ECC71" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Price</Text>
                <Text style={styles.infoValue}>$0.32/kWh</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color="#2ECC71" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Est. Charge Time</Text>
                <Text style={styles.infoValue}>45 minutes (10-80%)</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="car" size={20} color="#2ECC71" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Connector Type</Text>
                <Text style={styles.infoValue}>CCS, CHAdeMO</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Operating Hours */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Operating Hours</Text>
          <View style={styles.hoursContainer}>
            <View style={styles.hoursRow}>
              <Text style={styles.dayText}>Today</Text>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: '#2ECC71' }]} />
                <Text style={styles.statusOpenText}>Open 24 hours</Text>
              </View>
            </View>
            <Text style={styles.hoursNote}>Available 24/7 • Automated payment</Text>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nearby Amenities</Text>
          <View style={styles.amenitiesContainer}>
            <View style={styles.amenityItem}>
              <Ionicons name="cafe" size={16} color="#666" />
              <Text style={styles.amenityText}>Coffee Shop</Text>
            </View>
            <View style={styles.amenityItem}>
              <Ionicons name="restaurant" size={16} color="#666" />
              <Text style={styles.amenityText}>Restaurant</Text>
            </View>
            <View style={styles.amenityItem}>
              <Ionicons name="storefront" size={16} color="#666" />
              <Text style={styles.amenityText}>Shopping</Text>
            </View>
            <View style={styles.amenityItem}>
              <Ionicons name="car" size={16} color="#666" />
              <Text style={styles.amenityText}>Parking</Text>
            </View>
          </View>
        </View>

        {/* Location Info */}
        {stationData.latitude !== 0 && stationData.longitude !== 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location</Text>
            <Text style={styles.coordinatesText}>
              {stationData.latitude.toFixed(4)}, {stationData.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={handleStartCharging}
          >
            <Ionicons name="flash" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Start Charging</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={handleGetDirections}
          >
            <Ionicons name="navigate" size={20} color="#2ECC71" />
            <Text style={styles.secondaryButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  callButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
    fontWeight: '600',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusAvailable: {
    backgroundColor: '#e8f5e8',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ECC71',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  hoursContainer: {
    marginTop: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusOpenText: {
    fontSize: 14,
    color: '#2ECC71',
    fontWeight: '500',
  },
  hoursNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  actionContainer: {
    marginTop: 20,
    marginBottom: 40,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: '#2ECC71',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#2ECC71',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#2ECC71',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});