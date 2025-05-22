import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function StationDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🔌 Station Details</Text>
      <Text style={styles.info}>Station ID: {id}</Text>

      {/* Placeholder details */}
      <Text style={styles.info}>Charging Speed: 50 kW</Text>
      <Text style={styles.info}>Price: $0.25 / kWh</Text>

      <Button title="Back to Map" onPress={() => router.replace("/")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  info: { fontSize: 16, marginBottom: 8 },
});
