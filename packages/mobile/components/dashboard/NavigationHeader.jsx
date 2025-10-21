import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#022C43',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  info: '#2196F3',
  border: '#e2e8f0',
};

/**
 * Navigation header component for mobile dashboard
 * Displays horizontal scrollable navigation with main menu and approval sections
 */
const NavigationHeader = ({
  data,
  counts,
  activeSection,
  onSectionChange,
  userRole
}) => {
  const mainItems = [
    {
      id: 'dashboard',
      title: 'Pregled',
      icon: 'grid-outline',
      color: COLORS.primary,
      count: 0
    },
    {
      id: 'predavanja',
      title: 'Dersovi',
      icon: 'book-outline',
      color: COLORS.primary,
      count: (data.lectures || []).filter(l => l.status === 'approved').length
    },
    {
      id: 'organizations',
      title: 'Udruženja',
      icon: 'business-outline',
      color: COLORS.info,
      count: (data.organizations || []).filter(o => o.status === 'approved').length
    },
    {
      id: 'daije',
      title: 'Daije',
      icon: 'people-outline',
      color: COLORS.success,
      count: (data.daije || []).filter(d => d.status === 'approved').length
    },
    {
      id: 'korisnici',
      title: 'Korisnici',
      icon: 'person-outline',
      color: COLORS.warning,
      count: (data.users || []).length
    }
  ];

  const approvalItems = [
    {
      id: 'za-odobrenje',
      title: 'Za odobrenje',
      icon: 'time-outline',
      color: COLORS.warning,
      count: counts.pendingDaije + counts.pendingOrganizations,
      badge: true
    },
    {
      id: 'prijedlozi',
      title: 'Prijedlozi',
      icon: 'bulb-outline',
      color: COLORS.info,
      count: counts.pendingSuggestions,
      badge: true
    },
    {
      id: 'otkazivanja',
      title: 'Otkazivanja',
      icon: 'alert-circle-outline',
      color: COLORS.warning,
      count: counts.pendingCancelledReports,
      badge: true
    }
  ];

  if (userRole === 'super_admin') {
    approvalItems.push({
      id: 'odbijeno',
      title: 'Odbijeno',
      icon: 'close-circle-outline',
      color: COLORS.error,
      count: counts.rejectedItems
    });
  }

  return (
    <View style={styles.navigationHeader}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.navSection}>
          <Text style={styles.navSectionTitle}>GLAVNI MENI</Text>
          <View style={styles.navItemsRow}>
            {mainItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.navItem,
                  activeSection === item.id && styles.navItemActive
                ]}
                onPress={() => onSectionChange(item.id)}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={activeSection === item.id ? COLORS.white : item.color}
                />
                <Text style={[
                  styles.navItemText,
                  activeSection === item.id && styles.navItemTextActive
                ]}>
                  {item.title}
                </Text>
                {item.count > 0 && (
                  <View style={styles.navItemCount}>
                    <Text style={styles.navItemCountText}>{item.count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.navSection}>
          <Text style={styles.navSectionTitle}>ODOBRAVANJE</Text>
          <View style={styles.navItemsRow}>
            {approvalItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.navItem,
                  activeSection === item.id && styles.navItemActive
                ]}
                onPress={() => onSectionChange(item.id)}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={activeSection === item.id ? COLORS.white : item.color}
                />
                <Text style={[
                  styles.navItemText,
                  activeSection === item.id && styles.navItemTextActive
                ]}>
                  {item.title}
                </Text>
                {item.count > 0 && (
                  <View style={[
                    styles.navItemCount,
                    item.badge && styles.navItemBadge
                  ]}>
                    <Text style={styles.navItemCountText}>{item.count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  navigationHeader: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  navSection: {
    marginHorizontal: 16,
  },
  navSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  navItemsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    gap: 6,
  },
  navItemActive: {
    backgroundColor: COLORS.primary,
  },
  navItemText: {
    fontSize: 14,
    fontWeight: 'medium',
    color: COLORS.gray,
  },
  navItemTextActive: {
    color: COLORS.white,
  },
  navItemCount: {
    backgroundColor: COLORS.gray,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  navItemBadge: {
    backgroundColor: COLORS.error,
  },
  navItemCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default NavigationHeader;
