// app/(app)/sessions.tsx - CLEAN VERSION
import { StyleSheet, Text, View } from 'react-native';

export default function SessionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sessions History</Text>
      <Text>Your charging sessions will appear here</Text>
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
    marginBottom: 20,
    color: '#333',
  },
});