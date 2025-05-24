// App.tsx
import { Slot } from 'expo-router';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}