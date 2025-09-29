/**
 * Shared date utilities for web and mobile applications
 * Provides consistent date handling across all platforms
 */

// Days of week in Bosnian
export const DAYS_OF_WEEK = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];

// Month names in Bosnian
export const MONTHS = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
];

/**
 * Format date with day of week
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date with day (e.g., "01.12.2023 (Petak)")
 */
export const formatDateWithDay = (dateInput) => {
  if (!dateInput) return '';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const dayOfWeek = DAYS_OF_WEEK[date.getDay()];

  return `${day}.${month}.${year} (${dayOfWeek})`;
};

/**
 * Format date in DD.MM.YYYY format
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date (e.g., "01.12.2023")
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
};

/**
 * Get today's date string in YYYY-MM-DD format
 * Safe for both client and server side
 * @param {boolean} clientOnly - If true, returns empty string on server side
 * @returns {string} YYYY-MM-DD format
 */
export const getTodayString = (clientOnly = false) => {
  // For client-only mode, check if running on server
  if (clientOnly && typeof window === 'undefined') {
    return '';
  }
  
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Get default time
 * @returns {string} HH:MM format (default: "12:00")
 */
export const getDefaultTime = () => {
  return '12:00';
};

/**
 * Parse date and time from ISO string
 * @param {string} isoString - ISO date string
 * @returns {Object} Object with date (YYYY-MM-DD) and time (HH:MM)
 */
export const parseDateTimeFromISO = (isoString) => {
  if (!isoString) return { date: '', time: '' };
  
  const dateObj = new Date(isoString);
  if (isNaN(dateObj.getTime())) return { date: '', time: '' };
  
  const date = getTodayString();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const time = `${hours}:${minutes}`;
  
  return { date, time };
};

/**
 * Combine date and time into ISO string
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @returns {string} ISO date string
 */
export const combineDateTimeToISO = (date, time) => {
  if (!date) return '';
  
  const [hours = '00', minutes = '00'] = (time || '00:00').split(':');
  const isoString = `${date}T${hours}:${minutes}:00.000Z`;
  
  return isoString;
};

/**
 * Check if date is in the past
 * @param {string|Date} dateInput - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isDateInPast = (dateInput) => {
  if (!dateInput) return false;
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  return date < today;
};

/**
 * Check if date is today
 * @param {string|Date} dateInput - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (dateInput) => {
  if (!dateInput) return false;
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return false;
  
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Get relative time string (e.g., "prije 2 dana", "za 3 sata")
 * @param {string|Date} dateInput - Date to compare
 * @returns {string} Relative time string in Bosnian
 */
export const getRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffMs = date - now;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (Math.abs(diffDays) > 30) {
    return formatDate(date);
  }
  
  if (diffDays === 0) {
    if (diffHours === 0) {
      if (diffMins === 0) {
        return 'sada';
      }
      return diffMins > 0 ? `za ${diffMins} min` : `prije ${Math.abs(diffMins)} min`;
    }
    return diffHours > 0 ? `za ${diffHours} h` : `prije ${Math.abs(diffHours)} h`;
  }
  
  return diffDays > 0 ? `za ${diffDays} dan(a)` : `prije ${Math.abs(diffDays)} dan(a)`;
};

// Export all functions as default for convenience
export default {
  DAYS_OF_WEEK,
  MONTHS,
  formatDateWithDay,
  formatDate,
  getTodayString,
  getDefaultTime,
  parseDateTimeFromISO,
  combineDateTimeToISO,
  isDateInPast,
  isToday,
  getRelativeTime
};