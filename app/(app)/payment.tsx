// app/(app)/payment.tsx - WITH STRIPE INTEGRATION
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PaymentMethodsScreen } from '../../src/components/PaymentMethodsScreen';

export default function PaymentScreen() {
  return (
    <View style={styles.container}>
      <PaymentMethodsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 50, // Account for status bar
  },
});