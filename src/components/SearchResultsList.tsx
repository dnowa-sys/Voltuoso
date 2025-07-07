// src/components/SearchResultsList.tsx
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'in_use' | 'offline';
  maxPower: number;
  pricePerKwh: number;
  availableConnectors: number;
  totalConnectors: number;
  distance?: number;
}

interface SearchResultsListProps {
  stations: Station[];
  searchQuery: string;
  isVisible: boolean;
  onStationSelect: (station: Station) => void;
  onClose: () => void;
}

export function SearchResultsList({
  stations,
  searchQuery,
  isVisible,
  onStationSelect,
  onClose,
}: SearchResultsListProps) {
  if (!isVisible || !searchQuery.trim()) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#2ECC71';
      case 'in_use': return '#F39C12';
      case 'offline': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'in_use': return 'In Use';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <Text key={index} style={styles.highlightedText}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  const renderStationItem = ({ item }: { item: Station }) => (
    <TouchableOpacity
      style={styles.stationItem}
      onPress={() => {
        onStationSelect(item);
        onClose();
      }}
      activeOpacity={0.7}
    >
      <View style={styles.stationContent}>
        <View style={styles.stationHeader}>
          <Text style={styles.stationName}>
            {highlightSearchTerm(item.name, searchQuery)}
          </Text>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        </View>
        
        <Text style={styles.stationAddress}>
          {highlightSearchTerm(item.address, searchQuery)}
        </Text>
        
        <View style={styles.stationDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Available</Text>
            <Text style={styles.detailValue}>
              {item.availableConnectors}/{item.totalConnectors}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Power</Text>
            <Text style={styles.detailValue}>{item.maxPower} kW</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>${item.pricePerKwh}/kWh</Text>
          </View>
          
          {item.distance !== undefined && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Distance</Text>
              <Text style={styles.detailValue}>{item.distance} mi</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.resultsCount}>
        {stations.length} station{stations.length !== 1 ? 's' : ''} found for "{searchQuery}"
      </Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>No stations found</Text>
      <Text style={styles.emptySubtitle}>
        Try searching for a different location or adjusting your filters
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />
      <View style={styles.listContainer}>
        <FlatList
          data={stations}
          renderItem={renderStationItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1500,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  listContainer: {
    position: 'absolute',
    top: 280, // Below search bar and filters
    left: 20,
    right: 20,
    bottom: 120, // Above bottom navigation
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 0,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stationContent: {
    flex: 1,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  highlightedText: {
    backgroundColor: '#FFEB3B',
    fontWeight: 'bold',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  stationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  arrowContainer: {
    marginLeft: 12,
    padding: 8,
  },
  arrow: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
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
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});