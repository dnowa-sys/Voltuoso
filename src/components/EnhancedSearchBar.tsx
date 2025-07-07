// src/components/EnhancedSearchBar.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SearchResult, searchService } from '../services/searchService';

interface EnhancedSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  onLocationSelect: (result: SearchResult) => void;
  stations: any[];
  placeholder?: string;
}

export function EnhancedSearchBar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onLocationSelect,
  stations,
  placeholder = "Search places, cities, zip codes...",
}: EnhancedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Load search history when component mounts
    setSearchHistory(searchService.getSearchHistory());
  }, []);

  useEffect(() => {
    // Debounced search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.trim()) {
      setIsSearching(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await searchService.searchLocations(searchQuery, stations, {
            includeStations: true,
            maxResults: 8,
          });
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery, stations]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Delay hiding results to allow for tap events
    setTimeout(() => {
      setIsFocused(false);
    }, 150);
  };

  const handleResultSelect = (result: SearchResult) => {
    onSearchChange(result.title);
    searchService.addToSearchHistory(result.title);
    setSearchHistory(searchService.getSearchHistory());
    onLocationSelect(result);
    setIsFocused(false);
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  const handleHistorySelect = (historyItem: string) => {
    onSearchChange(historyItem);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    onSearchChange('');
    setSearchResults([]);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'station': return '⚡';
      case 'city': return '🏙️';
      case 'address': return '📍';
      case 'business': return '🏢';
      default: return '📍';
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.resultIcon}>{getResultIcon(item.type)}</Text>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
      </View>
      {item.type === 'station' && (
        <View style={styles.stationBadge}>
          <Text style={styles.stationBadgeText}>STATION</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistorySelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.historyIcon}>🕒</Text>
      <Text style={styles.historyText}>{item}</Text>
    </TouchableOpacity>
  );

  const showResults = isFocused && (searchResults.length > 0 || isSearching);
  const showHistory = isFocused && !searchQuery.trim() && searchHistory.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder={placeholder}
            value={searchQuery}
            onChangeText={onSearchChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={onSearchSubmit}
            placeholderTextColor="#999"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearSearch}
              activeOpacity={0.7}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={onSearchSubmit}
          activeOpacity={0.7}
        >
          <Text style={styles.searchButtonIcon}>⏎</Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {showResults && (
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2ECC71" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              style={styles.resultsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      )}

      {/* Search History */}
      {showHistory && (
        <View style={styles.resultsContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyHeaderText}>Recent Searches</Text>
            <TouchableOpacity 
              onPress={() => {
                searchService.clearSearchHistory();
                setSearchHistory([]);
              }}
            >
              <Text style={styles.clearHistoryText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => `history_${index}`}
            style={styles.resultsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
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
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#999',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 14,
    color: '#999',
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2ECC71',
    marginLeft: 12,
  },
  searchButtonIcon: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  resultsList: {
    maxHeight: 250,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  stationBadge: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#2ECC71',
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  historyText: {
    fontSize: 16,
    color: '#333',
  },
});