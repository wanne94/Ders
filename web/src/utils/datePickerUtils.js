/**
 * Utility functions for DatePicker to handle timezone issues
 */

/**
 * Parse a YYYY-MM-DD string to a Date object at noon local time
 * This avoids timezone conversion issues
 */
export const parseLocalDateString = (dateString) => {
  if (!dateString) return null;
  
  console.log('🔍 parseLocalDateString input:', dateString);
  
  // Handle ISO date strings (with 'T') by extracting just the date part
  if (dateString.includes('T')) {
    dateString = dateString.split('T')[0];
  }
  
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(parts[2], 10);
  
  // Validate parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    console.error('Invalid date parts:', { year, month, day });
    return null;
  }
  
  // Create date at noon local time to avoid DST and timezone issues
  const date = new Date(year, month, day, 12, 0, 0, 0);
  
  console.log('🔍 parseLocalDateString created:', {
    input: dateString,
    output: date.toString(),
    isoString: date.toISOString(),
    components: {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    }
  });
  
  // Double-check the date is valid
  if (isNaN(date.getTime())) {
    return null;
  }
  
  // Verify the date components match what we intended
  // This catches cases where JavaScript "corrects" invalid dates
  if (date.getFullYear() !== year || 
      date.getMonth() !== month || 
      date.getDate() !== day) {
    console.error('Date mismatch!', {
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
 * Safely handle DatePicker onChange event
 * DatePicker might pass various formats depending on the adapter
 */
export const handleDatePickerChange = (value) => {
  // Detailed logging for production debugging
  console.log('🔍 DatePicker onChange DEBUG:', {
    value,
    type: typeof value,
    isDate: value instanceof Date,
    toString: value ? value.toString() : 'null',
    toISOString: value instanceof Date ? value.toISOString() : 'N/A',
    getTimezoneOffset: value instanceof Date ? value.getTimezoneOffset() : 'N/A',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  if (!value) return '';
  
  // If it's already a Date object
  if (value instanceof Date) {
    const formatted = formatDateToLocalString(value);
    console.log('📅 Formatted result:', formatted, 'from Date:', value.toString());
    return formatted;
  }
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    const parsed = parseLocalDateString(value);
    const formatted = formatDateToLocalString(parsed);
    console.log('📅 Formatted result:', formatted, 'from string:', value);
    return formatted;
  }
  
  // For any other type, try to convert to Date
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const formatted = formatDateToLocalString(date);
      console.log('📅 Formatted result:', formatted, 'from conversion:', value);
      return formatted;
    }
  } catch (e) {
    console.error('Failed to parse date:', e);
  }
  
  return '';
};