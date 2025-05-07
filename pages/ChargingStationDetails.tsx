import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

interface ChargingStationDetailsProps {
  route: {
    params: {
      stationId: number;
    };
  };
  navigation: any;
}

const ChargingStationDetails: React.FC<ChargingStationDetailsProps> = ({ route, navigation }) => {
  const { stationId } = route.params; // Get stationId from route params

  return (
    <View style={styles.container}>
      <Text>Charging Station ID: {stationId}</Text>
      <Text>Status: Available</Text>
      <Text>Power: 11.5 kWh</Text>
      <Text>Price: $0.32/kWh</Text>
      <Button title="Start Charging" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChargingStationDetails;
