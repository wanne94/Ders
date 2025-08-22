/**
 * Client-only date utilities to avoid SSR issues
 */

/**
 * Get today's date string - safe for client-side only
 * @returns {string} YYYY-MM-DD format
 */
export const getClientTodayString = () => {
  // Only run on client side
  if (typeof window === 'undefined') {
    console.log('⚠️ [getClientTodayString] Called during SSR, returning empty string');
    return '';
  }
  
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  console.log('📅 [getClientTodayString] Generated date on client:', {
    dateString,
    hostname: window.location.hostname,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  return dateString;
};

/**
 * Get default time - always returns 12:00
 * @returns {string} HH:MM format
 */
export const getDefaultTime = () => {
  return '12:00';
};