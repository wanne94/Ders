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
 * DaijeSectionMobile Component
 * Displays list of approved daije
 */
const DaijeSectionMobile = ({
  daije = [],
  isLoading = false,
  refreshing = false,
  searchQuery = '',
  bulkMode = false,
  selectedItems = [],
  userRole = 'admin',
  onRefresh,
  onItemPress,
  onItemLongPress,
  onEdit,
  onDelete
}) => {
  // Filter approved daije
  const approvedDaije = daije.filter(d => d.status === 'approved');

  // Apply search filter
  const filteredDaije = approvedDaije.filter(daija => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      daija.name?.toLowerCase().includes(query) ||
      daija.title?.toLowerCase().includes(query) ||
      daija.organization?.toLowerCase().includes(query) ||
      daija.education?.toLowerCase().includes(query)
    );
  });

  // Render item
  const renderItem = ({ item }) => {
    const isSelected = selectedItems.includes(item._id);

    return (
      <DataItem
        item={item}
        itemType="daija"
        activeSection="daije"
        bulkMode={bulkMode}
        isSelected={isSelected}
        userRole={userRole}
        onPress={onItemPress}
        onLongPress={onItemLongPress}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Učitavanje daija...</Text>
      </View>
    );
  }

  // Empty state
  if (filteredDaije.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyText}>
          {searchQuery ? 'Nema rezultata pretrage' : 'Nema daija za prikaz'}
        </Text>
      </View>
    );
  }

  // List view
  return (
    <FlatList
      data={filteredDaije}
      renderItem={renderItem}
      keyExtractor={(item, index) => item._id || `daija-${index}`}
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

export default DaijeSectionMobile;
