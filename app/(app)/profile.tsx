import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error: any) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👤 Profile</Text>
      <Text style={styles.info}>Email: {user?.email}</Text>

      <View style={styles.buttonContainer}>
        <Button title="Log Out" onPress={handleLogout} color="#D7263D" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  info: { fontSize: 16, marginBottom: 24 },
  buttonContainer: { width: "60%" },
});
