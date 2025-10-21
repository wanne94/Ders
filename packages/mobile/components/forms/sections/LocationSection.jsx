import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const COLORS = {
  primary: '#022C43',
  white: '#ffffff',
  gray: '#666666',
  border: '#e2e8f0',
  lightGray: '#f5f5f5',
};

/**
 * Location section for LectureForm
 * Includes address and city fields
 * Fields are disabled when organization is selected (auto-populated from organization data)
 */
const LocationSection = ({
  address,
  city,
  onAddressChange,
  onCityChange,
  disabled = false,
}) => {
  return (
    <>
      {/* Address Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Adresa <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          value={address}
          onChangeText={onAddressChange}
          placeholder="Unesite adresu..."
          placeholderTextColor={COLORS.gray}
          editable={!disabled}
        />
        {disabled && (
          <Text style={styles.helperText}>
            Adresa se automatski popunjava iz odabranog udruženja
          </Text>
        )}
      </View>

      {/* City Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Mjesto <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          value={city}
          onChangeText={onCityChange}
          placeholder="Unesite mjesto..."
          placeholderTextColor={COLORS.gray}
          editable={!disabled}
        />
        {disabled && (
          <Text style={styles.helperText}>
            Mjesto se automatski popunjava iz odabranog udruženja
          </Text>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  inputDisabled: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.7,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default LocationSection;
