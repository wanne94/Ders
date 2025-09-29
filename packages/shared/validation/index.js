/**
 * Main entry point for shared validation
 * Exports all validation modules for use in web and mobile applications
 */

// Export all validation modules
export * from './lectureValidation.js';
export * from './userValidation.js';
export * from './organizationValidation.js';
export * from './validationHelpers.js';

// Re-export default exports
import lectureValidation from './lectureValidation.js';
import userValidation from './userValidation.js';
import organizationValidation from './organizationValidation.js';
import validationHelpers from './validationHelpers.js';

export {
  lectureValidation,
  userValidation,
  organizationValidation,
  validationHelpers
};