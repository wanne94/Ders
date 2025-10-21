/**
 * Date utilities for web application
 * 
 * This file now acts as a bridge to the shared date utilities
 * while maintaining backward compatibility with existing code
 */

import {
  getTodayString,
  getDefaultTime,
  formatDate,
  formatDateWithDay
} from '@ders-ba/shared';

/**
 * Get today's date string - safe for client-side only
 * @returns {string} YYYY-MM-DD format
 */
export const getClientTodayString = () => {
  // Use shared function with clientOnly flag
  return getTodayString(true);
};

// Re-export shared function for backward compatibility
export { getDefaultTime };

// Also export shared date formatting functions
export { formatDate, formatDateWithDay };

// Default export for backward compatibility
const dateUtils = {
  getClientTodayString,
  getDefaultTime,
  formatDate,
  formatDateWithDay
};

export default dateUtils;