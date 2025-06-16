import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  secondary: '#dc004e',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  backdrop: 'rgba(0, 0, 0, 0.3)',
};

const BottomNavigation = ({ activeTab, onTabPress }) => {
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  const addOptions = [
    { id: 'add-lecture', label: 'Novi ders', icon: 'book-outline' },
    { id: 'add-speaker', label: 'Novi daija', icon: 'person-add-outline' },
    { id: 'add-organization', label: 'Novo udruženje', icon: 'business-outline' },
    { id: 'add-event', label: 'Novi događaj', icon: 'calendar-outline' },
  ];

  const tabs = [
    { id: 'home', label: 'Početna', icon: 'home-outline', activeIcon: 'home' },
    { id: 'lectures', label: 'Dersovi', icon: 'book-outline', activeIcon: 'book' },
    { id: 'add', label: 'Dodaj', icon: 'add', activeIcon: 'add' },
    { id: 'speakers', label: 'Daije', icon: 'people-outline', activeIcon: 'people' },
    { id: 'organizations', label: 'Udruženja', icon: 'business-outline', activeIcon: 'business' },
  ];

  const showAddMenu = () => {
    setShowAddOptions(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideAddMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAddOptions(false);
    });
  };

  const handleAddOptionPress = (optionId) => {
    hideAddMenu();
    // Pozovi callback funkciju sa selected option
    onTabPress(optionId);
  };

  const renderAddOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={styles.addOption}
      onPress={() => handleAddOptionPress(option.id)}
    >
      <View style={styles.addOptionIcon}>
        <Ionicons name={option.icon} size={18} color={COLORS.primary} />
      </View>
      <Text style={styles.addOptionLabel}>{option.label}</Text>
    </TouchableOpacity>
  );

  const renderTab = (tab, index) => {
    const isActive = activeTab === tab.id;
    const isAddButton = tab.id === 'add';

    if (isAddButton) {
      return (
        <TouchableOpacity
          key={tab.id}
          style={styles.addButton}
          onPress={showAddMenu}
        >
          <View style={[styles.addButtonInner, showAddOptions && styles.addButtonActive]}>
            <Animated.View style={{ 
              transform: [{ rotate: showAddOptions ? '45deg' : '0deg' }] 
            }}>
              <Ionicons name={tab.icon} size={24} color={COLORS.white} />
            </Animated.View>
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
    <>
      {/* Backdrop */}
      {showAddOptions && (
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1}
          onPress={hideAddMenu}
        >
          <Animated.View style={[styles.backdropInner, { opacity: fadeAnim }]} />
        </TouchableOpacity>
      )}

      {/* Add Options Menu */}
      {showAddOptions && (
        <Animated.View 
          style={[
            styles.addOptionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.addOptionsInner}>
            {addOptions.map(renderAddOption)}
          </View>
        </Animated.View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.container}>
        {tabs.map((tab, index) => renderTab(tab, index))}
      </View>
    </>
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
  addButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  backdropInner: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
  },
  addOptionsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: 'center',
  },
  addOptionsInner: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 8,
    marginHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: width * 0.6,
  },
  addOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addOptionLabel: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default BottomNavigation; 