// src/services/searchService.ts
import { LocationData, locationService } from './locationService';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  location: LocationData;
  type: 'address' | 'city' | 'business' | 'station';
}

export interface SearchOptions {
  includeStations?: boolean;
  maxResults?: number;
  countryCode?: string;
}

class SearchService {
  private static instance: SearchService;

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Search for locations using geocoding
   */
  async searchLocations(
    query: string, 
    stations: any[] = [],
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      includeStations = true,
      maxResults = 10,
      countryCode = 'US'
    } = options;

    if (!query.trim()) return [];

    const results: SearchResult[] = [];

    try {
      // 1. Search charging stations first (if enabled)
      if (includeStations) {
        const stationResults = this.searchStations(query, stations);
        results.push(...stationResults.slice(0, 3)); // Limit station results
      }

      // 2. Geocode the search query for locations
      const geocodeResults = await this.geocodeSearch(query);
      results.push(...geocodeResults.slice(0, maxResults - results.length));

      return results.slice(0, maxResults);
    } catch (error) {
      console.error('Search error:', error);
      return results; // Return station results even if geocoding fails
    }
  }

  /**
   * Search charging stations by name/address
   */
  private searchStations(query: string, stations: any[]): SearchResult[] {
    const lowercaseQuery = query.toLowerCase();
    
    return stations
      .filter(station => 
        station.name.toLowerCase().includes(lowercaseQuery) ||
        station.address.toLowerCase().includes(lowercaseQuery)
      )
      .map(station => ({
        id: `station_${station.id}`,
        title: station.name,
        subtitle: station.address,
        location: {
          latitude: station.latitude,
          longitude: station.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        type: 'station' as const,
      }));
  }

  /**
   * Geocode search query to find locations
   */
  private async geocodeSearch(query: string): Promise<SearchResult[]> {
    try {
      const location = await locationService.getCoordinatesFromAddress(query);
      
      if (location) {
        // Try to get a readable address for the result
        const address = await locationService.getAddressFromCoordinates(
          location.latitude, 
          location.longitude
        );

        return [{
          id: `geocode_${Date.now()}`,
          title: this.formatLocationTitle(query),
          subtitle: address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
          location,
          type: this.determineLocationType(query),
        }];
      }

      return [];
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  /**
   * Format the location title based on search query
   */
  private formatLocationTitle(query: string): string {
    // If it looks like a zip code
    if (/^\d{5}(-\d{4})?$/.test(query)) {
      return `ZIP Code ${query}`;
    }
    
    // If it looks like coordinates
    if (/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(query)) {
      return 'Coordinates';
    }
    
    // Otherwise, capitalize the query
    return query
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Determine the type of location based on query pattern
   */
  private determineLocationType(query: string): 'address' | 'city' | 'business' {
    // ZIP code pattern
    if (/^\d{5}(-\d{4})?$/.test(query)) {
      return 'address';
    }
    
    // If contains numbers, likely an address
    if (/\d/.test(query)) {
      return 'address';
    }
    
    // If single word or simple phrase, likely a city
    if (query.split(' ').length <= 2) {
      return 'city';
    }
    
    // Otherwise, assume business/POI
    return 'business';
  }

  /**
   * Get search suggestions (for autocomplete)
   */
  async getSearchSuggestions(
    query: string,
    stations: any[] = []
  ): Promise<string[]> {
    if (!query.trim() || query.length < 2) return [];

    const suggestions: string[] = [];

    // Add station name suggestions
    stations.forEach(station => {
      if (station.name.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push(station.name);
      }
      if (station.address.toLowerCase().includes(query.toLowerCase())) {
        const addressParts = station.address.split(',');
        if (addressParts.length > 1) {
          suggestions.push(addressParts[1].trim()); // Add city
        }
      }
    });

    // Add common location types
    const commonPlaces = [
      'Airport', 'Hospital', 'Mall', 'University', 'Hotel', 'Restaurant',
      'Gas Station', 'Walmart', 'Target', 'Starbucks', 'McDonald\'s'
    ];

    commonPlaces.forEach(place => {
      if (place.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push(place);
      }
    });

    // Remove duplicates and limit
    return [...new Set(suggestions)].slice(0, 5);
  }

  /**
   * Search for nearby places of interest
   */
  async searchNearbyPOI(
    location: LocationData,
    category: string = 'restaurant'
  ): Promise<SearchResult[]> {
    // This would integrate with Google Places API or similar
    // For now, return mock results
    const mockPOIs: SearchResult[] = [
      {
        id: 'poi_1',
        title: `${category} near you`,
        subtitle: 'Explore nearby locations',
        location,
        type: 'business',
      },
    ];

    return mockPOIs;
  }

  /**
   * Parse and validate coordinates from user input
   */
  parseCoordinates(input: string): LocationData | null {
    // Handle formats like "lat,lng" or "lat, lng"
    const coordPattern = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
    const match = input.match(coordPattern);
    
    if (match) {
      const latitude = parseFloat(match[1]);
      const longitude = parseFloat(match[2]);
      
      // Validate coordinate ranges
      if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
        return {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
      }
    }
    
    return null;
  }

  /**
   * Format distance for display
   */
  formatDistance(miles: number): string {
    if (miles < 0.1) return 'Less than 0.1 mi';
    if (miles < 1) return `${(miles * 5280).toFixed(0)} ft`;
    return `${miles.toFixed(1)} mi`;
  }

  /**
   * Search history management
   */
  private searchHistory: string[] = [];

  addToSearchHistory(query: string): void {
    if (!query.trim()) return;
    
    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(item => item !== query);
    
    // Add to beginning
    this.searchHistory.unshift(query);
    
    // Limit to 10 items
    this.searchHistory = this.searchHistory.slice(0, 10);
  }

  getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
  }
}

// Export singleton instance
export const searchService = SearchService.getInstance();