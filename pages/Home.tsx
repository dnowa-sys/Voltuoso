import { useNavigation } from '@react-navigation/native'; // Import the navigation hook
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const HomePage: React.FC = () => {
  // Access the navigation prop from the hook
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text>Welcome to Voltuoso</Text>
      {/* On button press, navigate to the Profile screen */}
      <Button title="Go to Profile" onPress={() => navigation.navigate('Profile')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomePage;
