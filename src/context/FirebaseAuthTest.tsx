// src/components/FirebaseAuthTest.tsx
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function FirebaseAuthTest() {
  const [status, setStatus] = useState('Ready to test');
  const [details, setDetails] = useState<string[]>([]);

  const testFirebaseAuth = async () => {
    const logs: string[] = [];
    setStatus('Testing Firebase Auth...');
    
    try {
      // Test 1: Import Firebase Auth
      logs.push('🔍 Importing Firebase Auth...');
      const { auth } = await import('../config/firebase');
      logs.push('✅ Firebase Auth imported');
      
      // Test 2: Check Auth instance
      logs.push('🔍 Checking Auth instance...');
      if (auth) {
        logs.push('✅ Auth instance exists');
        logs.push(`Auth app: ${auth.app.name}`);
        logs.push(`Auth project: ${auth.app.options.projectId}`);
        logs.push(`Current user: ${auth.currentUser ? auth.currentUser.email : 'None'}`);
      } else {
        logs.push('❌ Auth instance is null');
        setStatus('❌ Auth instance failed');
        setDetails(logs);
        return;
      }
      
      // Test 3: Try to create a user (will fail but should give us better error info)
      logs.push('🔍 Testing Auth functionality...');
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      logs.push('✅ Auth functions imported');
      
      setStatus('✅ Firebase Auth working!');
      
    } catch (error: any) {
      logs.push(`❌ Error: ${error.message}`);
      logs.push(`Error code: ${error.code || 'unknown'}`);
      setStatus('❌ Firebase Auth failed');
      console.error('Firebase Auth test error:', error);
    }
    
    setDetails(logs);
  };

  const testAsyncStorage = async () => {
    const logs: string[] = [];
    setStatus('Testing AsyncStorage...');
    
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem('test', 'value');
      const value = await AsyncStorage.default.getItem('test');
      await AsyncStorage.default.removeItem('test');
      
      logs.push('✅ AsyncStorage working');
      logs.push(`Test value: ${value}`);
      setStatus('✅ AsyncStorage OK');
    } catch (error: any) {
      logs.push(`❌ AsyncStorage error: ${error.message}`);
      setStatus('❌ AsyncStorage failed');
    }
    
    setDetails(logs);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Auth Test</Text>
      <Text style={styles.status}>{status}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testFirebaseAuth}>
          <Text style={styles.buttonText}>Test Firebase Auth</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testAsyncStorage}>
          <Text style={styles.buttonText}>Test AsyncStorage</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.detailsContainer}>
        {details.map((detail, index) => (
          <Text key={index} style={styles.detail}>
            {detail}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff3cd',
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#856404',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#856404',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ffc107',
    padding: 8,
    borderRadius: 5,
    flex: 1,
  },
  buttonText: {
    color: '#212529',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 12,
  },
  detailsContainer: {
    marginTop: 10,
  },
  detail: {
    fontSize: 11,
    marginBottom: 2,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
});