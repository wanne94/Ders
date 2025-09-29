/**
 * Main entry point for shared utilities
 * Exports all utility functions for use in web and mobile applications
 */

// React hooks
export { useDebounce } from './useDebounce';

// Date utilities
export * from './dateUtils';

// Image helpers
export * from './imageHelpers';

// Re-export default exports
import dateUtils from './dateUtils';
import imageHelpers from './imageHelpers';

export {
  dateUtils,
  imageHelpers
};