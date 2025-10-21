import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#022C43',
  white: '#ffffff',
  border: '#e2e8f0',
};

/**
 * Header component for LectureForm
 * Displays back button, title (based on edit mode), and spacer for alignment
 */
const LectureFormHeader = ({ editMode, onBack }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {editMode ? 'Uredi Ders' : 'Dodaj Ders'}
      </Text>
      <View style={styles.headerRight} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: Platform.OS === 'ios' ? 12 : 12,
    zIndex: 10,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    zIndex: 11,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerRight: {
    width: 40,
  },
});

export default LectureFormHeader;
