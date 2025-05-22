// services/googleAuth.ts
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./firebase";

export function useGoogleSignIn() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "FIREBASE_CLIENT_ID",
    iosClientId: "FIREBASE_CLIENT_ID",
    androidClientId: "FIREBASE_CLIENT_ID",
    scopes: ["profile", "email"],
  });

  const signIn = async () => {
    const result = await promptAsync();
    if (result.type === "success") {
      const { id_token } = result.params;
      const credential = GoogleAuthProvider.credential(id_token);
      return signInWithCredential(auth, credential);
    }
  };

  return { request, response, signIn };
}
