import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  info: '#2196F3',
  background: '#f8fafc',
};

/**
 * Statistics dashboard component for mobile
 * Displays statistics cards with counts and icons
 */
const Statistics = ({ data, counts, refreshing, onRefresh }) => {
  const stats = [
    {
      title: 'Ukupno Dersova',
      count: data.lectures.length,
      icon: 'book-outline',
      color: COLORS.primary
    },
    {
      title: 'Odobrenih Dersova',
      count: data.lectures.filter(l => l.status === 'approved').length,
      icon: 'checkmark-circle-outline',
      color: COLORS.success
    },
    {
      title: 'Korisnika',
      count: data.users.length,
      icon: 'people-outline',
      color: COLORS.info
    },
    {
      title: 'Daija',
      count: data.daije.length,
      icon: 'person-outline',
      color: COLORS.primaryLight
    },
    {
      title: 'Udruženja',
      count: data.organizations.length,
      icon: 'business-outline',
      color: COLORS.secondary
    },
    {
      title: 'Na čekanju',
      count: counts.pendingDaije + counts.pendingOrganizations,
      icon: 'time-outline',
      color: COLORS.warning
    },
    {
      title: 'Prijedlozi',
      count: counts.pendingSuggestions,
      icon: 'bulb-outline',
      color: COLORS.info
    },
    {
      title: 'Odbijeno',
      count: counts.rejectedItems,
      icon: 'close-circle-outline',
      color: COLORS.error
    }
  ];

  return (
    <ScrollView
      style={styles.statsContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
              <Ionicons name={stat.icon} size={24} color={stat.color} />
            </View>
            <Text style={styles.statCount}>{stat.count}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default Statistics;
