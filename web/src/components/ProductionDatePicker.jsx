import React, { useState, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { TextField } from '@mui/material';

/**
 * Production-safe DatePicker that handles timezone issues
 * This component completely bypasses MUI DatePicker's internal date handling
 */
const ProductionDatePicker = ({ 
  value, 
  onChange, 
  label = "Datum",
  format = "dd.MM.yyyy",
  minDate = null,
  isEditing = false,
  ...otherProps 
}) => {
  const [internalValue, setInternalValue] = useState(null);
  
  // Initialize value
  useEffect(() => {
    if (value) {
      // Parse YYYY-MM-DD string
      const parts = value.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        
        // Always create date at noon to avoid timezone issues
        const date = new Date(year, month, day, 12, 0, 0, 0);
        setInternalValue(date);
        
        console.log('📅 [ProductionDatePicker] Initialized:', {
          input: value,
          parsed: date.toString(),
          components: { year, month: month + 1, day }
        });
      }
    } else if (!isEditing && typeof window !== 'undefined') {
      // Set today as default for new items
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      setInternalValue(today);
      
      // Format and send to parent
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    }
  }, [value, isEditing]);
  
  // Handle date selection
  const handleDateChange = (newDate) => {
    if (!newDate) {
      setInternalValue(null);
      onChange('');
      return;
    }
    
    console.log('🔍 [ProductionDatePicker] Raw selection:', {
      date: newDate.toString(),
      hours: newDate.getHours(),
      day: newDate.getDate()
    });
    
    // CRITICAL FIX: Always use the date components directly
    // Never trust the Date object's time component
    let targetDay = newDate.getDate();
    let targetMonth = newDate.getMonth();
    let targetYear = newDate.getFullYear();
    
    // Check if we need to compensate for timezone shift
    const hours = newDate.getHours();
    
    // PRODUCTION FIX: If hours indicate timezone shift, compensate
    // This happens when MUI DatePicker creates date at midnight UTC
    if (hours === 22 || hours === 23) {
      console.log('⚠️ [PRODUCTION FIX] Detected timezone shift (hours:', hours, '), adding 1 day');
      // Add one day to compensate
      const compensated = new Date(targetYear, targetMonth, targetDay + 1, 12, 0, 0, 0);
      targetDay = compensated.getDate();
      targetMonth = compensated.getMonth();
      targetYear = compensated.getFullYear();
    } else if (hours === 0 || hours === 1 || hours === 2) {
      console.log('ℹ️ [PRODUCTION FIX] Early morning hours (', hours, '), using date as-is');
      // Early morning hours - date is likely correct
    }
    
    // Create clean date at noon
    const cleanDate = new Date(targetYear, targetMonth, targetDay, 12, 0, 0, 0);
    setInternalValue(cleanDate);
    
    // Format for output
    const formattedMonth = String(targetMonth + 1).padStart(2, '0');
    const formattedDay = String(targetDay).padStart(2, '0');
    const formatted = `${targetYear}-${formattedMonth}-${formattedDay}`;
    
    console.log('✅ [ProductionDatePicker] Final output:', {
      selected: newDate.toString(),
      corrected: cleanDate.toString(),
      formatted: formatted
    });
    
    onChange(formatted);
  };
  
  // Custom text field to ensure proper display
  const CustomTextField = (props) => {
    // Override the value to ensure it shows correctly
    const displayValue = props.inputProps?.value || '';
    
    return (
      <TextField
        {...props}
        inputProps={{
          ...props.inputProps,
          value: displayValue
        }}
      />
    );
  };
  
  return (
    <DatePicker
      label={label}
      value={internalValue}
      onChange={handleDateChange}
      format={format}
      minDate={minDate || (!isEditing ? new Date() : null)}
      slots={{
        textField: CustomTextField
      }}
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

export default ProductionDatePicker;