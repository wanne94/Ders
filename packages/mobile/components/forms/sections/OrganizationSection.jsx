import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import IOSCompatibleDropdown from '../../IOSCompatibleDropdown';

const COLORS = {
  primary: '#022C43',
  white: '#ffffff',
  gray: '#666666',
  border: '#e2e8f0',
};

/**
 * Organization selection section for LectureForm
 * Allows selecting from organizations list or entering custom organization name
 * When organization is selected, it auto-populates address and city fields
 */
const OrganizationSection = ({
  organizations,
  organizationId,
  organization,
  useCustomOrganization,
  onOrganizationChange,
  onCustomOrganizationChange,
  onToggleCustomOrganization,
}) => {
  const organizationOptions = [
    { label: 'Nije odabrano', value: '' },
    ...organizations.map(o => ({
      label: o.name,
      value: o._id
    })),
    { label: '➕ Unesi ručno naziv udruženja', value: 'custom' }
  ];

  // If using custom organization, show input field
  if (useCustomOrganization) {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Udruženje
        </Text>
        <View>
          <TextInput
            style={styles.input}
            value={organization}
            onChangeText={onCustomOrganizationChange}
            placeholder="Unesite naziv udruženja..."
            placeholderTextColor={COLORS.gray}
            autoFocus
          />
          <TouchableOpacity
            style={styles.switchToDropdown}
            onPress={onToggleCustomOrganization}
          >
            <Text style={styles.switchToDropdownText}>Odaberi iz liste ipak</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <IOSCompatibleDropdown
      label="Udruženje"
      items={organizationOptions}
      value={organizationId}
      onChangeValue={(value) => {
        if (value === 'custom') {
          onToggleCustomOrganization();
        } else {
          const selectedOrg = organizations.find(o => o._id === value);
          onOrganizationChange(value, selectedOrg);
        }
      }}
      placeholder="Odaberite udruženje"
      searchable={true}
    />
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
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  switchToDropdown: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  switchToDropdownText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default OrganizationSection;
