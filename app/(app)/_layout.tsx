// app/(app)/_layout.tsx
import React from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { useAuth } from '../../src/context/AuthContext';

export default function AppTabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2ECC71',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { 
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: focused ? 'map' : 'map-outline',
            profile: focused ? 'person' : 'person-outline',
            settings: focused ? 'settings' : 'settings-outline',
            sessions: focused ? 'time' : 'time-outline',
          };
          
          return (
            <Ionicons
              name={icons[route.name] || 'apps-outline'}
              size={size}
              color={color}
            />
          );
        }
      })}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Map',
          tabBarLabel: 'Find Stations'
        }} 
      />
      <Tabs.Screen 
        name="sessions" 
        options={{ 
          title: 'Sessions',
          tabBarLabel: 'History'
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarLabel: 'Profile'
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          tabBarLabel: 'Settings'
        }} 
      />
    </Tabs>
  );
}
