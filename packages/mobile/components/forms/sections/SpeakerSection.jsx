import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import IOSCompatibleDropdown from '../../IOSCompatibleDropdown';
import { formatDaijaTitle } from '../../../utils';

const COLORS = {
  primary: '#022C43',
  white: '#ffffff',
  gray: '#666666',
  border: '#e2e8f0',
};

/**
 * Speaker/Daija selection section for LectureForm
 * Allows selecting from daije list or entering custom speaker name
 */
const SpeakerSection = ({
  daije,
  daijaId,
  speaker,
  useCustomSpeaker,
  onDaijaChange,
  onSpeakerChange,
  onToggleCustomSpeaker,
}) => {
  const daijaOptions = [
    ...daije.map(d => ({
      label: formatDaijaTitle(d.name, d.title),
      value: d._id
    })),
    { label: '➕ Unesi ručno ime predavača', value: 'custom' }
  ];

  // If using custom speaker, show input field
  if (useCustomSpeaker) {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Daija/Predavač <Text style={styles.required}>*</Text>
        </Text>
        <View>
          <TextInput
            style={styles.input}
            value={speaker}
            onChangeText={onSpeakerChange}
            placeholder="Unesite ime predavača..."
            placeholderTextColor={COLORS.gray}
            autoFocus
          />
          <TouchableOpacity
            style={styles.switchToDropdown}
            onPress={onToggleCustomSpeaker}
          >
            <Text style={styles.switchToDropdownText}>Odaberi iz liste ipak</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <IOSCompatibleDropdown
      label="Daija/Predavač"
      items={daijaOptions}
      value={daijaId}
      onChangeValue={(value) => {
        if (value === 'custom') {
          onToggleCustomSpeaker();
        } else {
          const selectedDaija = daije.find(d => d._id === value);
          onDaijaChange(value, selectedDaija);
        }
      }}
      placeholder="Odaberite predavača"
      required={true}
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

export default SpeakerSection;
