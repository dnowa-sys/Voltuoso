// src/components/EnvDebug.tsx
import Constants from 'expo-constants';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export function EnvDebug() {
  // Check different ways to access environment variables
  const envVars = {
    // Method 1: process.env (should work with EXPO_PUBLIC_ prefix)
    'process.env.EXPO_PUBLIC_FIREBASE_API_KEY': process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    'process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    'process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID': process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    
    // Method 2: Constants.expoConfig.extra (alternative access method)
    'Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY': Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY,
    
    // Method 3: Constants.manifest.extra (legacy method)
    'Constants.manifest?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY': Constants.manifest?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY,
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Environment Variables Debug</Text>
      
      <Text style={styles.sectionTitle}>📋 Variable Access Test:</Text>
      {Object.entries(envVars).map(([key, value]) => (
        <View key={key} style={styles.row}>
          <Text style={styles.key}>{key}:</Text>
          <Text style={styles.value}>
            {value ? `${String(value).substring(0, 20)}...` : '❌ UNDEFINED'}
          </Text>
        </View>
      ))}
      
      <Text style={styles.sectionTitle}>🔍 All process.env EXPO_PUBLIC_ vars:</Text>
      {Object.entries(process.env)
        .filter(([key]) => key.startsWith('EXPO_PUBLIC_FIREBASE'))
        .map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.key}>{key}:</Text>
            <Text style={styles.value}>
              {value ? `${String(value).substring(0, 15)}...` : '❌ UNDEFINED'}
            </Text>
          </View>
        ))}
      
      <Text style={styles.sectionTitle}>📱 Platform Info:</Text>
      <Text style={styles.info}>Platform: {Constants.platform?.ios ? 'iOS' : 'Other'}</Text>
      <Text style={styles.info}>App Version: {Constants.expoConfig?.version}</Text>
      <Text style={styles.info}>SDK Version: {Constants.expoConfig?.sdkVersion}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    margin: 10,
    borderRadius: 8,
    maxHeight: 400,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#343a40',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#495057',
  },
  row: {
    marginBottom: 5,
  },
  key: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6c757d',
  },
  value: {
    fontSize: 11,
    color: '#28a745',
    fontFamily: 'monospace',
    marginLeft: 10,
  },
  info: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 3,
  },
});