import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const Home = () => {
  const [location, setLocation] = useState<any>(null); // To store the location data
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // To store any error messages

  // Request location permissions and get the user's current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  // Error handling or display current location
  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg; // Show error if permission is denied
  } else if (location) {
    text = 'Location fetched successfully!';
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{text}</Text>

      {/* Display Map when location is available */}
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude, // User's latitude
            longitude: location.coords.longitude, // User's longitude
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Marker for user's current location */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            description="This is where you are currently."
          />
          {/* Marker for charging station (1900 Wyoming Ave NW, Washington, DC 20009) */}
          <Marker
            coordinate={{
              latitude: 38.9272, // Latitude for the given charging station
              longitude: -77.0579, // Longitude for the given charging station
            }}
            title="Charging Station"
            description="This is the default charging station."
          />
        </MapView>
      )}

      {/* Button to navigate to the profile screen */}
      <Button title="Go to Profile" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA', // Snow White background
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ECC71', // Emerald Green header
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '60%',
  },
});

export default Home;
