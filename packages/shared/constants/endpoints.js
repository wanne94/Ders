/**
 * API Endpoints Configuration
 * Central place for all API endpoints used in the application
 */

// Base URLs
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
                           process.env.EXPO_PUBLIC_API_URL ||
                           'https://ders.ba/api';

export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ||
                         process.env.EXPO_PUBLIC_SERVER_URL ||
                         'https://ders.ba';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  CHECK_AUTH: '/auth/check'
};

// User endpoints
export const USER_ENDPOINTS = {
  GET_ALL: '/users',
  GET_ONE: '/users/:id',
  CREATE: '/users',
  UPDATE: '/users/:id',
  DELETE: '/users/:id',
  UPDATE_PROFILE: '/users/profile',
  UPDATE_PASSWORD: '/users/password',
  UPDATE_ROLE: '/users/:id/role',
  ACTIVATE: '/users/:id/activate',
  DEACTIVATE: '/users/:id/deactivate'
};

// Lecture endpoints
export const LECTURE_ENDPOINTS = {
  GET_ALL: '/lectures',
  GET_ONE: '/lectures/:id',
  CREATE: '/lectures',
  UPDATE: '/lectures/:id',
  DELETE: '/lectures/:id',
  APPROVE: '/lectures/:id/approve',
  REJECT: '/lectures/:id/reject',
  CANCEL: '/lectures/:id/cancel',
  REACTIVATE: '/lectures/:id/reactivate',
  GET_BY_DAIJA: '/lectures/daija/:daijaId',
  GET_BY_ORGANIZATION: '/lectures/organization/:orgId',
  UPLOAD_IMAGE: '/lectures/:id/image'
};

// Daija endpoints
export const DAIJA_ENDPOINTS = {
  GET_ALL: '/daije',
  GET_ONE: '/daije/:id',
  CREATE: '/daije',
  UPDATE: '/daije/:id',
  DELETE: '/daije/:id',
  APPROVE: '/daije/:id/approve',
  REJECT: '/daije/:id/reject',
  GET_LECTURES: '/daije/:id/lectures',
  UPLOAD_IMAGE: '/daije/:id/image'
};

// Organization endpoints
export const ORGANIZATION_ENDPOINTS = {
  GET_ALL: '/organizations',
  GET_ONE: '/organizations/:id',
  CREATE: '/organizations',
  UPDATE: '/organizations/:id',
  DELETE: '/organizations/:id',
  APPROVE: '/organizations/:id/approve',
  REJECT: '/organizations/:id/reject',
  GET_LECTURES: '/organizations/:id/lectures',
  UPLOAD_IMAGE: '/organizations/:id/image'
};

// Suggestion endpoints
export const SUGGESTION_ENDPOINTS = {
  GET_ALL: '/suggestions',
  GET_ONE: '/suggestions/:id',
  CREATE: '/suggestions',
  UPDATE: '/suggestions/:id',
  DELETE: '/suggestions/:id',
  APPROVE: '/suggestions/:id/approve',
  REJECT: '/suggestions/:id/reject',
  ARCHIVE: '/suggestions/:id/archive'
};

// Report endpoints
export const REPORT_ENDPOINTS = {
  GET_ALL: '/reports',
  GET_ONE: '/reports/:id',
  CREATE: '/reports',
  UPDATE: '/reports/:id',
  DELETE: '/reports/:id',
  RESOLVE: '/reports/:id/resolve',
  GET_CANCELLATION_REPORTS: '/reports/cancellations'
};

// Settings endpoints
export const SETTINGS_ENDPOINTS = {
  GET_ALL: '/settings',
  GET_PUBLIC: '/settings/public',
  UPDATE: '/settings',
  UPDATE_APPROVAL: '/settings/approval',
  UPDATE_NOTIFICATIONS: '/settings/notifications'
};

// Search endpoints
export const SEARCH_ENDPOINTS = {
  GLOBAL: '/search',
  LECTURES: '/search/lectures',
  DAIJE: '/search/daije',
  ORGANIZATIONS: '/search/organizations',
  SUGGESTIONS: '/search/suggestions'
};

// Upload endpoints
export const UPLOAD_ENDPOINTS = {
  IMAGE: '/upload/image',
  IMAGES_MULTIPLE: '/upload/images',
  FILE: '/upload/file'
};

// Statistics endpoints
export const STATS_ENDPOINTS = {
  DASHBOARD: '/stats/dashboard',
  LECTURES: '/stats/lectures',
  USERS: '/stats/users',
  GROWTH: '/stats/growth'
};

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  GET_ALL: '/notifications',
  MARK_READ: '/notifications/:id/read',
  MARK_ALL_READ: '/notifications/read-all',
  DELETE: '/notifications/:id',
  SUBSCRIBE_PUSH: '/notifications/subscribe',
  UNSUBSCRIBE_PUSH: '/notifications/unsubscribe'
};

// Helper function to build endpoint with params
export const buildEndpoint = (endpoint, params = {}) => {
  let url = endpoint;

  // Replace path parameters
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });

  return url;
};

// Helper function to build full URL
export const buildFullUrl = (endpoint, params = {}, queryParams = {}) => {
  let url = `${API_BASE_URL}${buildEndpoint(endpoint, params)}`;

  // Add query parameters
  const queryString = Object.keys(queryParams)
    .filter(key => queryParams[key] !== undefined && queryParams[key] !== null)
    .map(key => `${key}=${encodeURIComponent(queryParams[key])}`)
    .join('&');

  if (queryString) {
    url += `?${queryString}`;
  }

  return url;
};

export default {
  API_BASE_URL,
  SERVER_URL,
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  LECTURE_ENDPOINTS,
  DAIJA_ENDPOINTS,
  ORGANIZATION_ENDPOINTS,
  SUGGESTION_ENDPOINTS,
  REPORT_ENDPOINTS,
  SETTINGS_ENDPOINTS,
  SEARCH_ENDPOINTS,
  UPLOAD_ENDPOINTS,
  STATS_ENDPOINTS,
  NOTIFICATION_ENDPOINTS,
  buildEndpoint,
  buildFullUrl
};