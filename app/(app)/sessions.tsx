// app/(app)/sessions.tsx - FIXED
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChargingSession } from '../../types';

const mockSessions: ChargingSession[] = [
  {
    id: '1',
    date: '2025-06-04T14:30:00Z',
    energy: 45.2,
    cost: 14.46,
    status: 'completed',
    stationId: 'station_1',
    stationName: 'Tesla Supercharger - Downtown',
  },
  {
    id: '2',
    date: '2025-06-02T09:15:00Z',
    energy: 32.8,
    cost: 10.50,
    status: 'completed',
    stationId: 'station_2',
    stationName: 'ChargePoint - Mall Parking',
  },
  {
    id: '3',
    date: '2025-05-30T18:45:00Z',
    energy: 28.5,
    cost: 9.12,
    status: 'completed',
    stationId: 'station_3',
    stationName: 'EVgo Fast Charging',
  },
  {
    id: '4',
    date: '2025-05-28T12:20:00Z',
    energy: 38.9,
    cost: 12.45,
    status: 'failed',
    stationId: 'station_4',
    stationName: 'Electrify America',
  },
];

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    // Simulate API call
    setTimeout(() => {
      setSessions(mockSessions);
      setLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: ChargingSession['status']) => {
    switch (status) {
      case 'completed':
        return '#2ECC71';
      case 'active':
        return '#3498db';
      case 'failed':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getStatusIcon = (status: ChargingSession['status']) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'active':
        return 'time';
      case 'failed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const renderSession = ({ item }: { item: ChargingSession }) => (
    <TouchableOpacity style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.stationInfo}>
          <Text style={styles.stationName} numberOfLines={1}>
            {item.stationName}
          </Text>
          <Text style={styles.sessionDate}>
            {formatDate(item.date)} • {formatTime(item.date)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color="white" 
          />
        </View>
      </View>

      <View style={styles.sessionDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="flash" size={16} color="#666" />
          <Text style={styles.detailLabel}>Energy</Text>
          <Text style={styles.detailValue}>{item.energy.toFixed(1)} kWh</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="card" size={16} color="#666" />
          <Text style={styles.detailLabel}>Cost</Text>
          <Text style={styles.detailValue}>${item.cost.toFixed(2)}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="speedometer" size={16} color="#666" />
          <Text style={styles.detailLabel}>Rate</Text>
          <Text style={styles.detailValue}>
            ${(item.cost / item.energy).toFixed(2)}/kWh
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="battery-charging-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Charging Sessions</Text>
      <Text style={styles.emptyMessage}>
        Your charging history will appear here once you start using charging stations.
      </Text>
    </View>
  );

  const totalEnergy = sessions.reduce((sum, session) => 
    session.status === 'completed' ? sum + session.energy : sum, 0
  );
  
  const totalCost = sessions.reduce((sum, session) => 
    session.status === 'completed' ? sum + session.cost : sum, 0
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Charging History</Text>
      </View>

      {/* Summary Stats */}
      {sessions.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{sessions.length}</Text>
            <Text style={styles.summaryLabel}>Total Sessions</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalEnergy.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>kWh Charged</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>${totalCost.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </View>
        </View>
      )}

      {/* Sessions List */}
      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2ECC71"
            colors={['#2ECC71']}
          />
        }
        ListEmptyComponent={loading ? null : renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 10,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stationInfo: {
    flex: 1,
    marginRight: 12,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
});
