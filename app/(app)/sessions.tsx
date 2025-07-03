// app/(app)/sessions.tsx - ENHANCED WITH HISTORY & CURRENT SESSIONS
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Mock data for demonstration
const currentSessions = [
  {
    id: 'session_active_1',
    stationName: 'Voltuoso Bethesda',
    stationAddress: '9525 Starmont Rd, Bethesda, MD',
    status: 'charging',
    startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    energyDelivered: 12.5,
    currentPower: 98,
    estimatedCost: 4.75,
    estimatedTimeRemaining: 25,
  },
];

const sessionHistory = [
  {
    id: 'session_1',
    stationName: 'Voltuoso Georgetown',
    stationAddress: '3000 M St NW, Washington, DC',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    duration: 42, // minutes
    energyDelivered: 18.2,
    totalCost: 5.82,
    status: 'completed',
  },
  {
    id: 'session_2',
    stationName: 'Voltuoso Arlington',
    stationAddress: '1100 Wilson Blvd, Arlington, VA',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    duration: 38,
    energyDelivered: 21.7,
    totalCost: 7.60,
    status: 'completed',
  },
  {
    id: 'session_3',
    stationName: 'Voltuoso Tysons',
    stationAddress: '1961 Chain Bridge Rd, Tysons, VA',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    duration: 51,
    energyDelivered: 24.8,
    totalCost: 7.19,
    status: 'completed',
  },
  {
    id: 'session_4',
    stationName: 'Voltuoso Bethesda',
    stationAddress: '9525 Starmont Rd, Bethesda, MD',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    duration: 33,
    energyDelivered: 16.4,
    totalCost: 4.59,
    status: 'completed',
  },
];

export default function SessionsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getElapsedTime = (startTime: Date) => {
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 60000);
    return formatDuration(elapsed);
  };

  const handleSessionPress = (sessionId: string) => {
    // Navigate to session details
    router.push(`/(app)/charging-session?sessionId=${sessionId}`);
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
        <Text style={styles.title}>Charging Sessions</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
            Current ({currentSessions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History ({sessionHistory.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'current' ? (
          // Current Sessions
          <View style={styles.section}>
            {currentSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔋</Text>
                <Text style={styles.emptyTitle}>No Active Sessions</Text>
                <Text style={styles.emptySubtitle}>
                  Start a charging session to see it here
                </Text>
                <TouchableOpacity 
                  style={styles.findStationsButton}
                  onPress={() => router.push('/(app)')}
                >
                  <Text style={styles.findStationsButtonText}>Find Stations</Text>
                </TouchableOpacity>
              </View>
            ) : (
              currentSessions.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  style={styles.currentSessionCard}
                  onPress={() => handleSessionPress(session.id)}
                >
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionStationName}>{session.stationName}</Text>
                      <Text style={styles.sessionAddress}>{session.stationAddress}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>Charging</Text>
                    </View>
                  </View>

                  <View style={styles.sessionStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{getElapsedTime(session.startTime)}</Text>
                      <Text style={styles.statLabel}>Duration</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{session.energyDelivered} kWh</Text>
                      <Text style={styles.statLabel}>Energy</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{session.currentPower} kW</Text>
                      <Text style={styles.statLabel}>Power</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>${session.estimatedCost.toFixed(2)}</Text>
                      <Text style={styles.statLabel}>Est. Cost</Text>
                    </View>
                  </View>

                  <View style={styles.sessionFooter}>
                    <Text style={styles.estimatedTime}>
                      ~{session.estimatedTimeRemaining} min remaining
                    </Text>
                    <TouchableOpacity style={styles.stopButton}>
                      <Text style={styles.stopButtonText}>Stop Charging</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          // Session History
          <View style={styles.section}>
            {sessionHistory.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={styles.historySessionCard}
                onPress={() => handleSessionPress(session.id)}
              >
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionStationName}>{session.stationName}</Text>
                    <Text style={styles.sessionAddress}>{session.stationAddress}</Text>
                  </View>
                  <View style={styles.sessionDate}>
                    <Text style={styles.dateText}>{formatDate(session.date)}</Text>
                    <Text style={styles.timeText}>{formatTime(session.date)}</Text>
                  </View>
                </View>

                <View style={styles.sessionStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formatDuration(session.duration)}</Text>
                    <Text style={styles.statLabel}>Duration</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{session.energyDelivered} kWh</Text>
                    <Text style={styles.statLabel}>Energy</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>${session.totalCost.toFixed(2)}</Text>
                    <Text style={styles.statLabel}>Total Cost</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.completedBadge}>✓</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                  </View>
                </View>
              </TouchableOpacity>
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
    fontSize: 16,
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
  findStationsButton: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  findStationsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  currentSessionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2ECC71',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historySessionCard: {
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionStationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sessionAddress: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2ECC71',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#2ECC71',
    fontWeight: '600',
  },
  sessionDate: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
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
  completedBadge: {
    fontSize: 16,
    color: '#2ECC71',
    fontWeight: 'bold',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  estimatedTime: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  stopButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});