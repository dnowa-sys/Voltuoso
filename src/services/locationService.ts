// src/services/locationService.ts
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

export interface Station {
  id: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

export class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationData | null = null;

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request location permissions from the user
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      // Check if location services are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings to use this feature.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Denied',
          'Location access is needed to show nearby charging stations and center the map on your location.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => Location.requestForegroundPermissionsAsync() 
            },
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Get the user's current location
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // 10 seconds
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      this.currentLocation = locationData;
      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your location settings and try again.',
        [{ text: 'OK' }]
      );
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Add distance information to stations based on current location
   */
  addDistanceToStations(stations: Station[]): Station[] {
    if (!this.currentLocation) {
      return stations;
    }

    return stations.map(station => ({
      ...station,
      distance: this.calculateDistance(
        this.currentLocation!.latitude,
        this.currentLocation!.longitude,
        station.latitude,
        station.longitude
      ),
    }));
  }

  /**
   * Sort stations by distance from current location
   */
  sortStationsByDistance(stations: Station[]): Station[] {
    return stations
      .filter(station => station.distance !== undefined)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  /**
   * Get cached current location
   */
  getCachedLocation(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Watch user location for real-time updates
   */
  async watchLocation(callback: (location: LocationData) => void): Promise<Location.LocationSubscription | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        return null;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 100, // Update when moved 100 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          
          this.currentLocation = locationData;
          callback(locationData);
        }
      );

      return subscription;
    } catch (error) {
      console.error('Error watching location:', error);
      return null;
    }
  }

  /**
   * Reverse geocoding to get address from coordinates
   */
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string | null> {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result.length > 0) {
        const address = result[0];
        const addressString = [
          address.streetNumber,
          address.street,
          address.city,
          address.region,
        ]
          .filter(Boolean)
          .join(' ');
        
        return addressString || null;
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Forward geocoding to get coordinates from address
   */
  async getCoordinatesFromAddress(address: string): Promise<LocationData | null> {
    try {
      const result = await Location.geocodeAsync(address);
      
      if (result.length > 0) {
        const location = result[0];
        return {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const locationService = LocationService.getInstance();