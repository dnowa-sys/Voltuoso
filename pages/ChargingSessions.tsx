import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const ChargingSessionsPage: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Session 1: 2025-05-01 - 5 kWh</Text>
      <Text>Status: Completed</Text>
      <Text>Cost: $1.60</Text>
      <Button title="View Details" onPress={() => {}} />
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

export default ChargingSessionsPage;
