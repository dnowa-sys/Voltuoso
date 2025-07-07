// app/(app)/index.tsx - FIXED VERSION WITH PROPER MAP ANIMATION
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { EnhancedSearchBar } from '../../src/components/EnhancedSearchBar';
import { FilterPanel, FilterState } from '../../src/components/FilterPanel';
import { SearchResultsList } from '../../src/components/SearchResultsList';
import { useAuth } from '../../src/context/AuthContext';
import { LocationData, locationService } from '../../src/services/locationService';
import { SearchResult, searchService } from '../../src/services/searchService';

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
    distance: 2.3,
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
    distance: 8.1,
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
    distance: 5.7,
  },
  {
    id: 'station_4',
    name: 'Voltuoso Tysons',
    address: '1961 Chain Bridge Rd, Tysons, VA 22102',
    latitude: 38.9186,
    longitude: -77.2286,
    status: 'available',
    connectorType: 'CCS',
    maxPower: 75,
    pricePerKwh: 0.29,
    availableConnectors: 4,
    totalConnectors: 4,
    distance: 12.4,
  },
];

export default function MapHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentSearchLocation, setCurrentSearchLocation] = useState<LocationData | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    availability: 'all',
    chargingSpeed: 'all',
    maxDistance: 25,
  });
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 38.9072, // Washington DC area
    longitude: -77.0369,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [stationsWithDistance, setStationsWithDistance] = useState(chargingStations);

  // Filter and search logic using useMemo for performance
  const filteredStations = useMemo(() => {
    let stations = stationsWithDistance;

    // Apply availability filter
    if (filters.availability !== 'all') {
      stations = stations.filter(station => station.status === filters.availability);
    }

    // Apply charging speed filter
    if (filters.chargingSpeed !== 'all') {
      stations = stations.filter(station => {
        const power = station.maxPower;
        switch (filters.chargingSpeed) {
          case 'fast': return power > 100;
          case 'normal': return power >= 50 && power <= 100;
          case 'slow': return power < 50;
          default: return true;
        }
      });
    }

    // Apply distance filter
    stations = stations.filter(station => (station.distance || 0) <= filters.maxDistance);

    return stations;
  }, [filters, stationsWithDistance]);

  useEffect(() => {
    // Initialize location service and get current location
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        const newRegion = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setMapRegion(newRegion);
        updateStationsWithDistance(location);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      // Use default location if geolocation fails
      updateStationsWithDistance(mapRegion);
    }
  };

  const updateStationsWithDistance = (referenceLocation: LocationData) => {
    const stationsWithDist = chargingStations.map(station => ({
      ...station,
      distance: locationService.calculateDistance(
        referenceLocation.latitude,
        referenceLocation.longitude,
        station.latitude,
        station.longitude
      ),
    })).sort((a, b) => a.distance - b.distance); // Sort by distance

    setStationsWithDistance(stationsWithDist);
  };

  const animateToLocation = (location: LocationData, zoomLevel: 'city' | 'local' | 'close' = 'local') => {
    const deltaValues = {
      city: { latitudeDelta: 0.2, longitudeDelta: 0.2 },
      local: { latitudeDelta: 0.05, longitudeDelta: 0.05 },
      close: { latitudeDelta: 0.01, longitudeDelta: 0.01 },
    };

    const newRegion: Region = {
      latitude: location.latitude,
      longitude: location.longitude,
      ...deltaValues[zoomLevel],
    };

    console.log('🗺️ Animating to location:', newRegion);
    
    // Update state
    setMapRegion(newRegion);
    
    // Animate map with ref
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  const centerOnUserLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        animateToLocation(location, 'local');
        setCurrentSearchLocation(null); // Clear search location
        updateStationsWithDistance(location);
        setSearchQuery(''); // Clear search
        Alert.alert('Location Updated', 'Map centered on your current location');
      } else {
        Alert.alert('Location Error', 'Unable to get your current location');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Location Error', 'Failed to get location. Please check your settings.');
    }
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    
    // If there are search results, select the first one
    if (searchResults.length > 0) {
      handleLocationSelect(searchResults[0]);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    // Hide search results when query is cleared
    if (!query.trim()) {
      setShowSearchResults(false);
      setCurrentSearchLocation(null);
      setSearchResults([]);
      // Reset to user location if available
      updateStationsWithDistance(mapRegion);
    }
  };

  // Search effect
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const results = await searchService.searchLocations(searchQuery, chargingStations, {
            includeStations: true,
            maxResults: 8,
          });
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleLocationSelect = (result: SearchResult) => {
    console.log('📍 Location selected:', result.title);
    console.log('📍 Coordinates:', result.location);
    
    // Determine zoom level based on search type
    let zoomLevel: 'city' | 'local' | 'close' = 'local';
    if (result.type === 'city') {
      zoomLevel = 'city';
    } else if (result.type === 'station') {
      zoomLevel = 'close';
    }

    // Animate to the selected location
    animateToLocation(result.location, zoomLevel);

    // Set as current search location for distance calculations
    setCurrentSearchLocation(result.location);
    
    // Update stations with distances from this location
    updateStationsWithDistance(result.location);
    
    // Close any open search results
    setShowSearchResults(false);
    
    // Show success message
    Alert.alert(
      'Location Found! 🎯',
      `Now showing charging stations near ${result.title}`,
      [{ text: 'OK' }]
    );
  };

  const handleSearchResultSelect = (station: any) => {
    // Animate map to selected station
    animateToLocation({
      latitude: station.latitude,
      longitude: station.longitude,
    }, 'close');
    
    // Select the station
    setSelectedStation(station);
    setShowSearchResults(false);
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'available': return '#2ECC71';
      case 'in_use': return '#F39C12';
      case 'offline': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const handleStationPress = (station: any) => {
    setSelectedStation(station);
    setShowSearchResults(false); // Close search results if open
    
    // Animate to station
    animateToLocation({
      latitude: station.latitude,
      longitude: station.longitude,
    }, 'close');
  };

  const startCharging = (station: any) => {
    if (station.status !== 'available') {
      Alert.alert('Station Unavailable', 'This station is currently in use or offline.');
      return;
    }

    // Navigate to charging session with station details
    router.push({
      pathname: '/(app)/charging-session',
      params: {
        stationId: station.id,
        stationName: station.name,
        stationAddress: station.address,
        pricePerKwh: station.pricePerKwh.toString(),
        maxPower: station.maxPower.toString(),
      },
    });
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    value !== 'all' && value !== 25
  ).length;

  const getLocationSubtitle = () => {
    if (currentSearchLocation) {
      return `${filteredStations.length} station${filteredStations.length !== 1 ? 's' : ''} near search location`;
    }
    return `${filteredStations.length} station${filteredStations.length !== 1 ? 's' : ''} nearby`;
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChangeComplete={(region) => {
          // Update region state when map is manually moved
          setMapRegion(region);
        }}
      >
        {filteredStations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            title={station.name}
            description={`${station.availableConnectors}/${station.totalConnectors} available • $${station.pricePerKwh}/kWh • ${station.distance.toFixed(1)} mi`}
            pinColor={getMarkerColor(station.status)}
            onPress={() => handleStationPress(station)}
          />
        ))}
        
        {/* Search location marker */}
        {currentSearchLocation && (
          <Marker
            coordinate={{
              latitude: currentSearchLocation.latitude,
              longitude: currentSearchLocation.longitude,
            }}
            title="Search Location"
            description={searchQuery}
            pinColor="#007AFF"
          />
        )}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hello, {user?.email?.split('@')[0]}</Text>
          <Text style={styles.subtitle}>{getLocationSubtitle()}</Text>
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

      {/* Enhanced Search Bar */}
      <EnhancedSearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onLocationSelect={handleLocationSelect}
        stations={chargingStations}
      />

      {/* Filter Button */}
      <TouchableOpacity
        style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
        onPress={() => setShowFilters(true)}
      >
        <Text style={styles.filterIcon}>⚙️</Text>
        {activeFilterCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Floating Location Button */}
      <TouchableOpacity
        style={styles.floatingLocationButton}
        onPress={centerOnUserLocation}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingLocationIcon}>📍</Text>
      </TouchableOpacity>

      {/* Search Location Indicator */}
      {currentSearchLocation && (
        <View style={styles.searchLocationIndicator}>
          <Text style={styles.searchLocationText}>
            📍 Showing stations near: {searchQuery}
          </Text>
          <TouchableOpacity 
            onPress={() => {
              setCurrentSearchLocation(null);
              setSearchQuery('');
              updateStationsWithDistance(mapRegion);
            }}
            style={styles.resetLocationButton}
          >
            <Text style={styles.resetLocationText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Location Buttons */}
      <View style={styles.quickLocationButtons}>
        <TouchableOpacity 
          style={styles.quickButton}
          onPress={() => {
            const dcLocation = { latitude: 38.9072, longitude: -77.0369 };
            handleLocationSelect({
              id: 'quick_dc',
              title: 'Washington DC',
              subtitle: 'Nation\'s Capital',
              location: dcLocation,
              type: 'city'
            });
          }}
        >
          <Text style={styles.quickButtonText}>🏛️ DC</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickButton}
          onPress={() => {
            const baltimoreLocation = { latitude: 39.2904, longitude: -76.6122 };
            handleLocationSelect({
              id: 'quick_baltimore',
              title: 'Baltimore',
              subtitle: 'Maryland',
              location: baltimoreLocation,
              type: 'city'
            });
          }}
        >
          <Text style={styles.quickButtonText}>🦀 BAL</Text>
        </TouchableOpacity>
      </View>

      {/* Search Results List */}
      <SearchResultsList
        stations={filteredStations}
        searchQuery={searchQuery}
        isVisible={showSearchResults}
        onStationSelect={handleSearchResultSelect}
        onClose={() => setShowSearchResults(false)}
      />

      {/* Station Info Card */}
      {selectedStation && !showSearchResults && (
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
                {selectedStation.distance && (
                  <>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.stationMetaText}>
                      {selectedStation.distance.toFixed(1)} mi
                    </Text>
                  </>
                )}
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

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        isVisible={showFilters}
        onClose={() => setShowFilters(false)}
      />

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
  filterButton: {
    position: 'absolute',
    top: 180,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  filterButtonActive: {
    backgroundColor: '#2ECC71',
  },
  filterIcon: {
    fontSize: 20,
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  floatingLocationButton: {
    position: 'absolute',
    bottom: 160,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingLocationIcon: {
    fontSize: 24,
  },
  searchLocationIndicator: {
    position: 'absolute',
    top: 240,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchLocationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  resetLocationButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetLocationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  quickLocationButtons: {
    position: 'absolute',
    top: 240,
    right: 80,
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
    flexWrap: 'wrap',
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
    paddingBottom: 34,
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