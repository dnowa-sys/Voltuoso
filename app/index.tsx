// app/index.tsx
import { Redirect } from 'expo-router';
import { LoadingSpinner } from '../src/components/LoadingSpinner';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Initializing..." />;
  }

  return <Redirect href={user ? "/(app)" : "/(auth)/login"} />;
}