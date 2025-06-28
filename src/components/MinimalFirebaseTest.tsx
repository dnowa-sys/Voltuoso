// src/components/MinimalFirebaseTest.tsx
import { StyleSheet, Text, View } from 'react-native';

export function MinimalFirebaseTest() {
  const testImports = () => {
    try {
      // Test if we can access environment variables
      const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
      const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
      
      return {
        apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING',
        projectId: projectId || 'MISSING',
        status: (apiKey && projectId) ? '✅ Env vars found' : '❌ Env vars missing'
      };
    } catch (error: any) {
      return {
        apiKey: 'ERROR',
        projectId: 'ERROR', 
        status: `❌ Error: ${error.message}`
      };
    }
  };

  const result = testImports();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minimal Firebase Test</Text>
      <Text style={styles.status}>{result.status}</Text>
      <Text style={styles.detail}>API Key: {result.apiKey}</Text>
      <Text style={styles.detail}>Project ID: {result.projectId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#e3f2fd',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  detail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
});