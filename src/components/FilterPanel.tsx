// src/components/FilterPanel.tsx - ENHANCED WITH NEARBY ACTIVITIES & FULL SCREEN
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export interface FilterState {
  availability: 'all' | 'available' | 'in_use';
  chargingSpeed: 'all' | 'fast' | 'normal' | 'slow';
  maxDistance: number;
  nearbyActivities: string[]; // Array of selected activity types
}

interface Activity {
  id: string;
  name: string;
  icon: string;
  category: 'dining' | 'shopping' | 'recreation' | 'services' | 'sports' | 'education';
}

const ACTIVITIES: Activity[] = [
  // Dining
  { id: 'restaurants', name: 'Restaurants', icon: '🍽️', category: 'dining' },
  { id: 'bars', name: 'Bars & Nightlife', icon: '🍻', category: 'dining' },
  { id: 'coffee', name: 'Coffee Shops', icon: '☕', category: 'dining' },
  { id: 'fast_food', name: 'Fast Food', icon: '🍔', category: 'dining' },
  
  // Shopping
  { id: 'shopping', name: 'Shopping Centers', icon: '🛍️', category: 'shopping' },
  { id: 'groceries', name: 'Grocery Stores', icon: '🛒', category: 'shopping' },
  { id: 'pharmacy', name: 'Pharmacies', icon: '💊', category: 'shopping' },
  { id: 'gas_station', name: 'Gas Stations', icon: '⛽', category: 'services' },
  
  // Recreation & Entertainment
  { id: 'gym', name: 'Gyms & Fitness', icon: '💪', category: 'recreation' },
  { id: 'spa', name: 'Spas & Wellness', icon: '🧘', category: 'recreation' },
  { id: 'movie_theater', name: 'Movie Theaters', icon: '🎬', category: 'recreation' },
  { id: 'museum', name: 'Museums', icon: '🏛️', category: 'recreation' },
  { id: 'park', name: 'Parks', icon: '🌳', category: 'recreation' },
  
  // Outdoor Activities
  { id: 'hiking', name: 'Hiking Trails', icon: '🥾', category: 'recreation' },
  { id: 'biking', name: 'Bike Paths', icon: '🚴', category: 'recreation' },
  { id: 'walking', name: 'Walking Trails', icon: '🚶', category: 'recreation' },
  { id: 'beach', name: 'Beaches', icon: '🏖️', category: 'recreation' },
  
  // Sports Facilities
  { id: 'tennis', name: 'Tennis Courts', icon: '🎾', category: 'sports' },
  { id: 'basketball', name: 'Basketball Courts', icon: '🏀', category: 'sports' },
  { id: 'pool', name: 'Swimming Pools', icon: '🏊', category: 'sports' },
  { id: 'soccer', name: 'Soccer Fields', icon: '⚽', category: 'sports' },
  { id: 'football', name: 'Football Fields', icon: '🏈', category: 'sports' },
  { id: 'golf', name: 'Golf Courses', icon: '⛳', category: 'sports' },
  
  // Services & Education
  { id: 'hospital', name: 'Hospitals', icon: '🏥', category: 'services' },
  { id: 'bank', name: 'Banks & ATMs', icon: '🏦', category: 'services' },
  { id: 'school', name: 'Schools', icon: '🏫', category: 'education' },
  { id: 'library', name: 'Libraries', icon: '📚', category: 'education' },
  { id: 'university', name: 'Universities', icon: '🎓', category: 'education' },
];

