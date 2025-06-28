// app/(app)/transaction-history.tsx - SIMPLE VERSION
import { StyleSheet, Text, View } from 'react-native';

export default function TransactionHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      <Text>Simple transaction history screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});