// File: app/Home.tsx
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const Home = () => {
  const [location, setLocation] = useState<any>(null);
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

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setLoading(false);
    };

    fetchLocation();
  }, []);

  // Show loading indicator while fetching location
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
      {/* Map Display */}
      {location && !loading && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            description="This is where you are currently."
          />
        </MapView>
      )}

      {/* Search Bar Overlaying the Map */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Get directions"
        />
      </View>

      {/* Bottom Tab Menu (Placeholder for now) */}
      <View style={styles.bottomTab}>
        <Text style={styles.bottomTabText}>See More</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Snow White background
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
    zIndex: 1, // Ensure search bar stays above map
  },
  searchInput: {
    height: 50,
    borderColor: '#BDC3C7',
    borderWidth: 1,
    borderRadius: 25,
    paddingLeft: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2C3E50', // Slate Gray
    padding: 15,
    alignItems: 'center',
    borderTopLeftRadius: 20, // Rounded corners on the top
    borderTopRightRadius: 20, // Rounded corners on the top
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
