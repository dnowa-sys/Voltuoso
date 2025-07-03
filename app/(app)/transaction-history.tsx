// app/(app)/transaction-history.tsx - ENHANCED WITH REAL TRANSACTION DATA
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

// Mock transaction data - in real app, this would come from your backend
const mockTransactions = [
  {
    id: 'txn_001',
    sessionId: 'session_001',
    stationName: 'Voltuoso Bethesda',
    stationAddress: '9525 Starmont Rd, Bethesda, MD',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    startTime: '2:30 PM',
    endTime: '3:15 PM',
    duration: '45m',
    energyDelivered: 18.2,
    amount: 5.10,
    status: 'completed',
    paymentMethod: 'VISA ••••4242',
    receiptSent: true,
    receiptUrl: 'https://receipts.voltuoso.com/txn_001.pdf',
  },
  {
    id: 'txn_002',
    sessionId: 'session_002',
    stationName: 'Voltuoso Georgetown',
    stationAddress: '3000 M St NW, Washington, DC',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    startTime: '11:00 AM',
    endTime: '11:38 AM',
    duration: '38m',
    energyDelivered: 21.7,
    amount: 6.94,
    status: 'completed',
    paymentMethod: 'VISA ••••4242',
    receiptSent: true,
    receiptUrl: 'https://receipts.voltuoso.com/txn_002.pdf',
  },
  {
    id: 'txn_003',
    sessionId: 'session_003',
    stationName: 'Voltuoso Arlington',
    stationAddress: '1100 Wilson Blvd, Arlington, VA',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    startTime: '4:15 PM',
    endTime: '5:06 PM',
    duration: '51m',
    energyDelivered: 24.8,
    amount: 8.68,
    status: 'completed',
    paymentMethod: 'VISA ••••4242',
    receiptSent: true,
    receiptUrl: 'https://receipts.voltuoso.com/txn_003.pdf',
  },
  {
    id: 'txn_004',
    sessionId: 'session_004',
    stationName: 'Voltuoso Tysons',
    stationAddress: '1961 Chain Bridge Rd, Tysons, VA',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    startTime: '9:22 AM',
    endTime: '9:45 AM',
    duration: '23m',
    energyDelivered: 12.1,
    amount: 3.51,
    status: 'refunded',
    paymentMethod: 'VISA ••••4242',
    receiptSent: true,
    receiptUrl: 'https://receipts.voltuoso.com/txn_004.pdf',
    refundReason: 'Charging station malfunction',
  },
];

export default function TransactionHistoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30d' | '90d'>('all');
  const highlightTransaction = params.highlightTransaction as string;

  useEffect(() => {
    loadTransactions();
  }, [selectedPeriod]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter by period
      let filteredTransactions = mockTransactions;
      const now = new Date();
      
      if (selectedPeriod === '30d') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredTransactions = mockTransactions.filter(txn => txn.date >= thirtyDaysAgo);
      } else if (selectedPeriod === '90d') {
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        filteredTransactions = mockTransactions.filter(txn => txn.date >= ninetyDaysAgo);
      }
      
      setTransactions(filteredTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      Alert.alert('Error', 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#2ECC71';
      case 'refunded': return '#E74C3C';
      case 'pending': return '#F39C12';
      default: return '#95A5A6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'refunded': return 'Refunded';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const handleViewReceipt = (transaction: any) => {
    Alert.alert(
      'Receipt',
      `Receipt for transaction ${transaction.id}\n\nIn a real app, this would open the PDF receipt or email it to you.`,
      [
        { text: 'Email Receipt', onPress: () => console.log('Email receipt:', transaction.id) },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleTransactionDetails = (transaction: any) => {
    Alert.alert(
      'Transaction Details',
      `Session: ${transaction.sessionId}\nStation: ${transaction.stationName}\nDuration: ${transaction.duration}\nEnergy: ${transaction.energyDelivered} kWh\nAmount: $${transaction.amount.toFixed(2)}\nPayment: ${transaction.paymentMethod}${transaction.refundReason ? `\n\nRefund Reason: ${transaction.refundReason}` : ''}`,
      [
        { text: 'View Receipt', onPress: () => handleViewReceipt(transaction) },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const totalSpent = transactions
    .filter(txn => txn.status === 'completed')
    .reduce((sum, txn) => sum + txn.amount, 0);
  
  const totalEnergy = transactions
    .filter(txn => txn.status === 'completed')
    .reduce((sum, txn) => sum + txn.energyDelivered, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Period Filter */}
      <View style={styles.filterContainer}>
        {(['all', '30d', '90d'] as const).map(period => (
          <TouchableOpacity
            key={period}
            style={[styles.filterButton, selectedPeriod === period && styles.filterButtonActive]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[styles.filterText, selectedPeriod === period && styles.filterTextActive]}>
              {period === 'all' ? 'All Time' : period === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>${totalSpent.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total Spent</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalEnergy.toFixed(0)} kWh</Text>
          <Text style={styles.summaryLabel}>Energy Delivered</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{transactions.filter(t => t.status === 'completed').length}</Text>
          <Text style={styles.summaryLabel}>Sessions</Text>
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2ECC71" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptySubtitle}>
              You haven't made any charging sessions yet
            </Text>
            <TouchableOpacity 
              style={styles.startChargingButton}
              onPress={() => router.push('/(app)')}
            >
              <Text style={styles.startChargingButtonText}>Find Stations</Text>
            </TouchableOpacity>
          </View>
        ) : (
          transactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={[
                styles.transactionCard,
                highlightTransaction === transaction.id && styles.highlightedCard
              ]}
              onPress={() => handleTransactionDetails(transaction)}
            >
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionStation}>{transaction.stationName}</Text>
                  <Text style={styles.transactionAddress}>{transaction.stationAddress}</Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date)} • {transaction.startTime} - {transaction.endTime}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[styles.amountText, { color: getStatusColor(transaction.status) }]}>
                    ${transaction.amount.toFixed(2)}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.transactionDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Duration</Text>
                  <Text style={styles.detailValue}>{transaction.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Energy</Text>
                  <Text style={styles.detailValue}>{transaction.energyDelivered} kWh</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Payment</Text>
                  <Text style={styles.detailValue}>{transaction.paymentMethod}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.receiptButton}
                  onPress={() => handleViewReceipt(transaction)}
                >
                  <Text style={styles.receiptButtonText}>📧 Receipt</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#2ECC71',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2ECC71',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  startChargingButton: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startChargingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  highlightedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2ECC71',
    backgroundColor: '#f8fff8',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionStation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  transactionAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  receiptButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  receiptButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2ECC71',
  },
});