import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DataItem from '../DataItem';
import { COLORS } from '../utils/dashboardHelpers';

/**
 * SuggestionsSectionMobile Component
 * Displays list of user suggestions
 */
const SuggestionsSectionMobile = ({
  suggestions = [],
  isLoading = false,
  refreshing = false,
  searchQuery = '',
  bulkMode = false,
  selectedItems = [],
  userRole = 'admin',
  onRefresh,
  onItemPress,
  onItemLongPress,
  onArchive
}) => {
  // Filter non-archived suggestions
  const activeSuggestions = suggestions.filter(s => !s.archived);

  // Apply search filter
  const filteredSuggestions = activeSuggestions.filter(suggestion => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      suggestion.title?.toLowerCase().includes(query) ||
      suggestion.name?.toLowerCase().includes(query) ||
      suggestion.submitterName?.toLowerCase().includes(query) ||
      suggestion.reason?.toLowerCase().includes(query) ||
      suggestion.type?.toLowerCase().includes(query)
    );
  });

  // Sort by creation date (newest first)
  const sortedSuggestions = filteredSuggestions.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });

  // Render item
  const renderItem = ({ item }) => {
    const isSelected = selectedItems.includes(item._id);

    return (
      <DataItem
        item={item}
        itemType="suggestion"
        activeSection="prijedlozi"
        bulkMode={bulkMode}
        isSelected={isSelected}
        userRole={userRole}
        onPress={onItemPress}
        onLongPress={onItemLongPress}
        onArchive={onArchive}
      />
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Učitavanje prijedloga...</Text>
      </View>
    );
  }

  // Empty state
  if (sortedSuggestions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bulb-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyText}>
          {searchQuery ? 'Nema rezultata pretrage' : 'Nema prijedloga za prikaz'}
        </Text>
      </View>
    );
  }

  // List view
  return (
    <FlatList
      data={sortedSuggestions}
      renderItem={renderItem}
      keyExtractor={(item, index) => item._id || `suggestion-${index}`}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default SuggestionsSectionMobile;
