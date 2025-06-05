// app/(app)/index.tsx - Expo Go Compatible Version with Map
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
import MapView, { Marker } from 'react-native-maps';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { Coordinates, Station } from '../../types';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.4;
const ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function HomeScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
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
      
      // Animate map to new location
      mapRef.current?.animateToRegion({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 1000);
      
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
      
      // Animate map to current location
      mapRef.current?.animateToRegion({
        latitude: newCoords.latitude,
        longitude: newCoords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }, 1000);
      
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

  const handleMarkerPress = (station: Station) => {
    setSelectedStation(station);
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

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {stations.map((station) => (
          <Marker
            key={station.place_id}
            coordinate={{
              latitude: station.geometry.location.lat,
              longitude: station.geometry.location.lng,
            }}
            onPress={() => handleMarkerPress(station)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.marker}>
                <Ionicons name="flash" size={20} color="white" />
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Selected Station Card */}
      {selectedStation && (
        <TouchableOpacity 
          style={styles.selectedStationCard}
          onPress={() => handleStationPress(selectedStation.place_id)}
          activeOpacity={0.95}
        >
          <View style={styles.stationCardHeader}>
            <View style={styles.stationIcon}>
              <Ionicons name="flash" size={24} color="#2ECC71" />
            </View>
            <View style={styles.stationInfo}>
              <Text style={styles.stationName}>{selectedStation.name}</Text>
              <Text style={styles.stationAddress}>{selectedStation.vicinity}</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedStation(null)}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.stationCardDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="star" size={16} color="#ffd700" />
              <Text style={styles.detailText}>{selectedStation.rating?.toFixed(1)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="navigate" size={16} color="#666" />
              <Text style={styles.detailText}>
                {calculateDistance(
                  coords.latitude,
                  coords.longitude,
                  selectedStation.geometry.location.lat,
                  selectedStation.geometry.location.lng
                ).toFixed(1)} mi
              </Text>
            </View>
            <View style={[styles.statusBadge, styles.available]}>
              <Text style={styles.statusText}>Available</Text>
            </View>
          </View>
          
          <View style={styles.stationCardFooter}>
            <Text style={styles.tapToView}>Tap to view details →</Text>
          </View>
        </TouchableOpacity>
      )}

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

        <ScrollView showsVerticalScrollIndicator={false} style={styles.stationsList}>
          <Text style={styles.nearbyStationsTitle}>Nearby Stations</Text>
          {stations.map((station) => {
            const distance = calculateDistance(
              coords.latitude,
              coords.longitude,
              station.geometry.location.lat,
              station.geometry.location.lng
            );

            return (
              <TouchableOpacity
                key={station.place_id}
                style={styles.stationListItem}
                onPress={() => {
                  toggleMenu();
                  handleStationPress(station.place_id);
                }}
              >
                <View style={styles.stationListIcon}>
                  <Ionicons name="flash" size={18} color="#2ECC71" />
                </View>
                <View style={styles.stationListInfo}>
                  <Text style={styles.stationListName}>{station.name}</Text>
                  <Text style={styles.stationListAddress}>{station.vicinity}</Text>
                </View>
                <View style={styles.stationListMeta}>
                  <Text style={styles.stationListDistance}>{distance.toFixed(1)} mi</Text>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.menuActions}>
          <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push('/(app)/profile'); }}>
            <Ionicons name="person-outline" size={20} color="#2ECC71" />
            <Text style={styles.menuItemText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push('/(app)/sessions'); }}>
            <Ionicons name="time-outline" size={20} color="#2ECC71" />
            <Text style={styles.menuItemText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push('/(app)/settings'); }}>
            <Ionicons name="settings-outline" size={20} color="#2ECC71" />
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    backgroundColor: '#2ECC71',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
  selectedStationCard: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 100,
  },
  stationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  stationAddress: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 8,
  },
  stationCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  available: {
    backgroundColor: '#e8f5e8',
  },
  statusText: {
    fontSize: 14,
    color: '#2ECC71',
    fontWeight: '600',
  },
  stationCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    marginTop: 4,
  },
  tapToView: {
    fontSize: 14,
    color: '#2ECC71',
    fontWeight: '500',
    textAlign: 'center',
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
    marginBottom: 16,
    paddingBottom: 12,
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
  stationsList: {
    flex: 1,
    marginBottom: 16,
  },
  nearbyStationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  stationListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  stationListIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stationListInfo: {
    flex: 1,
  },
  stationListName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  stationListAddress: {
    fontSize: 13,
    color: '#666',
  },
  stationListMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stationListDistance: {
    fontSize: 14,
    color: '#2ECC71',
    fontWeight: '600',
  },
  menuActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});