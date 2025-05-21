// screens/SignIn.tsx
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useAuth } from "../../src/AuthContext";

export default function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async () => {
    try {
      await signIn(email, pw);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <View>
      {!!error && <Text style={{ color: "red" }}>{error}</Text>}
      <TextInput placeholder="Email" value={email} onChangeText={setEmail}/>
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={pw}
        onChangeText={setPw}
      />
      <Button title="Sign In" onPress={onSubmit} />
    </View>
  );
}
