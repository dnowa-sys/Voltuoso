// src/components/GooglePlacesSearchBar.tsx
// PREMIUM VERSION WITH GOOGLE PLACES AUTOCOMPLETE

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface GooglePlacesSearchBarProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  onLocationPress: () => void;
}

export function GooglePlacesSearchBar({
  onLocationSelect,
  onLocationPress,
}: GooglePlacesSearchBarProps) {
  const [placeholder, setPlaceholder] = useState('Search cities, businesses, addresses...');

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        onPress={(data, details = null) => {
          if (details) {
            const location = {
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              address: details.formatted_address,
            };
            onLocationSelect(location);
          }
        }}
        query={{
          key: 'YOUR_GOOGLE_PLACES_API_KEY', // Replace with your API key
          language: 'en',
          types: ['establishment', 'address', 'geocode'], // Include businesses, addresses, and general locations
          components: 'country:us', // Restrict to US (optional)
        }}
        fetchDetails={true}
        enablePoweredByContainer={false}
        styles={{
          container: styles.searchContainer,
          textInputContainer: styles.textInputContainer,
          textInput: styles.textInput,
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
        }}
        renderRightButton={() => (
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={onLocationPress}
            activeOpacity={0.7}
          >
            <Text style={styles.locationIcon}>📍</Text>
          </TouchableOpacity>
        )}
        textInputProps={{
          placeholderTextColor: '#999',
          returnKeyType: 'search',
          autoCorrect: false,
          autoCapitalize: 'none',
        }}
        debounce={300}
        minLength={2}
        nearbyPlacesAPI="GooglePlacesSearch"
        GooglePlacesSearchQuery={{
          rankby: 'distance',
        }}
        filterReverseGeocodingByTypes={[
          'locality',
          'administrative_area_level_3',
        ]}
        predefinedPlaces={[]}
        currentLocation={true}
        currentLocationLabel="Current location"
        enableHighAccuracyLocation={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  searchContainer: {
    flex: 0,
  },
  textInputContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    paddingVertical: 8,
  },
  listView: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  description: {
    fontSize: 16,
    color: '#333',
  },
  locationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginLeft: 8,
  },
  locationIcon: {
    fontSize: 16,
  },
});

// Installation instructions for Google Places:
// npm install react-native-google-places-autocomplete
// 
// Get API key from: https://console.cloud.google.com/
// Enable these APIs:
// - Places API
// - Geocoding API
// - Maps JavaScript API
//
// Google gives $200/month free credit which covers most development needs