import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Input, Switch } from 'react-native-elements';

const Settings = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Input label="First Name" placeholder="Enter your first name" />
        <Input label="Last Name" placeholder="Enter your last name" />
        <Input label="Car Type" placeholder="Enter your car type" />
        <Input label="Username" placeholder="Enter your username" />
      </View>

      {/* Payment Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <Button title="Add Payment Method" onPress={() => {}} />
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Email Notifications</Text>
          <Switch value={true} onValueChange={() => {}} />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Push Notifications</Text>
          <Switch value={true} onValueChange={() => {}} />
        </View>
      </View>

      {/* Logout Button */}
      <Button title="Logout" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2C3E50',
  },
});

export default Settings;
