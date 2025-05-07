import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

const SplashScreenComponent = ({ navigation }) => {
  useEffect(() => {
    // Hide splash screen after 5 seconds
    setTimeout(() => {
      SplashScreen.hide();
      navigation.replace('Home');
    }, 5000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Voltuoso</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  text: {
    fontSize: 30,
    color: '#2ECC71',
  },
});

export default SplashScreenComponent;
