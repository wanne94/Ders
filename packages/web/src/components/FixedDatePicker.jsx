import React, { useState, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { parseLocalDateString, handleDatePickerChange, getTodayStartOfDay, getTodayDateString } from '../utils/datePickerUtils';
import { correctDateForTimezone, isProductionEnvironment } from '../utils/datePickerConfig';

/**
 * Fixed DatePicker component that handles timezone issues
 * Automatically compensates for production timezone differences
 */
const FixedDatePicker = ({ 
  value, 
  onChange, 
  label = "Datum",
  format = "dd.MM.yyyy",
  minDate = null,
  isEditing = false,
  ...otherProps 
}) => {
  // Use state for default value to avoid SSR issues
  const [defaultDate, setDefaultDate] = useState('');
  
  // Set default date on client side only
  useEffect(() => {
    if (!isEditing && !value && typeof window !== 'undefined') {
      const todayString = getTodayDateString();
      console.log('🎯 [FixedDatePicker] Setting default date on client:', todayString);
      setDefaultDate(todayString);
    }
  }, [isEditing, value]);
  
  // Parse the value to ensure it's a valid Date object
  const effectiveValue = value || defaultDate;
  const dateValue = parseLocalDateString(effectiveValue);
  
  console.log('📅 [FixedDatePicker] Rendering with:', {
    inputValue: value,
    defaultDate,
    effectiveValue,
    parsedDate: dateValue ? dateValue.toString() : 'null',
    isEditing,
    isClient: typeof window !== 'undefined',
    environment: typeof window !== 'undefined' ? window.location.hostname : 'server'
  });
  
  // Handle change with automatic timezone compensation
  const handleChange = (date) => {
    // First apply timezone correction if needed
    const correctedDate = correctDateForTimezone(date);
    
    // Then format using existing handler
    const formattedDate = handleDatePickerChange(correctedDate);
    
    console.log('📅 [FixedDatePicker] Change handled:', {
      input: date ? date.toString() : 'null',
      corrected: correctedDate ? correctedDate.toString() : 'null',
      output: formattedDate,
      isProduction: isProductionEnvironment()
    });
    
    onChange(formattedDate);
  };
  
  return (
    <DatePicker
      label={label}
      value={dateValue}
      onChange={handleChange}
      format={format}
      minDate={minDate || (isEditing ? null : getTodayStartOfDay())}
      slotProps={{
        textField: {
          fullWidth: true,
          margin: "normal"
        }
      }}
      {...otherProps}
    />
  );
};

export default FixedDatePicker;