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
 * PRODUCTION FIX: Compensates for timezone differences between dev and production
 */
export const handleDatePickerChange = (value) => {
  // Check if we're in production
  const isProduction = typeof window !== 'undefined' && 
    (window.location.hostname === 'ders.ba' || window.location.hostname === 'www.ders.ba');
  
  // Extensive logging for debugging
  console.log('🔍 [DATE FIX] DatePicker onChange:', {
    value,
    isProduction,
    type: typeof value,
    isDate: value instanceof Date,
    toString: value ? value.toString() : 'null',
    toISOString: value instanceof Date ? value.toISOString() : 'N/A',
    timezoneOffset: value instanceof Date ? value.getTimezoneOffset() : 'N/A',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hours: value instanceof Date ? value.getHours() : 'N/A',
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A'
  });
  
  if (!value) return '';
  
  // If it's already a Date object
  if (value instanceof Date) {
    // Get original components
    const originalDay = value.getDate();
    const originalMonth = value.getMonth();
    const originalYear = value.getFullYear();
    const originalHours = value.getHours();
    
    console.log('🔍 [DATE FIX] Original components:', {
      year: originalYear,
      month: originalMonth + 1,
      day: originalDay,
      hours: originalHours,
      minutes: value.getMinutes()
    });
    
    let correctedYear = originalYear;
    let correctedMonth = originalMonth;
    let correctedDay = originalDay;
    
    // PRODUCTION-SPECIFIC FIX: Only compensate on production
    // On production, if hours are 22 or 23, it means the date was shifted back
    if (isProduction && (originalHours === 22 || originalHours === 23)) {
      console.log('⚠️ [PRODUCTION FIX] Detected timezone shift on production! Hours are', originalHours);
      console.log('⚠️ [PRODUCTION FIX] Adding 1 day to compensate');
      
      // Add one day to compensate for production timezone issue
      const compensatedDate = new Date(originalYear, originalMonth, originalDay + 1, 12, 0, 0, 0);
      correctedYear = compensatedDate.getFullYear();
      correctedMonth = compensatedDate.getMonth();
      correctedDay = compensatedDate.getDate();
      
      console.log('✅ [PRODUCTION FIX] Compensated date:', {
        year: correctedYear,
        month: correctedMonth + 1,
        day: correctedDay
      });
    } else if (!isProduction) {
      console.log('🏠 [LOCAL DEV] No compensation needed, using original date');
    }
    
    // Create final date at noon with corrected components
    const finalDate = new Date(correctedYear, correctedMonth, correctedDay, 12, 0, 0, 0);
    
    // Format the final date
    const formattedMonth = String(finalDate.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(finalDate.getDate()).padStart(2, '0');
    const formatted = `${finalDate.getFullYear()}-${formattedMonth}-${formattedDay}`;
    
    console.log('📅 [DATE FIX] Final result:', {
      environment: isProduction ? 'PRODUCTION' : 'DEVELOPMENT',
      originalDate: value.toString(),
      originalHours: originalHours,
      wasCompensated: isProduction && (originalHours === 22 || originalHours === 23),
      finalDate: finalDate.toString(),
      output: formatted
    });
    
    return formatted;
  }
  
  // If it's a string, parse it properly
  if (typeof value === 'string') {
    const parsed = parseLocalDateString(value);
    const formatted = formatDateToLocalString(parsed);
    console.log('📅 [ULTIMATE FIX] String date formatted:', formatted, 'from:', value);
    return formatted;
  }
  
  // For any other type, try to convert to Date
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      // Apply same compensation logic
      const hours = date.getHours();
      let finalDate;
      
      if (hours === 22 || hours === 23) {
        // Compensate for timezone shift
        finalDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 1,
          12, 0, 0, 0
        );
        console.log('⚠️ [ULTIMATE FIX] Compensated converted date');
      } else {
        finalDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          12, 0, 0, 0
        );
      }
      
      const month = String(finalDate.getMonth() + 1).padStart(2, '0');
      const day = String(finalDate.getDate()).padStart(2, '0');
      const formatted = `${finalDate.getFullYear()}-${month}-${day}`;
      console.log('📅 [ULTIMATE FIX] Converted date formatted:', formatted, 'from:', value);
      return formatted;
    }
  } catch (e) {
    console.error('[ULTIMATE FIX] Failed to parse date:', e);
  }
  
  return '';
};