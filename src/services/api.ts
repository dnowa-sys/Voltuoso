// src/services/api.ts - FIXED
import Constants from 'expo-constants';
import { Coordinates, Station } from '../../types';

class ApiService {
  private apiKey: string;

  constructor() {
    this.apiKey = Constants.expoConfig?.extra?.GOOGLE_CLOUD_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Cloud API key not found');
    }
  }

  async searchStations(lat: number, lng: number, radius: number = 5000): Promise<Station[]> {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=electric_vehicle_charging_station&key=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  }

  async geocodeAddress(address: string): Promise<Coordinates | null> {
    if (!this.apiKey || !address.trim()) {
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.results?.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
    
    return null;
  }

  async getStationDetails(placeId: string): Promise<Station | null> {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${this.apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Station details request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result || null;
  }
}

export const apiService = new ApiService();