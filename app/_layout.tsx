// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="Home" />
      <Stack.Screen name="Settings" />
      <Stack.Screen name="Profile" />
      {/* Add other screens as needed */}
    </Stack>
  );
}