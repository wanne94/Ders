// Common constants used across the application

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  SUPERADMIN: 'superadmin'
};

// Suggestion statuses
export const SUGGESTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Modal sizes
export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
};

// Sort orders
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc'
};

// Default pagination
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10
};

// API endpoints
export const API_ENDPOINTS = {
  USERS: '/api/users',
  LECTURES: '/api/lectures',
  ORGANIZATIONS: '/api/organizations',
  DAIJE: '/api/daije',
  SUGGESTIONS: '/api/suggestions',
  SETTINGS: '/api/settings'
};

export default {
  USER_ROLES,
  SUGGESTION_STATUS,
  THEME_MODES,
  MODAL_SIZES,
  SORT_ORDERS,
  DEFAULT_PAGINATION,
  API_ENDPOINTS
}; 