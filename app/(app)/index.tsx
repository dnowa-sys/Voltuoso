// app/(app)/index.tsx - MAP HOME SCREEN (UBER/LYFT STYLE)
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../src/context/AuthContext';

const { width, height } = Dimensions.get('window');

// Sample charging stations data
const chargingStations = [
  {
    id: 'station_1',
    name: 'Voltuoso Bethesda',
    address: '9525 Starmont Rd, Bethesda, MD 20817',
    latitude: 39.0223,
    longitude: -77.1545,
    status: 'available',
    connectorType: 'CCS',
    maxPower: 150,
    pricePerKwh: 0.28,
    availableConnectors: 3,
    totalConnectors: 4,
  },
  {
    id: 'station_2',
    name: 'Voltuoso Georgetown',
    address: '3000 M St NW, Washington, DC 20007',
    latitude: 38.9051,
    longitude: -77.0619,
    status: 'available',
    connectorType: 'CCS',
    maxPower: 150,
    pricePerKwh: 0.32,
    availableConnectors: 2,
    totalConnectors: 6,
  },
  {
    id: 'station_3',
    name: 'Voltuoso Arlington',
    address: '1100 Wilson Blvd, Arlington, VA 22209',
    latitude: 38.8951,
    longitude: -77.0839,
    status: 'in_use',
    connectorType: 'CCS',
    maxPower: 250,
    pricePerKwh: 0.35,
    availableConnectors: 1,
    totalConnectors: 8,
  },
  {
    id: 'station_4',
    name: 'Voltuoso Tysons',
    address: '1961 Chain Bridge Rd, Tysons, VA 22102',
    latitude: 38.9186,
    longitude: -77.2286,
    status: 'available',
    connectorType: 'CCS',
    maxPower: 150,
    pricePerKwh: 0.29,
    availableConnectors: 4,
    totalConnectors: 4,
  },
];

export default function MapHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [userLocation, setUserLocation] = useState({
    latitude: 38.9072, // Washington DC area
    longitude: -77.0369,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    // You could add location permission request here
    // For now, we'll center on DC area
  }, []);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#2ECC71'; // Green
      case 'in_use':
        return '#F39C12'; // Orange
      case 'offline':
        return '#E74C3C'; // Red
      default:
        return '#95A5A6'; // Gray
    }
  };

  const handleStationPress = (station: any) => {
    setSelectedStation(station);
  };

  const startCharging = (station: any) => {
    if (station.status !== 'available') {
      Alert.alert('Station Unavailable', 'This station is currently in use or offline.');
      return;
    }

    // Navigate to station detail or charging session
    router.push({
      pathname: '/station/[id]',
      params: {
        id: station.id,
        name: station.name,
        vicinity: station.address,
        rating: '4.5',
        lat: station.latitude,
        lng: station.longitude,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
        style={styles.map}
        region={userLocation}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {chargingStations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            title={station.name}
            description={`${station.availableConnectors}/${station.totalConnectors} available • ${station.pricePerKwh}/kWh`}
            pinColor={getMarkerColor(station.status)}
            onPress={() => handleStationPress(station)}
          />
        ))}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hello, {user?.email?.split('@')[0]}</Text>
          <Text style={styles.subtitle}>Find nearby charging stations</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/(app)/profile')}
        >
          <Text style={styles.profileButtonText}>
            {user?.email?.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Station Info Card */}
      {selectedStation && (
        <View style={styles.stationCard}>
          <View style={styles.stationHeader}>
            <View style={styles.stationInfo}>
              <Text style={styles.stationName}>{selectedStation.name}</Text>
              <Text style={styles.stationAddress}>{selectedStation.address}</Text>
              <View style={styles.stationMeta}>
                <Text style={styles.stationMetaText}>
                  {selectedStation.availableConnectors}/{selectedStation.totalConnectors} available
                </Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.stationMetaText}>
                  ${selectedStation.pricePerKwh}/kWh
                </Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.stationMetaText}>
                  {selectedStation.maxPower}kW
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedStation(null)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.startChargingButton,
              selectedStation.status !== 'available' && styles.startChargingButtonDisabled,
            ]}
            onPress={() => startCharging(selectedStation)}
            disabled={selectedStation.status !== 'available'}
          >
            <Text style={styles.startChargingButtonText}>
              {selectedStation.status === 'available' ? '⚡ Start Charging' : 'Station Unavailable'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🗺️</Text>
          <Text style={[styles.navText, styles.navTextActive]}>Map</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(app)/sessions')}
        >
          <Text style={styles.navIcon}>🔋</Text>
          <Text style={styles.navText}>Sessions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(app)/payment')}
        >
          <Text style={styles.navIcon}>💳</Text>
          <Text style={styles.navText}>Payment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(app)/profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2ECC71',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stationCard: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stationInfo: {
    flex: 1,
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
    marginBottom: 8,
  },
  stationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stationMetaText: {
    fontSize: 12,
    color: '#999',
  },
  dot: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 6,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  startChargingButton: {
    backgroundColor: '#2ECC71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startChargingButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  startChargingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingBottom: 34, // Account for iOS safe area
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#999',
  },
  navTextActive: {
    color: '#2ECC71',
    fontWeight: '600',
  },
});