import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
  superAdmin: '#800000',
};

const ROLE_CONFIG = {
  user: {
    label: 'Član',
    shortLabel: 'Č',
    backgroundColor: COLORS.gray,
    textColor: COLORS.white
  },
  admin: {
    label: 'Admin',
    shortLabel: 'A',
    backgroundColor: COLORS.success,
    textColor: COLORS.white
  },
  super_admin: {
    label: 'Super Admin',
    shortLabel: 'SA',
    backgroundColor: COLORS.superAdmin,
    textColor: COLORS.white
  },
};

const RoleBadge = ({ role, size = 'small', showFullText = false }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  const label = showFullText ? config.label : config.shortLabel;

  const badgeStyle = [
    styles.badge,
    { backgroundColor: config.backgroundColor },
    size === 'large' && styles.badgeLarge,
    size === 'medium' && styles.badgeMedium,
  ];

  const textStyle = [
    styles.badgeText,
    { color: config.textColor },
    size === 'large' && styles.textLarge,
    size === 'medium' && styles.textMedium,
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
  },
  badgeMedium: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    minWidth: 40,
  },
  badgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textMedium: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
});

export default RoleBadge;