// services/googleAuth.ts
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebase";

export async function signInWithGoogleAsync() {
  const [req, res, promptAsync] = Google.useAuthRequest({
    expoClientId: "FIREBASE_CLIENT_ID",
    iosClientId: "FIREBASE_CLIENT_ID",
    androidClientId: "FIREBASE_CLIENT_ID",
    scopes: ["profile","email"],
  });

  const result = await promptAsync();
  if (result.type === "success") {
    const { id_token } = result.params;
    const credential = GoogleAuthProvider.credential(id_token);
    return signInWithCredential(auth, credential);
  }
}
