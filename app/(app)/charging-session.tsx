// app/(app)/charging-session.tsx - SIMPLE VERSION (NO COMPLEX DEPENDENCIES)
import { StyleSheet, Text, View } from 'react-native';

export default function ChargingSessionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Charging Session</Text>
      <Text>Simple charging session screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});