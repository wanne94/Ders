// Shared UI constants for web and mobile applications
// This ensures consistent UI behavior across all platforms

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system' // Follow system preference
};

// Modal/Dialog sizes
export const MODAL_SIZES = {
  SM: 'sm',    // Small - 400px max-width
  MD: 'md',    // Medium - 600px max-width  
  LG: 'lg',    // Large - 800px max-width
  XL: 'xl',    // Extra Large - 1200px max-width
  FULL: 'full' // Full screen
};

// Sort orders
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc'
};

// Default pagination settings
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  pageSizes: [5, 10, 20, 50, 100]
};

// Common breakpoints for responsive design
export const BREAKPOINTS = {
  xs: 0,      // Extra small devices
  sm: 600,    // Small devices
  md: 960,    // Medium devices  
  lg: 1280,   // Large devices
  xl: 1920    // Extra large devices
};

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500
};

// Z-index layers
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080
};

// Common spacing values (in pixels)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

// Form field sizes
export const FIELD_SIZES = {
  SM: 'small',
  MD: 'medium',
  LG: 'large'
};

// Button variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info',
  LIGHT: 'light',
  DARK: 'dark',
  LINK: 'link'
};

// Toast/Notification positions
export const TOAST_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_RIGHT: 'bottom-right'
};

// Toast/Notification durations (in milliseconds)
export const TOAST_DURATIONS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000
};

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Common aspect ratios for images/media
export const ASPECT_RATIOS = {
  SQUARE: '1:1',
  LANDSCAPE: '16:9',
  PORTRAIT: '9:16',
  WIDE: '21:9',
  STANDARD: '4:3'
};

export default {
  THEME_MODES,
  MODAL_SIZES,
  SORT_ORDERS,
  DEFAULT_PAGINATION,
  BREAKPOINTS,
  ANIMATION_DURATIONS,
  Z_INDEX,
  SPACING,
  FIELD_SIZES,
  BUTTON_VARIANTS,
  TOAST_POSITIONS,
  TOAST_DURATIONS,
  LOADING_STATES,
  ASPECT_RATIOS
};