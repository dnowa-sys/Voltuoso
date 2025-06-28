// app/station/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StationDetailScreen() {
  const { id, name, vicinity, rating, lat, lng } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>{name || 'Station Details'}</Text>
      <Text style={styles.detail}>Station ID: {id}</Text>
      <Text style={styles.detail}>Location: {vicinity || 'Unknown'}</Text>
      <Text style={styles.detail}>Rating: {rating || 'N/A'}</Text>
      
      {lat && lng && (
        <Text style={styles.detail}>
          Coordinates: {lat}, {lng}
        </Text>
      )}
      
      <TouchableOpacity style={styles.chargeButton}>
        <Text style={styles.chargeButtonText}>Start Charging</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: 40,
  },
  backText: {
    fontSize: 16,
    color: '#2ECC71',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  chargeButton: {
    backgroundColor: '#2ECC71',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  chargeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});