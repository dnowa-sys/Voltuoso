import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import HomePage from './pages/Home'; // Your Home screen component
import ProfilePage from './pages/Profile'; // Profile screen component

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    // Simulate a network request or initialization before showing the app
    setTimeout(() => {
      setIsReady(true);
      SplashScreen.hideAsync();
    }, 3000);  // Display the splash screen for 3 seconds
  }, []);

  if (!isReady) {
    return null; // Return nothing while the splash screen is visible
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home" // Set a default screen
        screenOptions={{
          tabBarActiveTintColor: '#2ECC71', // Customize the active tab color
          tabBarInactiveTintColor: '#BDC3C7', // Customize the inactive tab color
          tabBarStyle: { backgroundColor: '#FAFAFA' }, // Customize the tab bar background color
        }}
      >
        <Tab.Screen name="Home" component={HomePage} />
        <Tab.Screen name="Profile" component={ProfilePage} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
