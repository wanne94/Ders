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
 * CancellationsSectionMobile Component
 * Displays list of lecture cancellation reports
 */
const CancellationsSectionMobile = ({
  cancelledReports = [],
  isLoading = false,
  refreshing = false,
  searchQuery = '',
  bulkMode = false,
  selectedItems = [],
  userRole = 'admin',
  onRefresh,
  onItemPress,
  onItemLongPress,
  onApprove,
  onReject
}) => {
  // Apply search filter
  const filteredReports = cancelledReports.filter(report => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.lecture_id?.title?.toLowerCase().includes(query) ||
      report.user_id?.firstName?.toLowerCase().includes(query) ||
      report.user_id?.lastName?.toLowerCase().includes(query) ||
      report.user_id?.email?.toLowerCase().includes(query) ||
      report.reason?.toLowerCase().includes(query) ||
      report.platform?.toLowerCase().includes(query)
    );
  });

  // Sort by creation date (newest first)
  const sortedReports = filteredReports.sort((a, b) => {
    const dateA = new Date(a.createdAt || a.timestamp || 0);
    const dateB = new Date(b.createdAt || b.timestamp || 0);
    return dateB - dateA;
  });

  // Render item
  const renderItem = ({ item }) => {
    const isSelected = selectedItems.includes(item._id);

    return (
      <DataItem
        item={item}
        itemType="cancelled_report"
        activeSection="otkazivanja"
        bulkMode={bulkMode}
        isSelected={isSelected}
        userRole={userRole}
        onPress={onItemPress}
        onLongPress={onItemLongPress}
        onApprove={onApprove}
        onReject={onReject}
      />
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Učitavanje prijava otkazivanja...</Text>
      </View>
    );
  }

  // Empty state
  if (sortedReports.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyText}>
          {searchQuery ? 'Nema rezultata pretrage' : 'Nema prijava za otkazivanje'}
        </Text>
      </View>
    );
  }

  // List view
  return (
    <FlatList
      data={sortedReports}
      renderItem={renderItem}
      keyExtractor={(item, index) => item._id || `cancellation-${index}`}
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

export default CancellationsSectionMobile;