const CATEGORY_NAMES = {
  dining: 'Dining & Food',
  shopping: 'Shopping',
  recreation: 'Recreation',
  services: 'Services',
  sports: 'Sports & Fitness',
  education: 'Education',
};

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
  const [activitiesExpanded, setActivitiesExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  if (!isVisible) return null;

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleActivity = (activityId: string) => {
    const currentActivities = filters.nearbyActivities || [];
    const isSelected = currentActivities.includes(activityId);
    
    let newActivities;
    if (isSelected) {
      newActivities = currentActivities.filter(id => id !== activityId);
    } else {
      newActivities = [...currentActivities, activityId];
    }
    
    updateFilter('nearbyActivities', newActivities);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const clearFilters = () => {
    onFiltersChange({
      availability: 'all',
      chargingSpeed: 'all',
      maxDistance: 25,
      nearbyActivities: [],
    });
    setExpandedCategories(new Set());
  };

  const clearActivities = () => {
    updateFilter('nearbyActivities', []);
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

  // Group activities by category
  const activitiesByCategory = ACTIVITIES.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = [];
    }
    acc[activity.category].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  const selectedActivitiesCount = filters.nearbyActivities?.length || 0;

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

          {/* Nearby Activities Filter */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.activitiesHeader}
              onPress={() => setActivitiesExpanded(!activitiesExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.activitiesHeaderContent}>
                <Text style={styles.sectionTitle}>Nearby Activities</Text>
                {selectedActivitiesCount > 0 && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>{selectedActivitiesCount}</Text>
                  </View>
                )}
              </View>
              <View style={styles.expandButtonContainer}>
                <Text style={[
                  styles.expandIcon,
                  activitiesExpanded && styles.expandIconRotated
                ]}>
                  ▶
                </Text>
              </View>
            </TouchableOpacity>

            {activitiesExpanded && (
              <View style={styles.activitiesContainer}>
                {selectedActivitiesCount > 0 && (
                  <TouchableOpacity
                    style={styles.clearActivitiesButton}
                    onPress={clearActivities}
                  >
                    <Text style={styles.clearActivitiesText}>Clear All Activities</Text>
                  </TouchableOpacity>
                )}

                {Object.entries(activitiesByCategory).map(([category, activities]) => (
                  <View key={category} style={styles.categoryContainer}>
                    <TouchableOpacity
                      style={styles.categoryHeader}
                      onPress={() => toggleCategory(category)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.categoryTitle}>
                        {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES]}
                      </Text>
                      <Text style={[
                        styles.categoryExpandIcon,
                        expandedCategories.has(category) && styles.categoryExpandIconRotated
                      ]}>
                        ▼
                      </Text>
                    </TouchableOpacity>

                    {expandedCategories.has(category) && (
                      <View style={styles.activitiesList}>
                        {activities.map((activity) => {
                          const isSelected = filters.nearbyActivities?.includes(activity.id) || false;
                          return (
                            <TouchableOpacity
                              key={activity.id}
                              style={[
                                styles.activityOption,
                                isSelected && styles.activityOptionSelected,
                              ]}
                              onPress={() => toggleActivity(activity.id)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.activityIcon}>{activity.icon}</Text>
                              <Text style={[
                                styles.activityText,
                                isSelected && styles.activityTextSelected,
                              ]}>
                                {activity.name}
                              </Text>
                              {isSelected && (
                                <View style={styles.activityCheckmark}>
                                  <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 2000,
  },
  panel: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 50, // Account for status bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activitiesHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedBadge: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  selectedBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandButtonContainer: {
    padding: 8,
  },
  expandIcon: {
    fontSize: 16,
    color: '#666',
    transform: [{ rotate: '0deg' }],
  },
  expandIconRotated: {
    transform: [{ rotate: '90deg' }],
  },
  activitiesContainer: {
    marginTop: 8,
  },
  clearActivitiesButton: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  clearActivitiesText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  categoryExpandIcon: {
    fontSize: 12,
    color: '#666',
    transform: [{ rotate: '0deg' }],
  },
  categoryExpandIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  activitiesList: {
    marginTop: 8,
    paddingLeft: 8,
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: '#fafafa',
  },
  activityOptionSelected: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  activityIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 20,
    textAlign: 'center',
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  activityTextSelected: {
    color: '#2ECC71',
    fontWeight: '600',
  },
  activityCheckmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2ECC71',
    alignItems: 'center',
    justifyContent: 'center',
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