// app/index.tsx - CORRECTED VERSION
import { Redirect } from 'expo-router';
import { useEffect } from 'react'; // ← IMPORT useEffect from React
import { LoadingSpinner } from '../src/components/LoadingSpinner';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  // Optional: Add debugging (CORRECT way to use useEffect)
  useEffect(() => {
    console.log('🔥 Index loaded - User:', user?.email || 'No user', 'Loading:', loading);
  }, [user, loading]);

  if (loading) {
    return <LoadingSpinner message="Initializing..." />;
  }

  return <Redirect href={user ? "/(app)" : "/(auth)/login"} />;
}