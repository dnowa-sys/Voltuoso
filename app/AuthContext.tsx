// AuthContext.tsx
import {
    createUserWithEmailAndPassword,
    signOut as fbSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase"; // or Auth0 instance

type AuthContextType = {
  user: any;
  loading: boolean;
  signIn: (email: string, pw: string) => Promise<void>;
  signUp: (email: string, pw: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = (email: string, pw: string) =>
    signInWithEmailAndPassword(auth, email, pw);
  const signUp = (email: string, pw: string) =>
    createUserWithEmailAndPassword(auth, email, pw);
  const signOut = () => fbSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
