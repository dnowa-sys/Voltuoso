import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const ProfilePage: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>First Name: John</Text>
      <Text>Last Name: Doe</Text>
      <Text>Car: Tesla Model 3</Text>
      <Text>Username: johndoe</Text>
      <Button title="Edit Profile" onPress={() => {}} />
      <Button title="Delete Account" onPress={() => {}} />
      <Button title="Payment Details" onPress={() => {}} />
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

export default ProfilePage;
