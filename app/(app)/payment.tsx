import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

export default function Payment() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Screen</Text>
      <Text style={styles.subtitle}>Sprint 2 - Under Development</Text>
      <Button 
        mode="contained" 
        onPress={() => router.push('/charging-session')}
        style={styles.button}
      >
        Test Charging Session
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  button: {
    marginVertical: 8,
    width: 200,
  },
});