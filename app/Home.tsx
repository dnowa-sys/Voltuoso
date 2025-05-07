import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const Home = () => {
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = 'Location fetched successfully!';
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Hi Daniel,</Text>
        <Text style={styles.subHeaderText}>Take a ride</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Get directions"
        />
      </View>

      {/* Map Display */}
      {location && (
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

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button
            title="Scan"
            onPress={() => {}}
            color="#F1C40F" // Lemon Yellow
          />
        </View>
        <View style={styles.button}>
          <Button
            title="Take a ride"
            onPress={() => {}}
            color="#2ECC71" // Emerald Green
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Snow White background
    padding: 20,
  },
  header: {
    paddingTop: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ECC71', // Emerald Green
  },
  subHeaderText: {
    fontSize: 20,
    color: '#2C3E50', // Slate Gray
  },
  searchContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  searchInput: {
    height: 50,
    borderColor: '#BDC3C7',
    borderWidth: 1,
    borderRadius: 25,
    paddingLeft: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF', // White background for input
  },
  map: {
    width: '100%',
    height: '60%',
    marginBottom: 20,
    borderRadius: 10, // Rounded corners for the map
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  button: {
    width: '40%',
  },
});

export default Home;
