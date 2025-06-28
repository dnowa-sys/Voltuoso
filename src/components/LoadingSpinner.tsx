import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface Props {
  message?: string;
}

export function LoadingSpinner({ message = "Loading..." }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2ECC71" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
