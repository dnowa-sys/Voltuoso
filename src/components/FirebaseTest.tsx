// src/components/FirebaseTest.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../config/firebase';

export function FirebaseTest() {
  const [status, setStatus] = useState('Testing Firebase connection...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testFirebase();
  }, []);

  const testFirebase = async () => {
    try {
      // Test if Firebase auth is initialized
      console.log('Firebase Auth object:', auth);
      console.log('Firebase Auth app:', auth.app);
      console.log('Current user:', auth.currentUser);
      
      setStatus('✅ Firebase connected successfully!');
      setError(null);
    } catch (err: any) {
      console.error('Firebase test error:', err);
      setStatus('❌ Firebase connection failed');
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Test</Text>
      <Text style={styles.status}>{status}</Text>
      {error && <Text style={styles.error}>Error: {error}</Text>}
      
      <TouchableOpacity style={styles.button} onPress={testFirebase}>
        <Text style={styles.buttonText}>Test Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    fontSize: 14,
    color: 'red',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});