/**
 * Utility functions for DatePicker to handle timezone issues
 */

/**
 * Parse a YYYY-MM-DD string to a Date object at noon local time
 * This avoids timezone conversion issues
 * CRITICAL: Always creates date at 12:00 noon to prevent timezone shifts
 */
export const parseLocalDateString = (dateString) => {
  if (!dateString) return null;
  
  console.log('🔍 [PRODUCTION FIX] parseLocalDateString input:', dateString, typeof dateString);
  
  // Handle ISO date strings (with 'T') by extracting just the date part
  if (typeof dateString === 'string' && dateString.includes('T')) {
    dateString = dateString.split('T')[0];
    console.log('🔍 [PRODUCTION FIX] Extracted date from ISO string:', dateString);
  }
  
  // Ensure we have a string
  if (typeof dateString !== 'string') {
    console.error('[PRODUCTION FIX] parseLocalDateString expects a string, got:', typeof dateString);
    return null;
  }
  
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    console.error('[PRODUCTION FIX] Invalid date format, expected YYYY-MM-DD, got:', dateString);
    return null;
  }
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(parts[2], 10);
  
  // Validate parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    console.error('[PRODUCTION FIX] Invalid date parts:', { year, month, day });
    return null;
  }
  
  // CRITICAL FIX: Create date at noon (12:00) local time
  // This is the KEY to avoiding timezone issues
  const date = new Date(year, month, day, 12, 0, 0, 0);
  
  // Extensive logging for production debugging
  console.log('🔍 [PRODUCTION FIX] parseLocalDateString created:', {
    input: dateString,
    outputString: date.toString(),
    outputISO: date.toISOString(),
    localDateString: formatDateToLocalString(date),
    components: {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hours: date.getHours(),
      minutes: date.getMinutes()
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: date.getTimezoneOffset()
  });
  
  // Double-check the date is valid
  if (isNaN(date.getTime())) {
    console.error('[PRODUCTION FIX] Invalid date created from:', dateString);
    return null;
  }
  
  // Verify the date components match what we intended
  if (date.getFullYear() !== year || 
      date.getMonth() !== month || 
      date.getDate() !== day) {
    console.error('[PRODUCTION FIX] Date mismatch!', {
      expected: { year, month: month + 1, day },
      got: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
    });
    return null;
  }
  
  return date;
};

/**
 * Format a Date object to YYYY-MM-DD string using local timezone
 */
export const formatDateToLocalString = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date at start of day for minDate comparison
 */
export const getTodayStartOfDay = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Get today's date formatted as YYYY-MM-DD string
 */
export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Safely handle DatePicker onChange event
 * CRITICAL: This function ensures dates are handled correctly regardless of timezone
 */
export const handleDatePickerChange = (value) => {
  // Extensive logging for production debugging
  console.log('🔍 [PRODUCTION FIX] DatePicker onChange:', {
    value,
    type: typeof value,
    isDate: value instanceof Date,
    toString: value ? value.toString() : 'null',
    toISOString: value instanceof Date ? value.toISOString() : 'N/A',
    timezoneOffset: value instanceof Date ? value.getTimezoneOffset() : 'N/A',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hours: value instanceof Date ? value.getHours() : 'N/A',
    minutes: value instanceof Date ? value.getMinutes() : 'N/A'
  });
  
  if (!value) return '';
  
  // If it's already a Date object
  if (value instanceof Date) {
    // CRITICAL FIX: Create a new date at noon to avoid timezone issues
    // Even if DatePicker gives us midnight, we force it to noon
    const year = value.getFullYear();
    const month = value.getMonth();
    const day = value.getDate();
    
    // Create new date at noon (12:00) local time
    const noonDate = new Date(year, month, day, 12, 0, 0, 0);
    
    // Format using the noon date
    const formattedMonth = String(noonDate.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(noonDate.getDate()).padStart(2, '0');
    const formatted = `${noonDate.getFullYear()}-${formattedMonth}-${formattedDay}`;
    
    console.log('📅 [PRODUCTION FIX] Date formatted:', {
      originalDate: value.toString(),
      originalHours: value.getHours(),
      noonDate: noonDate.toString(),
      noonHours: noonDate.getHours(),
      output: formatted,
      components: {
        year: noonDate.getFullYear(),
        month: noonDate.getMonth() + 1,
        day: noonDate.getDate()
      }
    });
    
    return formatted;
  }
  
  // If it's a string, parse it properly
  if (typeof value === 'string') {
    const parsed = parseLocalDateString(value);
    const formatted = formatDateToLocalString(parsed);
    console.log('📅 [PRODUCTION FIX] String date formatted:', formatted, 'from:', value);
    return formatted;
  }
  
  // For any other type, try to convert to Date
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      // Force to noon as well
      const noonDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, 0, 0, 0
      );
      const month = String(noonDate.getMonth() + 1).padStart(2, '0');
      const day = String(noonDate.getDate()).padStart(2, '0');
      const formatted = `${noonDate.getFullYear()}-${month}-${day}`;
      console.log('📅 [PRODUCTION FIX] Converted date formatted:', formatted, 'from:', value);
      return formatted;
    }
  } catch (e) {
    console.error('[PRODUCTION FIX] Failed to parse date:', e);
  }
  
  return '';
};