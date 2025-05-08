// File: app/Home.tsx
import { config } from 'dotenv';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import 'react-native-get-random-values'; // Necessary for some packages like `uuid`
import MapView, { Marker } from 'react-native-maps';
config(); // This loads the .env file

const Home = () => {
  const [location, setLocation] = useState<any>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        await fetchChargingStations(loc.coords.latitude, loc.coords.longitude);
      } catch (e) {
        setErrorMsg('Error fetching location');
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, []);

  const fetchChargingStations = async (latitude: number, longitude: number) => {
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    const radius = 5000; // meters
    const type = 'electric_vehicle_charging_station';
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results) setStations(data.results);
    } catch {
      setErrorMsg('Failed to fetch charging stations');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2ECC71" />
        <Text>Fetching your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full‑screen Map */}
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation
        >
          {/* User Location */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            description="You are here"
          />
          {/* Nearby Charging Stations */}
          {stations.map((station, index) => (
            <Marker
              key={`station-${index}`}
              coordinate={{
                latitude: station.geometry.location.lat,
                longitude: station.geometry.location.lng,
              }}
              title={station.name}
              description={station.vicinity}
            />
          ))}
        </MapView>
      )}

      {/* Search Bar Overlay */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Get directions"
          placeholderTextColor="#666"
        />
      </View>

      {/* Bottom Tab Placeholder */}
      <View style={styles.bottomTab}>
        <Text style={styles.bottomTabText}>See More</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchBarContainer: {
    position: 'absolute',
    top: 40,
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  searchInput: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: '#BDC3C7',
    borderWidth: 1,
  },
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2C3E50',
    paddingVertical: 15,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomTabText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
