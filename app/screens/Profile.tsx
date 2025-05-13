import React from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

const Profile: React.FC = () => {
  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "This functionality is coming soon!");
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This functionality is coming soon!");
  };

  const handlePaymentDetails = () => {
    Alert.alert("Payment Details", "This functionality is coming soon!");
  };

  // Placeholder profile data
  const profileData = {
    firstName: 'John',
    lastName: 'Doe',
    car: 'Tesla Model 3',
    username: 'johndoe123',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.profileText}>First Name: {profileData.firstName}</Text>
      <Text style={styles.profileText}>Last Name: {profileData.lastName}</Text>
      <Text style={styles.profileText}>Car: {profileData.car}</Text>
      <Text style={styles.profileText}>Username: {profileData.username}</Text>

      <Button title="Edit Profile" onPress={handleEditProfile} />
      <Button title="Delete Account" onPress={handleDeleteAccount} />
      <Button title="Payment Details" onPress={handlePaymentDetails} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default Profile;
