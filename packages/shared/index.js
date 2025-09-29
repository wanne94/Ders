/**
 * Main entry point for @ders-ba/shared package
 * Exports all shared modules for use in web and mobile applications
 */

// Navigation exports
export * from './navigation/navigationConfig';

// Dashboard exports
export * from './dashboard/dashboardLogic';

// Constants exports
export * from './constants/roles';
export * from './constants/statuses';
export * from './constants/endpoints';
export * from './constants/colors';
export * from './constants/images';
export * from './constants/security';
export * from './constants/ui';

// Validation exports
export * from './validation/lectureValidation';

// Utils exports
export * from './utils';

// Re-export default exports
import navigationConfig from './navigation/navigationConfig';
import dashboardLogic from './dashboard/dashboardLogic';
import endpoints from './constants/endpoints';
import colors from './constants/colors';
import images from './constants/images';
import security from './constants/security';
import ui from './constants/ui';

export {
  navigationConfig,
  dashboardLogic,
  endpoints,
  colors,
  images,
  security,
  ui
};