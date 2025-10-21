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
 * LecturesSectionMobile Component
 * Displays list of approved lectures
 */
const LecturesSectionMobile = ({
  lectures = [],
  isLoading = false,
  refreshing = false,
  searchQuery = '',
  activeFilters = {},
  bulkMode = false,
  selectedItems = [],
  userRole = 'admin',
  daijeList = [],
  onRefresh,
  onItemPress,
  onItemLongPress,
  onApprove,
  onReject,
  onCancel,
  onReactivate,
  onEdit,
  onDelete
}) => {
  // Filter approved lectures
  const approvedLectures = lectures.filter(l => l.status === 'approved');

  // Apply search filter
  const filteredLectures = approvedLectures.filter(lecture => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lecture.title?.toLowerCase().includes(query) ||
      lecture.speaker?.toLowerCase().includes(query) ||
      lecture.organization?.toLowerCase().includes(query) ||
      lecture.city?.toLowerCase().includes(query)
    );
  });

  // Render item
  const renderItem = ({ item }) => {
    const isSelected = selectedItems.includes(item._id);

    return (
      <DataItem
        item={item}
        itemType="lecture"
        activeSection="predavanja"
        bulkMode={bulkMode}
        isSelected={isSelected}
        userRole={userRole}
        daijeList={daijeList}
        onPress={onItemPress}
        onLongPress={onItemLongPress}
        onApprove={onApprove}
        onReject={onReject}
        onCancel={onCancel}
        onReactivate={onReactivate}
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
        <Text style={styles.loadingText}>Učitavanje predavanja...</Text>
      </View>
    );
  }

  // Empty state
  if (filteredLectures.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyText}>
          {searchQuery ? 'Nema rezultata pretrage' : 'Nema predavanja za prikaz'}
        </Text>
      </View>
    );
  }

  // List view
  return (
    <FlatList
      data={filteredLectures}
      renderItem={renderItem}
      keyExtractor={(item, index) => item._id || `lecture-${index}`}
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

export default LecturesSectionMobile;
