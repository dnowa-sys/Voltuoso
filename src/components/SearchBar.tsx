// src/components/SearchBar.tsx
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLocationPress: () => void;
  placeholder?: string;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  onLocationPress,
  placeholder = "Search stations or address...",
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor="#999"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={onLocationPress}
          activeOpacity={0.7}
        >
          <Text style={styles.locationIcon}>📍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120, // Below header
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginRight: 12,
  },
  locationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  locationIcon: {
    fontSize: 16,
  },
});