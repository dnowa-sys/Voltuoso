import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const Home = () => {
  const [region] = useState({
    latitude: 38.9176, // Default to Washington, DC
    longitude: -77.0372,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const navigation = useNavigation();

  useEffect(() => {
    // You can implement a function to get user location if granted
    // setRegion({...}); to update the region to the user's location
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        <Marker coordinate={{ latitude: 38.9176, longitude: -77.0372 }} />
      </MapView>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ChargingSessions')}
        >
          <Text>Charging Sessions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Referrals')}
        >
          <Text>Referrals</Text>
        </TouchableOpacity>
      </View>

      <Button title="See More" onPress={() => alert("More options")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  map: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#2ECC71',
    borderRadius: 5,
    textAlign: 'center',
  },
});

export default Home;
