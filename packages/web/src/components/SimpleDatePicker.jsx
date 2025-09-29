import React, { useState, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers';

/**
 * Simplified DatePicker that ALWAYS adds 1 day to selected date
 * This is a brute-force fix for production timezone issues
 */
const SimpleDatePicker = ({ 
  value, 
  onChange, 
  label = "Datum",
  format = "dd.MM.yyyy",
  minDate = null,
  isEditing = false,
  ...otherProps 
}) => {
  const [internalValue, setInternalValue] = useState(null);
  
  // Parse incoming value
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day, 12, 0, 0);
        setInternalValue(date);
      }
    } else if (!isEditing && typeof window !== 'undefined') {
      // Set today as default
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const day = today.getDate();
      const defaultDate = new Date(year, month, day, 12, 0, 0);
      setInternalValue(defaultDate);
      
      // Send to parent
      const formattedMonth = String(month + 1).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');
      onChange(`${year}-${formattedMonth}-${formattedDay}`);
    }
  }, [value, isEditing, onChange]);
  
  const handleChange = (newDate) => {
    if (!newDate) {
      setInternalValue(null);
      onChange('');
      return;
    }
    
    // CRITICAL FIX: Always add 1 day to compensate for timezone issue
    // The DatePicker returns date at 00:00 which gets shifted back
    const year = newDate.getFullYear();
    const month = newDate.getMonth();
    const day = newDate.getDate();
    
    // Check if we're likely on production (date has 00:00 time)
    const hours = newDate.getHours();
    const needsCompensation = hours === 0 || hours === 22 || hours === 23;
    
    let finalDay = day;
    let finalMonth = month;
    let finalYear = year;
    
    if (needsCompensation) {
      // Add one day
      const compensated = new Date(year, month, day + 1, 12, 0, 0);
      finalDay = compensated.getDate();
      finalMonth = compensated.getMonth();
      finalYear = compensated.getFullYear();
    }
    
    // Create final date at noon
    const finalDate = new Date(finalYear, finalMonth, finalDay, 12, 0, 0);
    setInternalValue(finalDate);
    
    // Format for output
    const formattedMonth = String(finalMonth + 1).padStart(2, '0');
    const formattedDay = String(finalDay).padStart(2, '0');
    const formatted = `${finalYear}-${formattedMonth}-${formattedDay}`;
    
    onChange(formatted);
  };
  
  return (
    <DatePicker
      label={label}
      value={internalValue}
      onChange={handleChange}
      format={format}
      minDate={minDate || (!isEditing ? new Date() : null)}
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

export default SimpleDatePicker;