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
 * UsersSectionMobile Component
 * Displays list of users
 */
const UsersSectionMobile = ({
  users = [],
  isLoading = false,
  refreshing = false,
  searchQuery = '',
  bulkMode = false,
  selectedItems = [],
  userRole = 'admin',
  onRefresh,
  onItemPress,
  onItemLongPress
}) => {
  // Apply search filter
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  // Render item
  const renderItem = ({ item }) => {
    const isSelected = selectedItems.includes(item._id);

    return (
      <DataItem
        item={item}
        itemType="user"
        activeSection="korisnici"
        bulkMode={bulkMode}
        isSelected={isSelected}
        userRole={userRole}
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
        <Text style={styles.loadingText}>Učitavanje korisnika...</Text>
      </View>
    );
  }

  // Empty state
  if (filteredUsers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyText}>
          {searchQuery ? 'Nema rezultata pretrage' : 'Nema korisnika za prikaz'}
        </Text>
      </View>
    );
  }

  // List view
  return (
    <FlatList
      data={filteredUsers}
      renderItem={renderItem}
      keyExtractor={(item, index) => item._id || `user-${index}`}
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

export default UsersSectionMobile;
