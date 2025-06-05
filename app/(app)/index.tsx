// app/(app)/index.tsx - Expo Go Compatible Version
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { Coordinates, Station } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.3;

export default function HomeScreen() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (coords) {
        fetchNearbyStations(coords.latitude, coords.longitude);
      }
    }, [coords])
  );

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission is required to find nearby charging stations');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCoords(newCoords);
      await fetchNearbyStations(newCoords.latitude, newCoords.longitude);
    } catch (err) {
      setError('Failed to get your location. Please enable location services.');
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyStations = async (lat: number, lng: number) => {
    try {
      setError(null);
      const mockStations: Station[] = [
        {
          place_id: '1',
          name: 'Tesla Supercharger',
          geometry: {
            location: {
              lat: lat + 0.005,
              lng: lng + 0.003
            }
          },
          vicinity: 'Downtown Shopping Center',
          rating: 4.5
        },
        {
          place_id: '2', 
          name: 'ChargePoint Station',
          geometry: {
            location: {
              lat: lat - 0.003,
              lng: lng - 0.004
            }
          },
          vicinity: 'Mall Parking Lot',
          rating: 4.2
        },
        {
          place_id: '3',
          name: 'EVgo Fast Charging',
          geometry: {
            location: {
              lat: lat + 0.002,
              lng: lng - 0.006
            }
          },
          vicinity: 'Gas Station Plaza',
          rating: 3.8
        },
        {
          place_id: '4',
          name: 'Electrify America',
          geometry: {
            location: {
              lat: lat - 0.002,
              lng: lng + 0.007
            }
          },
          vicinity: 'Highway Rest Stop',
          rating: 4.0
        },
        {
          place_id: '5',
          name: 'Blink Charging',
          geometry: {
            location: {
              lat: lat + 0.006,
              lng: lng - 0.002
            }
          },
          vicinity: 'Office Complex',
          rating: 3.9
        },
        {
          place_id: '6',
          name: 'Shell Recharge',
          geometry: {
            location: {
              lat: lat - 0.004,
              lng: lng - 0.003
            }
          },
          vicinity: 'Gas Station',
          rating: 4.1
        }
      ];
      setStations(mockStations);
    } catch (err: any) {
      setError('Failed to load charging stations');
      console.error('Stations fetch error:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setSearchLoading(true);
    Keyboard.dismiss();

    try {
      let coordinates: Coordinates;
      
      const searchLower = searchTerm.toLowerCase();
      if (searchLower.includes('san francisco') || searchLower.includes('sf')) {
        coordinates = { latitude: 37.7749, longitude: -122.4194 };
      } else if (searchLower.includes('new york') || searchLower.includes('nyc')) {
        coordinates = { latitude: 40.7128, longitude: -74.0060 };
      } else if (searchLower.includes('los angeles') || searchLower.includes('la')) {
        coordinates = { latitude: 34.0522, longitude: -118.2437 };
      } else if (searchLower.includes('washington') || searchLower.includes('dc')) {
        coordinates = { latitude: 38.9072, longitude: -77.0369 };
      } else if (searchLower.includes('chicago')) {
        coordinates = { latitude: 41.8781, longitude: -87.6298 };
      } else if (searchLower.includes('miami')) {
        coordinates = { latitude: 25.7617, longitude: -80.1918 };
      } else if (searchLower.includes('seattle')) {
        coordinates = { latitude: 47.6062, longitude: -122.3321 };
      } else if (searchLower.includes('denver')) {
        coordinates = { latitude: 39.7392, longitude: -104.9903 };
      } else if (searchLower.includes('austin')) {
        coordinates = { latitude: 30.2672, longitude: -97.7431 };
      } else if (searchLower.includes('boston')) {
        coordinates = { latitude: 42.3601, longitude: -71.0589 };
      } else {
        coordinates = { 
          latitude: (coords?.latitude || 37.7749) + (Math.random() - 0.5) * 0.02, 
          longitude: (coords?.longitude || -122.4194) + (Math.random() - 0.5) * 0.02 
        };
      }
      
      setCoords(coordinates);
      await fetchNearbyStations(coordinates.latitude, coordinates.longitude);
      setSearchTerm('');
      Alert.alert('Search Complete', `Found ${6} charging stations near ${searchTerm}`);
    } catch (err) {
      Alert.alert('Search Failed', 'Unable to search for that location');
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStationPress = (stationId: string) => {
    console.log('Station pressed:', stationId);
    
    if (menuVisible) {
      toggleMenu();
    }
    
    const station = stations.find(s => s.place_id === stationId);
    console.log('Found station:', station);
    
    if (station) {
      router.push({
        pathname: `/station/${stationId}`,
        params: {
          name: station.name,
          vicinity: station.vicinity || 'Unknown location',
          rating: station.rating?.toString() || '4.0',
          lat: station.geometry.location.lat.toString(),
          lng: station.geometry.location.lng.toString(),
        }
      });
    } else {
      console.log('Station not found, navigating anyway');
      router.push(`/station/${stationId}`);
    }
  };

  const handleLocationPress = async () => {
    console.log('Location button pressed!');
    
    try {
      Alert.alert('Getting Location', 'Finding your current location...');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      console.log('New location:', newCoords);

      setCoords(newCoords);
      await fetchNearbyStations(newCoords.latitude, newCoords.longitude);
      
      Alert.alert(
        'Location Updated', 
        `Found your current location!\n${newCoords.latitude.toFixed(4)}, ${newCoords.longitude.toFixed(4)}`
      );
      
    } catch (err) {
      console.error('Location button error:', err);
      Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
    }
  };

  const toggleMenu = () => {
    const toValue = menuVisible ? SHEET_HEIGHT : 0;
    
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setMenuVisible(!menuVisible);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  if (loading) {
    return <LoadingSpinner message="Finding your location..." />;
  }

  if (!coords) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="location-outline" size={64} color="#999" />
        <Text style={styles.errorTitle}>Location Required</Text>
        <Text style={styles.errorMessage}>
          {error || 'Unable to access your location'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestLocationPermission}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Map Placeholder with Location Info */}
      <View style={styles.mapContainer}>
        <View style={styles.mapHeader}>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={20} color="#2ECC71" />
            <Text style={styles.locationText}>
              {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
            </Text>
          </View>
          <Text style={styles.mapTitle}>🗺️ Charging Stations Near You</Text>
        </View>

        {/* Stations List */}
        <ScrollView 
          style={styles.stationsList} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.stationsContent}
        >
          {stations.map((station, index) => {
            const distance = calculateDistance(
              coords.latitude, 
              coords.longitude, 
              station.geometry.location.lat, 
              station.geometry.location.lng
            );

            return (
              <TouchableOpacity 
                key={station.place_id} 
                style={styles.stationCard}
                onPress={() => handleStationPress(station.place_id)}
              >
                <View style={styles.stationHeader}>
                  <View style={styles.stationIcon}>
                    <Ionicons name="flash" size={20} color="#2ECC71" />
                  </View>
                  <View style={styles.stationInfo}>
                    <Text style={styles.stationName}>{station.name}</Text>
                    <Text style={styles.stationAddress}>{station.vicinity}</Text>
                  </View>
                  <View style={styles.stationMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#ffd700" />
                      <Text style={styles.rating}>{station.rating?.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.distance}>{distance.toFixed(1)} mi</Text>
                  </View>
                </View>
                
                <View style={styles.stationDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="flash-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>50 kW DC Fast</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="card-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>$0.32/kWh</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>~45 min</Text>
                  </View>
                  <View style={[styles.statusBadge, styles.available]}>
                    <Text style={styles.statusText}>Available</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Try 'NYC', 'San Francisco', 'Chicago'..."
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            editable={!searchLoading}
          />
          {searchLoading && (
            <View style={styles.searchLoader}>
              <Ionicons name="reload-outline" size={20} color="#2ECC71" />
            </View>
          )}
        </View>
      </View>

      {/* Current Location Button */}
      <TouchableOpacity 
        style={styles.locationButton} 
        onPress={handleLocationPress}
      >
        <Ionicons name="locate" size={24} color="#2ECC71" />
      </TouchableOpacity>

      {/* Menu Toggle Bar */}
      <TouchableOpacity 
        style={styles.menuToggle} 
        onPress={toggleMenu}
        activeOpacity={0.7}
      >
        <View style={styles.menuHandle} />
        <Text style={styles.menuToggleText}>
          {stations.length} station{stations.length !== 1 ? 's' : ''} nearby
        </Text>
        <Ionicons 
          name={menuVisible ? "chevron-down" : "chevron-up"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>

      {/* Bottom Sheet Menu */}
      <Animated.View 
        style={[
          styles.bottomSheet, 
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.sheetHeader}>
          <Ionicons name="flash" size={40} color="#2ECC71" />
          <View style={styles.sheetTitleContainer}>
            <Text style={styles.sheetTitle}>Quick Actions</Text>
            <Text style={styles.sheetSubtitle}>Manage your charging experience</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push('/(app)/profile'); }}>
          <View style={styles.menuItemIcon}>
            <Ionicons name="person-outline" size={24} color="#2ECC71" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>Profile</Text>
            <Text style={styles.menuItemSubtext}>View your charging stats</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push('/(app)/sessions'); }}>
          <View style={styles.menuItemIcon}>
            <Ionicons name="time-outline" size={24} color="#2ECC71" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>Charging History</Text>
            <Text style={styles.menuItemSubtext}>See past sessions</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push('/(app)/settings'); }}>
          <View style={styles.menuItemIcon}>
            <Ionicons name="settings-outline" size={24} color="#2ECC71" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>Settings</Text>
            <Text style={styles.menuItemSubtext}>Customize your app</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mapHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontFamily: 'monospace',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  stationsList: {
    flex: 1,
  },
  stationsContent: {
    padding: 16,
    paddingBottom: 100, // Space for bottom menu
  },
  stationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 14,
    color: '#666',
  },
  stationMeta: {
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },
  distance: {
    fontSize: 12,
    color: '#2ECC71',
    fontWeight: '600',
  },
  stationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  available: {
    backgroundColor: '#e8f5e8',
  },
  statusText: {
    fontSize: 12,
    color: '#2ECC71',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  searchLoader: {
    marginLeft: 8,
  },
  locationButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  menuToggle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
  },
  menuToggleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 50,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sheetTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuItemSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});