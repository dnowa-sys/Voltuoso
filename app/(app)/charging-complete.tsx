// app/(app)/charging-complete.tsx - SIMPLE VERSION
import { StyleSheet, Text, View } from 'react-native';

export default function ChargingCompleteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Charging Complete</Text>
      <Text>Simple charging complete screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
