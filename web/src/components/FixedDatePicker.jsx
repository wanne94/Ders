import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { parseLocalDateString, handleDatePickerChange, getTodayStartOfDay } from '../utils/datePickerUtils';

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
  
  // Parse the value to ensure it's a valid Date object
  const dateValue = parseLocalDateString(value);
  
  // Handle change with automatic timezone compensation
  const handleChange = (date) => {
    const formattedDate = handleDatePickerChange(date);
    console.log('📅 [FixedDatePicker] Change handled:', {
      input: date,
      output: formattedDate,
      environment: typeof window !== 'undefined' && 
        (window.location.hostname === 'ders.ba' || window.location.hostname === 'www.ders.ba') 
        ? 'PRODUCTION' : 'DEVELOPMENT'
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