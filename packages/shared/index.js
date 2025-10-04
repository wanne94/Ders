/**
 * Main entry point for @ders-ba/shared package
 * Exports all shared modules for use in web and mobile applications
 */

// Navigation exports
export * from './navigation/navigationConfig.js';

// Dashboard exports
export * from './dashboard/dashboardLogic.js';

// Constants exports
export * from './constants/roles.js';
export * from './constants/statuses.js';
export * from './constants/endpoints.js';
export * from './constants/colors.js';
export * from './constants/images.js';
export * from './constants/security.js';
export * from './constants/ui.js';

// Validation exports
export * from './validation/lectureValidation.js';
export {
  USER_VALIDATION_RULES,
  validateUserForm,
  sanitizeUserData,
  isUserFormValid,
  getPasswordStrength,
  validateField as validateUserField
} from './validation/userValidation.js';
export {
  ORGANIZATION_VALIDATION_RULES,
  ORGANIZATION_IMAGE_RULES,
  validateOrganizationForm,
  validateOrganizationImage,
  sanitizeOrganizationData,
  isOrganizationFormValid,
  validateField as validateOrganizationField
} from './validation/organizationValidation.js';
export {
  mergeErrors as mergeValidationErrors,
  hasErrors,
  getFirstError,
  formatErrors,
  sanitizeInput,
  isEmpty,
  isAlphanumeric,
  isLengthValid,
  isValidEmail,
  isValidPhone,
  isValidUrl
} from './validation/validationHelpers.js';

// Utils exports
export * from './utils/index.js';

// Re-export default exports
import navigationConfig from './navigation/navigationConfig.js';
import dashboardLogic from './dashboard/dashboardLogic.js';
import endpoints from './constants/endpoints.js';
import colors from './constants/colors.js';
import images from './constants/images.js';
import security from './constants/security.js';
import ui from './constants/ui.js';

export {
  navigationConfig,
  dashboardLogic,
  endpoints,
  colors,
  images,
  security,
  ui
};
