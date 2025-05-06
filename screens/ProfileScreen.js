import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const Profile = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      <Text>Name: John Doe</Text>
      <Text>Car: Tesla Model 3</Text>
      <Text>Username: johndoe</Text>
      <Button title="Edit Profile" onPress={() => alert("Edit Profile")} />
      <Button title="Delete Account" onPress={() => alert("Delete Account")} />
      <Button title="Payment Details" onPress={() => alert("Payment Details")} />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
});

export default Profile;
