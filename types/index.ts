// types/index.ts - COMPLETE TYPE DEFINITIONS
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  carType?: string;
  username?: string;
}

export interface Station {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  vicinity?: string;
  opening_hours?: {
    open_now: boolean;
  };
  photos?: {
    photo_reference: string;
  }[];
}

export interface ChargingSession {
  id: string;
  date: string;
  energy: number;
  cost: number;
  status: 'completed' | 'active' | 'failed';
  stationId: string;
  stationName: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}