// app/(app)/transaction-history.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator, Button, Card, Chip, FAB, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Transaction } from '../../src/types/payment';

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: 'tx_001',
    userId: 'user123',
    stationId: 'station_001',
    stationName: 'SuperCharger Station A',
    amount: 2450, // $24.50
    currency: 'usd',
    status: 'succeeded',
    paymentMethodId: 'pm_visa_4242',
    energyDelivered: 35.2,
    sessionStartTime: new Date(Date.now() - 3600000), // 1 hour ago
    sessionEndTime: new Date(Date.now() - 1800000), // 30 min ago
    createdAt: new Date(Date.now() - 3600000),
    receiptSent: true,
  },
  {
    id: 'tx_002',
    userId: 'user123',
    stationId: 'station_002',
    stationName: 'Fast Charge Hub',
    amount: 1825, // $18.25
    currency: 'usd',
    status: 'succeeded',
    paymentMethodId: 'pm_mastercard_5555',
    energyDelivered: 26.1,
    sessionStartTime: new Date(Date.now() - 86400000 * 2), // 2 days ago
    sessionEndTime: new Date(Date.now() - 86400000 * 2 + 2700000), // 45 min session
    createdAt: new Date(Date.now() - 86400000 * 2),
    receiptSent: true,
  },
  {
    id: 'tx_003',
    userId: 'user123',
    stationId: 'station_003',
    stationName: 'Downtown Charging Point',
    amount: 3200, // $32.00
    currency: 'usd',
    status: 'pending',
    paymentMethodId: 'pm_visa_4242',
    energyDelivered: 45.7,
    createdAt: new Date(Date.now() - 1800000), // 30 min ago
    receiptSent: false,
  },
  {
    id: 'tx_004',
    userId: 'user123',
    stationId: 'station_004',
    stationName: 'Mall Charging Station',
    amount: 950, // $9.50
    currency: 'usd',
    status: 'failed',
    paymentMethodId: 'pm_visa_4242',
    energyDelivered: 0,
    createdAt: new Date(Date.now() - 86400000 * 7), // 1 week ago
    receiptSent: false,
  },
  {
    id: 'tx_005',
    userId: 'user123',
    stationId: 'station_001',
    stationName: 'SuperCharger Station A',
    amount: 2100, // $21.00
    currency: 'usd',
    status: 'refunded',
    paymentMethodId: 'pm_mastercard_5555',
    energyDelivered: 30.0,
    sessionStartTime: new Date(Date.now() - 86400000 * 14), // 2 weeks ago
    sessionEndTime: new Date(Date.now() - 86400000 * 14 + 3600000), // 1 hour session
    createdAt: new Date(Date.now() - 86400000 * 14),
    receiptSent: true,
    refundedAt: new Date(Date.now() - 86400000 * 12),
  },
];

export default function TransactionHistory() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'succeeded' | 'pending' | 'failed' | 'refunded'>('all');

  // Mock user data - in real app, get from auth context
  const userId = 'user123';
  const userType = 'customer'; // or 'station_owner'

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, filter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, this would call your payment service
      setTransactions(mockTransactions);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(transaction =>
        transaction.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'succeeded':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      case 'refunded':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'succeeded':
        return 'check-circle';
      case 'pending':
        return 'access-time';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'undo';
      default:
        return 'help';
    }
  };

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (start?: Date, end?: Date) => {
    if (!start || !end) return 'N/A';
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.round(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const handleViewDetails = (transaction: Transaction) => {
    router.push({
      pathname: '/transaction-details',
      params: {
        transactionId: transaction.id,
      }
    });
  };

  const handleResendReceipt = async (transactionId: string) => {
    Alert.alert('Receipt Sent!', 'A receipt has been sent to your email address.');
    
    // Update the transaction to show receipt sent
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, receiptSent: true }
          : tx
      )
    );
  };

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      {(['all', 'succeeded', 'pending', 'failed', 'refunded'] as const).map((filterOption) => (
        <Chip
          key={filterOption}
          selected={filter === filterOption}
          onPress={() => setFilter(filterOption)}
          style={[
            styles.filterChip,
            filter === filterOption && styles.selectedFilterChip
          ]}
          textStyle={[
            styles.filterChipText,
            filter === filterOption && styles.selectedFilterChipText
          ]}
        >
          {filterOption === 'all' ? 'All' : filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
        </Chip>
      ))}
    </View>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity onPress={() => handleViewDetails(item)}>
      <Card style={styles.transactionCard}>
        <Card.Content>
          <View style={styles.transactionHeader}>
            <View style={styles.stationInfo}>
              <Text style={styles.stationName}>{item.stationName}</Text>
              <Text style={styles.transactionId}>ID: {item.id.slice(-8)}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Icon
                name={getStatusIcon(item.status)}
                size={20}
                color={getStatusColor(item.status)}
              />
              <Chip
                mode="outlined"
                textStyle={[styles.statusText, { color: getStatusColor(item.status) }]}
                style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
              >
                {item.status.toUpperCase()}
              </Chip>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
            {item.energyDelivered && item.energyDelivered > 0 && (
              <Text style={styles.energy}>{item.energyDelivered.toFixed(1)} kWh</Text>
            )}
          </View>

          <View style={styles.sessionDetails}>
            <Text style={styles.sessionTime}>{formatDate(item.createdAt)}</Text>
            {item.sessionStartTime && item.sessionEndTime && (
              <Text style={styles.duration}>
                Duration: {calculateDuration(item.sessionStartTime, item.sessionEndTime)}
              </Text>
            )}
          </View>

          {item.status === 'succeeded' && !item.receiptSent && (
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() => handleResendReceipt(item.id)}
                style={styles.actionButton}
                compact
              >
                Send Receipt
              </Button>
            </View>
          )}

          {item.refundedAt && (
            <Text style={styles.refundText}>
              Refunded: {formatDate(item.refundedAt)}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  const totalSpent = transactions
    .filter(t => t.status === 'succeeded')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEnergy = transactions
    .filter(t => t.status === 'succeeded')
    .reduce((sum, t) => sum + (t.energyDelivered || 0), 0);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search transactions..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {renderFilterChips()}

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Your Charging Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatAmount(totalSpent)}</Text>
              <Text style={styles.summaryLabel}>Total Spent</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalEnergy.toFixed(1)} kWh</Text>
              <Text style={styles.summaryLabel}>Energy Consumed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{transactions.length}</Text>
              <Text style={styles.summaryLabel}>Sessions</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="receipt" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Start charging to see your transaction history!'
              }
            </Text>
            <Button 
              mode="outlined" 
              onPress={() => router.push('/')}
              style={styles.findStationsButton}
            >
              Find Charging Stations
            </Button>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/payment')}
        label="New Session"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: 'white',
  },
  selectedFilterChip: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  summaryCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  transactionCard: {
    marginBottom: 12,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  transactionId: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  energy: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  sessionDetails: {
    marginBottom: 8,
  },
  sessionTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    marginTop: 8,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  refundText: {
    fontSize: 12,
    color: '#9C27B0',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  findStationsButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
  },
});