/**
 * Main entry point for shared validation
 * Exports all validation modules for use in web and mobile applications
 */

// Export all validation modules
export * from './lectureValidation';
export * from './userValidation';
export * from './organizationValidation';
export * from './validationHelpers';

// Re-export default exports
import lectureValidation from './lectureValidation';
import userValidation from './userValidation';
import organizationValidation from './organizationValidation';
import validationHelpers from './validationHelpers';

export {
  lectureValidation,
  userValidation,
  organizationValidation,
  validationHelpers
};