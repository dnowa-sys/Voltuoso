// app/(app)/_layout.tsx - APP LAYOUT (PROTECTED ROUTES)
import { Redirect, Stack } from 'expo-router';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { useAuth } from '../../src/context/AuthContext';

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="sessions" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="charging-session" />
      <Stack.Screen name="charging-complete" />
      <Stack.Screen name="transaction-history" />
    </Stack>
  );
}