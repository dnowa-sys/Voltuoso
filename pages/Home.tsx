import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const HomePage: React.FC = () => {
  const [region, setRegion] = useState({
    latitude: 38.9176, // Default to Washington, DC
    longitude: -77.0372,
    latitudeDelta: 0.0922,
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  });
  const navigation = useNavigation();

  useEffect(() => {
    // Optionally fetch user's location here and update `region`
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        <Marker
          coordinate={{ latitude: 38.9176, longitude: -77.0372 }}
          title="Charging Station 1"
          onPress={() => navigation.navigate('ChargingStationDetails', { stationId: 1 })}
        />
        <Marker
          coordinate={{ latitude: 38.9200, longitude: -77.0400 }}
          title="Charging Station 2"
          onPress={() => navigation.navigate('ChargingStationDetails', { stationId: 2 })}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default HomePage;
