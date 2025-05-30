import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async () => {
    try {
      await signIn(email, pw);
      router.replace("/"); // Navigate to the main app
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.container}>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        onChangeText={setPw}
        value={pw}
      />
      <Button title="Login" onPress={onSubmit} />

      <TouchableOpacity
        style={styles.link}
        onPress={() => router.push("/(auth)/register")}
      >
        <Text style={styles.linkText}>Don&#39;t have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  error: { color: "red", marginBottom: 10, textAlign: "center" },
  link: { marginTop: 12, alignItems: "center" },
  linkText: { color: "#007AFF", fontSize: 14 },
});
