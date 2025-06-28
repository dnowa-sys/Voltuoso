// src/components/SimpleFirebaseTest.tsx
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function SimpleFirebaseTest() {
  const [status, setStatus] = useState('Initializing...');
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    const logs: string[] = [];
    
    try {
      // Test 1: Check environment variables
      logs.push('🔍 Checking environment variables...');
      const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
      const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
      const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
      
      if (!apiKey || !authDomain || !projectId) {
        logs.push('❌ Missing environment variables');
        logs.push(`API Key: ${apiKey ? 'Present' : 'MISSING'}`);
        logs.push(`Auth Domain: ${authDomain || 'MISSING'}`);
        logs.push(`Project ID: ${projectId || 'MISSING'}`);
        setStatus('❌ Configuration Error');
        setDetails(logs);
        return;
      }
      
      logs.push('✅ Environment variables found');
      logs.push(`Project ID: ${projectId}`);
      logs.push(`Auth Domain: ${authDomain}`);
      
      // Test 2: Try to import Firebase
      logs.push('🔍 Testing Firebase imports...');
      
      // Import Firebase modules - try alternative config first
      let auth, firebaseConfig;
      try {
        const altConfig = await import('../config/firebase-alt');
        auth = altConfig.auth;
        firebaseConfig = altConfig.firebaseConfig;
        logs.push('✅ Firebase modules imported from alternative config');
      } catch (altError: any) {
        logs.push(`⚠️ Alternative config failed: ${altError.message}`);
        const mainConfig = await import('../config/firebase');
        auth = mainConfig.auth;
        logs.push('✅ Firebase modules imported from main config');
      }
      
      // Test 3: Check Auth object
      logs.push('🔍 Testing Auth object...');
      if (auth) {
        logs.push('✅ Auth object exists');
        logs.push(`Auth app name: ${auth.app.name}`);
        logs.push(`Auth project: ${auth.app.options.projectId}`);
        
        if (firebaseConfig) {
          logs.push('🔍 Config being used:');
          logs.push(`- API Key: ${firebaseConfig.apiKey?.substring(0, 15)}...`);
          logs.push(`- Auth Domain: ${firebaseConfig.authDomain}`);
          logs.push(`- Project ID: ${firebaseConfig.projectId}`);
        }
        
        setStatus('✅ Firebase Connection Successful!');
      } else {
        logs.push('❌ Auth object is null');
        setStatus('❌ Auth Initialization Failed');
      }
      
    } catch (error: any) {
      logs.push(`❌ Error: ${error.message}`);
      setStatus('❌ Firebase Error');
      console.error('Firebase test error:', error);
    }
    
    setDetails(logs);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Connection Test</Text>
      <Text style={styles.status}>{status}</Text>
      
      <View style={styles.detailsContainer}>
        {details.map((detail, index) => (
          <Text key={index} style={styles.detail}>
            {detail}
          </Text>
        ))}
      </View>
      
      <TouchableOpacity style={styles.button} onPress={testFirebaseConnection}>
        <Text style={styles.buttonText}>Test Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#343a40',
  },
  status: {
    fontSize: 16,
    marginBottom: 15,
    fontWeight: '600',
    color: '#495057',
  },
  detailsContainer: {
    marginBottom: 15,
  },
  detail: {
    fontSize: 12,
    marginBottom: 3,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});