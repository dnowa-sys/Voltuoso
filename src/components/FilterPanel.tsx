// src/components/FilterPanel.tsx
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export interface FilterState {
  availability: 'all' | 'available' | 'in_use';
  chargingSpeed: 'all' | 'fast' | 'normal' | 'slow'; // fast: >100kW, normal: 50-100kW, slow: <50kW
  maxDistance: number; // in miles
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isVisible: boolean;
  onClose: () => void;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  isVisible,
  onClose,
}: FilterPanelProps) {
  if (!isVisible) return null;

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      availability: 'all',
      chargingSpeed: 'all',
      maxDistance: 25,
    });
  };

  const availabilityOptions = [
    { key: 'all', label: 'All Stations', count: '12' },
    { key: 'available', label: 'Available Now', count: '8' },
    { key: 'in_use', label: 'In Use', count: '4' },
  ];

  const chargingSpeedOptions = [
    { key: 'all', label: 'All Speeds' },
    { key: 'fast', label: 'Fast (>100kW)' },
    { key: 'normal', label: 'Normal (50-100kW)' },
    { key: 'slow', label: 'Slow (<50kW)' },
  ];

  const distanceOptions = [5, 10, 25, 50];

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Filter Stations</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Availability Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            {availabilityOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  filters.availability === option.key && styles.filterOptionActive,
                ]}
                onPress={() => updateFilter('availability', option.key)}
              >
                <View style={styles.filterOptionContent}>
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.availability === option.key && styles.filterOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.filterOptionCount}>({option.count})</Text>
                </View>
                {filters.availability === option.key && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Charging Speed Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Charging Speed</Text>
            {chargingSpeedOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  filters.chargingSpeed === option.key && styles.filterOptionActive,
                ]}
                onPress={() => updateFilter('chargingSpeed', option.key)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filters.chargingSpeed === option.key && styles.filterOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {filters.chargingSpeed === option.key && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Max Distance Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Maximum Distance</Text>
            <View style={styles.distanceOptions}>
              {distanceOptions.map((distance) => (
                <TouchableOpacity
                  key={distance}
                  style={[
                    styles.distanceOption,
                    filters.maxDistance === distance && styles.distanceOptionActive,
                  ]}
                  onPress={() => updateFilter('maxDistance', distance)}
                >
                  <Text
                    style={[
                      styles.distanceOptionText,
                      filters.maxDistance === distance && styles.distanceOptionTextActive,
                    ]}
                  >
                    {distance} mi
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2000,
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  filterOptionActive: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#2ECC71',
    fontWeight: '600',
  },
  filterOptionCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2ECC71',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distanceOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  distanceOptionActive: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  distanceOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  distanceOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2ECC71',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});