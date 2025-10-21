import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IOSCompatibleDropdown from '../../IOSCompatibleDropdown';

const COLORS = {
  primary: '#022C43',
  white: '#ffffff',
  gray: '#666666',
  border: '#e2e8f0',
};

// Time options for dropdown (00:00 to 23:45 in 15-minute intervals)
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      const time = `${hourStr}:${minuteStr}`;
      options.push({ label: time, value: time });
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

/**
 * Date and Time picker section for LectureForm
 * Includes date button (opens modal) and time dropdown
 */
const DateTimeSection = ({
  date,
  time,
  onDatePress,
  onTimeChange,
}) => {
  return (
    <>
      {/* Date Picker Button */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Datum <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity style={styles.dateButton} onPress={onDatePress}>
          <Text style={[styles.dateButtonText, !date && styles.placeholderText]}>
            {date || 'Odaberite datum'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Time Picker Dropdown */}
      <IOSCompatibleDropdown
        label="Vrijeme"
        items={timeOptions}
        value={time}
        onChangeValue={onTimeChange}
        placeholder="Odaberite vrijeme"
        required={true}
        searchable={true}
      />
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  dateButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  placeholderText: {
    color: COLORS.gray,
  },
});

export default DateTimeSection;
