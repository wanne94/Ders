/**
 * Date Picker Configuration
 * Centralized configuration for handling date picker timezone issues
 */

// Environment detection
export const isProductionEnvironment = () => {
  // Multiple ways to detect production
  if (typeof window === 'undefined') return false;
  
  // Check hostname
  const hostname = window.location.hostname;
  const isProductionDomain = hostname === 'ders.ba' || 
                             hostname === 'www.ders.ba' ||
                             hostname.includes('ders.ba');
  
  // Check for HTTPS (production usually uses HTTPS)
  const isHttps = window.location.protocol === 'https:';
  
  // Check NODE_ENV if available
  const isProductionEnv = process.env.NODE_ENV === 'production';
  
  // Check NEXT_PUBLIC_ENV if set
  const isPublicProduction = process.env.NEXT_PUBLIC_ENV === 'production';
  
  return isProductionDomain || (isHttps && !hostname.includes('localhost'));
};

// Date compensation configuration
export const DATE_COMPENSATION_CONFIG = {
  // Force compensation on production
  forceCompensation: true,
  
  // Hours that indicate timezone shift
  shiftedHoursRange: {
    early: [0, 1, 2],  // Early morning hours
    late: [22, 23]     // Late evening hours
  },
  
  // Default time for dates
  defaultHour: 12,
  defaultMinute: 0
};

/**
 * Smart date correction function
 * Detects and fixes timezone-related date shifts
 */
export const correctDateForTimezone = (date) => {
  if (!date || !(date instanceof Date)) return date;
  
  const hours = date.getHours();
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  // Check if we're in production
  const isProduction = isProductionEnvironment();
  
  console.log('🔍 [DATE CONFIG] Checking date:', {
    date: date.toString(),
    hours,
    isProduction,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A'
  });
  
  // Determine if compensation is needed
  let needsCompensation = false;
  let compensationDays = 0;
  
  if (isProduction && DATE_COMPENSATION_CONFIG.forceCompensation) {
    // On production, check for shifted hours
    if (hours >= 22) {
      // Late evening - date was shifted back
      needsCompensation = true;
      compensationDays = 1;
      console.log('⚠️ [PRODUCTION] Late evening hours detected, will add 1 day');
    } else if (hours <= 2) {
      // Early morning - date might be correct but check context
      console.log('ℹ️ [PRODUCTION] Early morning hours, checking if compensation needed');
      // You might want to add additional logic here based on user's timezone
    }
  }
  
  // Apply compensation if needed
  if (needsCompensation) {
    const correctedDate = new Date(
      year, 
      month, 
      day + compensationDays, 
      DATE_COMPENSATION_CONFIG.defaultHour,
      DATE_COMPENSATION_CONFIG.defaultMinute,
      0,
      0
    );
    
    console.log('✅ [DATE CONFIG] Compensation applied:', {
      original: `${year}-${month + 1}-${day}`,
      corrected: `${correctedDate.getFullYear()}-${correctedDate.getMonth() + 1}-${correctedDate.getDate()}`
    });
    
    return correctedDate;
  }
  
  // No compensation needed, but still set to noon
  return new Date(
    year,
    month,
    day,
    DATE_COMPENSATION_CONFIG.defaultHour,
    DATE_COMPENSATION_CONFIG.defaultMinute,
    0,
    0
  );
};