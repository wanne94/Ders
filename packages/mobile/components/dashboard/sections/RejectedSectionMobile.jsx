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
 * RejectedSectionMobile Component
 * Displays list of rejected items (super_admin only)
 * Mixed items: lectures, daije, organizations
 */
const RejectedSectionMobile = ({
  lectures = [],
  daije = [],
  organizations = [],
  isLoading = false,
  refreshing = false,
  searchQuery = '',
  bulkMode = false,
  selectedItems = [],
  userRole = 'admin',
  daijeList = [],
  onRefresh,
  onItemPress,
  onItemLongPress
}) => {
  // Combine all rejected items
  const rejectedItems = [
    ...lectures.filter(l => l.status === 'rejected').map(l => ({ ...l, type: 'lecture' })),
    ...daije.filter(d => d.status === 'rejected').map(d => ({ ...d, type: 'daija' })),
    ...organizations.filter(o => o.status === 'rejected').map(o => ({ ...o, type: 'organization' }))
  ];

  // Apply search filter
  const filteredItems = rejectedItems.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.name?.toLowerCase().includes(query) ||
      item.speaker?.toLowerCase().includes(query) ||
      item.organization?.toLowerCase().includes(query) ||
      item.city?.toLowerCase().includes(query) ||
      item.rejectionReason?.toLowerCase().includes(query)
    );
  });

  // Sort by rejection date (newest first)
  const sortedItems = filteredItems.sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);
    return dateB - dateA;
  });

  // Render item
  const renderItem = ({ item }) => {
    const isSelected = selectedItems.includes(item._id);

    return (
      <DataItem
        item={item}
        itemType={item.type}
        activeSection="odbijeno"
        bulkMode={bulkMode}
        isSelected={isSelected}
        userRole={userRole}
        daijeList={daijeList}
        isMixed={true}
        onPress={onItemPress}
        onLongPress={onItemLongPress}
      />
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Učitavanje odbijenih stavki...</Text>
      </View>
    );
  }

  // Empty state
  if (sortedItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="close-circle-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyText}>
          {searchQuery ? 'Nema rezultata pretrage' : 'Nema odbijenih stavki'}
        </Text>
      </View>
    );
  }

  // List view
  return (
    <FlatList
      data={sortedItems}
      renderItem={renderItem}
      keyExtractor={(item, index) => item._id || `rejected-${index}`}
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

export default RejectedSectionMobile;
