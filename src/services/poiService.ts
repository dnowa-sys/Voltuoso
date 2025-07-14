// src/services/poiService.ts
import { LocationData } from './locationService';

export interface POI {
  id: string;
  name: string;
  type: string;
  icon: string;
  location: LocationData;
  rating: number;
  distance: number; // miles from reference point
  address: string;
  isOpen?: boolean;
  hours?: string;
}

// Mock POI data for demonstration
const MOCK_POIS: Omit<POI, 'distance'>[] = [
  // Washington DC Area POIs
  {
    id: 'poi_1',
    name: 'Whole Foods Market',
    type: 'groceries',
    icon: '🛒',
    location: { latitude: 38.9061, longitude: -77.0364 },
    rating: 4.3,
    address: '1440 P St NW, Washington, DC',
    isOpen: true,
    hours: '8am - 10pm',
  },
  {
    id: 'poi_2', 
    name: 'The Kennedy Center',
    type: 'museum',
    icon: '🏛️',
    location: { latitude: 38.8971, longitude: -77.0562 },
    rating: 4.6,
    address: '2700 F St NW, Washington, DC',
    isOpen: true,
    hours: '10am - 9pm',
  },
  {
    id: 'poi_3',
    name: 'Starbucks',
    type: 'coffee',
    icon: '☕',
    location: { latitude: 38.9047, longitude: -77.0365 },
    rating: 4.1,
    address: '1501 Connecticut Ave NW, Washington, DC',
    isOpen: true,
    hours: '5:30am - 10pm',
  },
  {
    id: 'poi_4',
    name: 'Gold\'s Gym',
    type: 'gym',
    icon: '💪',
    location: { latitude: 38.9012, longitude: -77.0402 },
    rating: 4.0,
    address: '1120 20th St NW, Washington, DC',
    isOpen: true,
    hours: '5am - 11pm',
  },
  {
    id: 'poi_5',
    name: 'Meridian Hill Park',
    type: 'park',
    icon: '🌳',
    location: { latitude: 38.9238, longitude: -77.0365 },
    rating: 4.4,
    address: '16th St NW & Euclid St NW, Washington, DC',
    isOpen: true,
    hours: '6am - 10pm',
  },
  {
    id: 'poi_6',
    name: 'The Hamilton',
    type: 'restaurants',
    icon: '🍽️',
    location: { latitude: 38.8983, longitude: -77.0297 },
    rating: 4.2,
    address: '600 14th St NW, Washington, DC',
    isOpen: true,
    hours: '11:30am - 2am',
  },
  {
    id: 'poi_7',
    name: 'CVS Pharmacy',
    type: 'pharmacy',
    icon: '💊',
    location: { latitude: 38.9076, longitude: -77.0379 },
    rating: 3.8,
    address: '1199 Vermont Ave NW, Washington, DC',
    isOpen: true,
    hours: '8am - 10pm',
  },
  {
    id: 'poi_8',
    name: 'Dupont Circle Tennis Courts',
    type: 'tennis',
    icon: '🎾',
    location: { latitude: 38.9097, longitude: -77.0435 },
    rating: 4.0,
    address: 'Dupont Circle, Washington, DC',
    isOpen: true,
    hours: '6am - 9pm',
  },
  // Baltimore Area POIs
  {
    id: 'poi_9',
    name: 'Inner Harbor',
    type: 'park',
    icon: '🌳',
    location: { latitude: 39.2847, longitude: -76.6099 },
    rating: 4.5,
    address: '401 Light St, Baltimore, MD',
    isOpen: true,
    hours: '24/7',
  },
  {
    id: 'poi_10',
    name: 'National Aquarium',
    type: 'museum',
    icon: '🏛️',
    location: { latitude: 39.2853, longitude: -76.6083 },
    rating: 4.7,
    address: '501 E Pratt St, Baltimore, MD',
    isOpen: true,
    hours: '9am - 5pm',
  },
];

class POIService {
  private static instance: POIService;

  public static getInstance(): POIService {
    if (!POIService.instance) {
      POIService.instance = new POIService();
    }
    return POIService.instance;
  }

  /**
   * Find POIs near a location by activity types
   */
  async findNearbyPOIs(
    referenceLocation: LocationData,
    activityTypes: string[],
    maxDistance: number = 25
  ): Promise<POI[]> {
    try {
      // Calculate distances and filter by activity types and distance
      const poisWithDistance = MOCK_POIS
        .filter(poi => activityTypes.length === 0 || activityTypes.includes(poi.type))
        .map(poi => ({
          ...poi,
          distance: this.calculateDistance(
            referenceLocation.latitude,
            referenceLocation.longitude,
            poi.location.latitude,
            poi.location.longitude
          ),
        }))
        .filter(poi => poi.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance);

      return poisWithDistance;
    } catch (error) {
      console.error('Error finding nearby POIs:', error);
      return [];
    }
  }

  /**
   * Get POIs for all activity types (for suggestions)
   */
  async getAllPOITypes(): Promise<string[]> {
    const types = new Set(MOCK_POIS.map(poi => poi.type));
    return Array.from(types);
  }

  /**
   * Find POIs near charging stations
   */
  async findPOIsNearStations(
    stations: any[],
    activityTypes: string[],
    maxDistance: number = 5
  ): Promise<{ stationId: string; pois: POI[] }[]> {
    const results = [];

    for (const station of stations) {
      const pois = await this.findNearbyPOIs(
        { latitude: station.latitude, longitude: station.longitude },
        activityTypes,
        maxDistance
      );
      
      if (pois.length > 0) {
        results.push({
          stationId: station.id,
          pois: pois.slice(0, 5), // Limit to 5 POIs per station
        });
      }
    }

    return results;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get activity type display info
   */
  getActivityInfo(type: string): { name: string; icon: string } {
    const activityMap: Record<string, { name: string; icon: string }> = {
      restaurants: { name: 'Restaurants', icon: '🍽️' },
      bars: { name: 'Bars & Nightlife', icon: '🍻' },
      coffee: { name: 'Coffee Shops', icon: '☕' },
      shopping: { name: 'Shopping', icon: '🛍️' },
      groceries: { name: 'Groceries', icon: '🛒' },
      gym: { name: 'Gyms', icon: '💪' },
      spa: { name: 'Spas', icon: '🧘' },
      park: { name: 'Parks', icon: '🌳' },
      museum: { name: 'Museums', icon: '🏛️' },
      pharmacy: { name: 'Pharmacies', icon: '💊' },
      tennis: { name: 'Tennis Courts', icon: '🎾' },
      basketball: { name: 'Basketball Courts', icon: '🏀' },
      // Add more as needed
    };

    return activityMap[type] || { name: type, icon: '📍' };
  }

  /**
   * Format POI for display
   */
  formatPOI(poi: POI): string {
    const info = this.getActivityInfo(poi.type);
    return `${info.icon} ${poi.name} (${poi.distance.toFixed(1)} mi)`;
  }
}

// Export singleton instance
export const poiService = POIService.getInstance();