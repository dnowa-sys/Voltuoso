// app/(app)/station-owner-dashboard.tsx - STATION OWNER DASHBOARD
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

// Mock data for station owner - in real app, this would come from your backend
const mockStationOwnerData = {
  ownerId: 'owner_001',
  stations: [
    {
      id: 'station_1',
      name: 'Voltuoso Bethesda',
      address: '9525 Starmont Rd, Bethesda, MD 20817',
      status: 'active',
      connectors: 4,
      revenue: 1247.82,
    },
    {
      id: 'station_2',
      name: 'Voltuoso Georgetown', 
      address: '3000 M St NW, Washington, DC 20007',
      status: 'active',
      connectors: 6,
      revenue: 892.45,
    },
  ],
};

const mockPendingAuthorizations = [
  {
    id: 'auth_001',
    userId: 'user_123',
    userEmail: 'john.doe@email.com',
    stationId: 'station_1',
    stationName: 'Voltuoso Bethesda',
    authorizedAmount: 15.50,
    paymentMethod: 'VISA ••••4242',
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    status: 'pending',
  },
  {
    id: 'auth_002',
    userId: 'user_456',
    userEmail: 'jane.smith@email.com',
    stationId: 'station_2', 
    stationName: 'Voltuoso Georgetown',
    authorizedAmount: 12.00,
    paymentMethod: 'MASTERCARD ••••5555',
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    status: 'pending',
  },
];

const mockTransactions = [
  {
    id: 'txn_001',
    userId: 'user_789',
    userEmail: 'daniel@voltuoso.com',
    stationId: 'station_1',
    stationName: 'Voltuoso Bethesda',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    amount: 8.45,
    ownerShare: 5.92, // 70% split
    energyDelivered: 18.2,
    duration: '45m',
    status: 'completed',
  },
  {
    id: 'txn_002', 
    userId: 'user_101',
    userEmail: 'user2@email.com',
    stationId: 'station_2',
    stationName: 'Voltuoso Georgetown',
    date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    amount: 12.30,
    ownerShare: 8.61, // 70% split
    energyDelivered: 25.1,
    duration: '52m',
    status: 'completed',
  },
  {
    id: 'txn_003',
    userId: 'user_202',
    userEmail: 'user3@email.com', 
    stationId: 'station_1',
    stationName: 'Voltuoso Bethesda',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    amount: 6.75,
    ownerShare: 4.73, // 70% split
    energyDelivered: 14.8,
    duration: '32m',
    status: 'completed',
  },
];

export default function StationOwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'transactions'>('overview');
  const [loading, setLoading] = useState(false);

  const totalRevenue = mockStationOwnerData.stations.reduce((sum, station) => sum + station.revenue, 0);
  const todayTransactions = mockTransactions.filter(txn => 
    txn.date.toDateString() === new Date().toDateString()
  );
  const todayRevenue = todayTransactions.reduce((sum, txn) => sum + txn.ownerShare, 0);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  const handleApproveAuthorization = (authId: string) => {
    Alert.alert(
      'Approve Authorization',
      'This would approve the pending payment authorization and allow the session to start.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => console.log('Approved:', authId) },
      ]
    );
  };

  const handleRejectAuthorization = (authId: string) => {
    Alert.alert(
      'Reject Authorization',
      'This would reject the payment and refund the customer.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => console.log('Rejected:', authId) },
      ]
    );
  };

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
        <Text style={styles.title}>Station Owner Dashboard</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['overview', 'pending', 'transactions'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'overview' ? 'Overview' : 
               tab === 'pending' ? `Pending (${mockPendingAuthorizations.length})` : 
               'Transactions'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <View style={styles.section}>
            {/* Revenue Overview */}
            <View style={styles.revenueContainer}>
              <View style={styles.revenueCard}>
                <Text style={styles.revenueValue}>{formatCurrency(todayRevenue)}</Text>
                <Text style={styles.revenueLabel}>Today's Revenue</Text>
              </View>
              <View style={styles.revenueCard}>
                <Text style={styles.revenueValue}>{formatCurrency(totalRevenue)}</Text>
                <Text style={styles.revenueLabel}>Total Revenue</Text>
              </View>
              <View style={styles.revenueCard}>
                <Text style={styles.revenueValue}>{mockPendingAuthorizations.length}</Text>
                <Text style={styles.revenueLabel}>Pending Auth</Text>
              </View>
            </View>

            {/* Station Overview */}
            <Text style={styles.sectionTitle}>Your Stations</Text>
            {mockStationOwnerData.stations.map(station => (
              <View key={station.id} style={styles.stationCard}>
                <View style={styles.stationHeader}>
                  <Text style={styles.stationName}>{station.name}</Text>
                  <Text style={[styles.stationStatus, { color: '#2ECC71' }]}>● Active</Text>
                </View>
                <Text style={styles.stationAddress}>{station.address}</Text>
                <View style={styles.stationStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{station.connectors}</Text>
                    <Text style={styles.statLabel}>Connectors</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formatCurrency(station.revenue)}</Text>
                    <Text style={styles.statLabel}>Total Revenue</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'pending' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Authorizations</Text>
            <Text style={styles.sectionSubtitle}>
              Review payment authorizations before charging sessions start
            </Text>
            
            {mockPendingAuthorizations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>⏳</Text>
                <Text style={styles.emptyTitle}>No Pending Authorizations</Text>
                <Text style={styles.emptySubtitle}>
                  New payment authorizations will appear here for review
                </Text>
              </View>
            ) : (
              mockPendingAuthorizations.map(auth => (
                <View key={auth.id} style={styles.authCard}>
                  <View style={styles.authHeader}>
                    <View style={styles.authInfo}>
                      <Text style={styles.authUser}>{auth.userEmail}</Text>
                      <Text style={styles.authStation}>{auth.stationName}</Text>
                      <Text style={styles.authTime}>
                        {formatTime(auth.createdAt)} • {auth.paymentMethod}
                      </Text>
                    </View>
                    <Text style={styles.authAmount}>
                      {formatCurrency(auth.authorizedAmount)}
                    </Text>
                  </View>
                  
                  <View style={styles.authActions}>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleRejectAuthorization(auth.id)}
                    >
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => handleApproveAuthorization(auth.id)}
                    >
                      <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'transactions' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <Text style={styles.sectionSubtitle}>
              Revenue split: 70% to you, 30% to Voltuoso
            </Text>
            
            {mockTransactions.map(transaction => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionUser}>{transaction.userEmail}</Text>
                    <Text style={styles.transactionStation}>{transaction.stationName}</Text>
                    <Text style={styles.transactionMeta}>
                      {transaction.date.toLocaleDateString()} • {transaction.duration} • {transaction.energyDelivered} kWh
                    </Text>
                  </View>
                  <View style={styles.transactionAmounts}>
                    <Text style={styles.totalAmount}>{formatCurrency(transaction.amount)}</Text>
                    <Text style={styles.ownerShare}>Your share: {formatCurrency(transaction.ownerShare)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2ECC71',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2ECC71',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  revenueContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 12,
  },
  revenueCard: {
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
  revenueValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  revenueLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  stationCard: {
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
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  stationStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  stationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  stationStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '500',
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
  },
  authCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  authHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authInfo: {
    flex: 1,
  },
  authUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  authStation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  authTime: {
    fontSize: 12,
    color: '#999',
  },
  authAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F39C12',
  },
  authActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#2ECC71',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: 'white',
    fontSize: 14,
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  transactionStation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmounts: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ownerShare: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ECC71',
  },
});