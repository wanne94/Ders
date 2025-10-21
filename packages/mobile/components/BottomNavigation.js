import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Import shared navigation config
import { mainMenuItems, routes } from '@ders-ba/shared';

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  success: '#4CAF50',
};

const BottomNavigation = forwardRef(({ activeTab, onTabPress, isAddMenuOpen = false }, ref) => {
  // Build tabs from shared config
  const tabs = [
    {
      id: routes.mobileRoutes.home,
      label: mainMenuItems[0].label, // Početna
      icon: mainMenuItems[0].mobileIcon,
      activeIcon: mainMenuItems[0].mobileIconActive
    },
    {
      id: routes.mobileRoutes.lectures,
      label: mainMenuItems[1].label, // Dersovi
      icon: mainMenuItems[1].mobileIcon,
      activeIcon: mainMenuItems[1].mobileIconActive
    },
    { id: 'add', label: 'Dodaj', icon: 'add', activeIcon: 'add' },
    {
      id: routes.mobileRoutes.speakers,
      label: mainMenuItems[3].label, // Daije
      icon: mainMenuItems[3].mobileIcon,
      activeIcon: mainMenuItems[3].mobileIconActive
    },
    {
      id: routes.mobileRoutes.organizations,
      label: mainMenuItems[2].label, // Udruženja
      icon: mainMenuItems[2].mobileIcon,
      activeIcon: mainMenuItems[2].mobileIconActive
    },
  ];

  // Animation values for each tab
  const scaleAnimations = useRef(
    tabs.reduce((acc, tab) => {
      acc[tab.id] = new Animated.Value(1);
      return acc;
    }, {})
  ).current;

  // Expose triggerBounce function to parent
  useImperativeHandle(ref, () => ({
    triggerBounce: (tabId) => {
      const scaleAnim = scaleAnimations[tabId];
      if (!scaleAnim) return;

      // Bounce animation: 1 → 1.3 → 0.95 → 1
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }), [scaleAnimations]);

  const renderTab = (tab, index) => {
    const isActive = activeTab === tab.id;
    const isAddButton = tab.id === 'add';
    const scaleAnim = scaleAnimations[tab.id];

    if (isAddButton) {
      return (
        <TouchableOpacity
          key={tab.id}
          style={styles.addButton}
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Animated.View
            style={[
              styles.addButtonInner,
              isAddMenuOpen && styles.addButtonActive,
              scaleAnim && { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <Ionicons
              name={isAddMenuOpen ? 'close' : tab.icon}
              size={24}
              color={COLORS.white}
            />
          </Animated.View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={tab.id}
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={() => onTabPress(tab.id)}
        activeOpacity={0.7}
        delayPressIn={0}
      >
        <Animated.View style={scaleAnim && { transform: [{ scale: scaleAnim }] }}>
          <Ionicons
            name={isActive ? tab.activeIcon : tab.icon}
            size={24}
            color={isActive ? COLORS.primary : COLORS.gray}
          />
        </Animated.View>
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
});

BottomNavigation.displayName = 'BottomNavigation';

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
  addButtonActive: {
    backgroundColor: COLORS.success,
  },
});

export default BottomNavigation; 