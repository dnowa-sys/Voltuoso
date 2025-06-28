import React, { createContext, useContext, useState } from 'react';

interface User {
  email: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    console.log('🔥 Mock sign in:', email);
    setLoading(true);
    
    setTimeout(() => {
      setUser({ email, id: 'mock-user-id' });
      setLoading(false);
      console.log('✅ Mock sign in successful');
    }, 1000);
  };

  const signOut = async () => {
    console.log('🔥 Mock sign out');
    setUser(null);
  };

  console.log('🔥 AuthProvider render - User:', user?.email || 'None', 'Loading:', loading);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
