import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from 'react-native-paper';

export default function ChargingSession() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Charging Session</Text>
          <Text style={styles.subtitle}>Sprint 2 - Under Development</Text>
          <Text style={styles.info}>
            This screen will control your charging session with real-time updates.
          </Text>
          
          {params.stationName && (
            <Text style={styles.param}>
              Station: {params.stationName}
            </Text>
          )}
        </Card.Content>
      </Card>
      
      <Button 
        mode="contained" 
        onPress={() => router.push('/charging-complete')}
        style={styles.button}
      >
        Test Complete Screen
      </Button>
      
      <Button 
        mode="outlined" 
        onPress={() => router.back()}
        style={styles.button}
      >
        Go Back
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 32,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  param: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
  button: {
    marginVertical: 8,
    width: 200,
  },
});