// app/(app)/payment.tsx - SIMPLE VERSION
import { StyleSheet, Text, View } from 'react-native';

export default function PaymentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>
      <Text>Simple payment screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});