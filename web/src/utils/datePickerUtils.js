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
  const dateString = `${year}-${month}-${day}`;
  
  console.log('📅 [getTodayDateString] Generated default date:', {
    today: today.toString(),
    dateString: dateString,
    environment: typeof window !== 'undefined' ? 
      (window.location?.hostname || 'unknown') : 'server/build'
  });
  
  return dateString;
};

/**
 * Safely handle DatePicker onChange event
 * PRODUCTION FIX: Compensates for timezone differences between dev and production
 */
export const handleDatePickerChange = (value) => {
  if (!value) return '';
  
  // Extensive logging for debugging
  console.log('🔍 [DATE FIX] DatePicker onChange:', {
    value,
    type: typeof value,
    isDate: value instanceof Date,
    toString: value ? value.toString() : 'null',
    toISOString: value instanceof Date ? value.toISOString() : 'N/A',
    timezoneOffset: value instanceof Date ? value.getTimezoneOffset() : 'N/A',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hours: value instanceof Date ? value.getHours() : 'N/A'
  });
  
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
    
    // SMART DETECTION: Check if date appears to be shifted
    // If hours are 22, 23, or 0, 1, 2 it's likely a timezone issue
    const isLikelyShifted = originalHours <= 2 || originalHours >= 22;
    
    let correctedYear = originalYear;
    let correctedMonth = originalMonth;
    let correctedDay = originalDay;
    
    if (isLikelyShifted) {
      console.log('⚠️ [TIMEZONE FIX] Detected potential timezone shift! Hours:', originalHours);
      
      // If early morning hours (0-2), the date is likely correct but time is wrong
      // If late evening hours (22-23), the date was shifted back one day
      if (originalHours >= 22) {
        console.log('⚠️ [TIMEZONE FIX] Late evening hours detected - adding 1 day');
        const compensatedDate = new Date(originalYear, originalMonth, originalDay + 1, 12, 0, 0, 0);
        correctedYear = compensatedDate.getFullYear();
        correctedMonth = compensatedDate.getMonth();
        correctedDay = compensatedDate.getDate();
        
        console.log('✅ [TIMEZONE FIX] Compensation applied:', {
          original: `${originalYear}-${originalMonth + 1}-${originalDay}`,
          corrected: `${correctedYear}-${correctedMonth + 1}-${correctedDay}`
        });
      } else {
        console.log('ℹ️ [TIMEZONE FIX] Early morning hours - using date as-is');
      }
    } else {
      console.log('✅ [DATE OK] No timezone shift detected');
    }
    
    // Create final date at noon with corrected components
    const finalDate = new Date(correctedYear, correctedMonth, correctedDay, 12, 0, 0, 0);
    
    // Format the final date
    const formattedMonth = String(finalDate.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(finalDate.getDate()).padStart(2, '0');
    const formatted = `${finalDate.getFullYear()}-${formattedMonth}-${formattedDay}`;
    
    console.log('📅 [DATE FIX] Final result:', {
      originalDate: value.toString(),
      originalHours: originalHours,
      wasCompensated: isLikelyShifted && originalHours >= 22,
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