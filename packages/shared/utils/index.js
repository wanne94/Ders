/**
 * Main entry point for shared utilities
 * Exports all utility functions for use in web and mobile applications
 */

// React hooks
export { useDebounce } from './useDebounce.js';

// Date utilities
export * from './dateUtils.js';

// Image helpers
export * from './imageHelpers.js';

// Re-export default exports
import dateUtils from './dateUtils.js';
import imageHelpers from './imageHelpers.js';

export {
  dateUtils,
  imageHelpers
};