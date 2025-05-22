// app/SplashScreen.tsx
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Prevent the native splash screen from auto‑hiding
SplashScreen.preventAutoHideAsync();

const SplashScreenComponent = ({ navigation }) => {
  useEffect(() => {
    // Hide after 5 seconds, then navigate
    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
      navigation.replace('Home');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Voltuoso</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  text:      { fontSize: 30, color: '#2ECC71' },
});

export default SplashScreenComponent;
