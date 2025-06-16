import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
};

const BottomNavigation = ({ activeTab, onTabPress }) => {
  const tabs = [
    { id: 'home', label: 'Početna', icon: 'home-outline', activeIcon: 'home' },
    { id: 'lectures', label: 'Dersovi', icon: 'book-outline', activeIcon: 'book' },
    { id: 'add', label: 'Dodaj', icon: 'add', activeIcon: 'add' },
    { id: 'speakers', label: 'Daije', icon: 'people-outline', activeIcon: 'people' },
    { id: 'organizations', label: 'Udruženja', icon: 'business-outline', activeIcon: 'business' },
  ];

  const renderTab = (tab, index) => {
    const isActive = activeTab === tab.id;
    const isAddButton = tab.id === 'add';

    if (isAddButton) {
      return (
        <TouchableOpacity
          key={tab.id}
          style={styles.addButton}
          onPress={() => onTabPress(tab.id)}
        >
          <View style={styles.addButtonInner}>
            <Ionicons name={tab.icon} size={24} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={tab.id}
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={() => onTabPress(tab.id)}
      >
        <Ionicons 
          name={isActive ? tab.activeIcon : tab.icon} 
          size={24} 
          color={isActive ? COLORS.primary : COLORS.gray} 
        />
        <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => renderTab(tab, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    height: 80,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default BottomNavigation; 