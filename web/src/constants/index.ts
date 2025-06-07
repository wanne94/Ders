// Application constants

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile'
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: '/users',
    DELETE: '/users',
    AUTH: '/users/auth',
    REGISTER: '/users/register'
  },
  LECTURES: {
    LIST: '/lectures',
    PUBLIC: '/lectures/public',
    DASHBOARD_PUBLIC: '/lectures/dashboard/public',
    BY_ID: (id: string) => `/lectures/${id}`,
    BY_DAIJA: (id: string) => `/lectures/daija/${id}`,
    BY_ORGANIZATION: (id: string) => `/lectures/organization/${id}`
  },
  DAIJE: {
    LIST: '/daije',
    BY_ID: (id: string) => `/daije/${id}`,
    BY_SLUG: (slug: string) => `/daije/slug/${slug}`
  },
  ORGANIZATIONS: {
    LIST: '/organizations',
    BY_ID: (id: string) => `/organizations/${id}`,
    BY_SLUG: (slug: string) => `/organizations/slug/${slug}`
  },
  SUGGESTIONS: {
    LIST: '/suggestions',
    CREATE: '/suggestions',
    BY_ID: (id: string) => `/suggestions/${id}`
  },
  UPLOAD: {
    IMAGE: '/upload-image'
  }
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  REGISTRATION_SUCCESS: 'registrationSuccess'
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50
} as const;

// Status constants
export const STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
  ACTIVE: 'active' // Backward compatibility
} as const;

// Status display names
export const STATUS_LABELS = {
  [STATUS.APPROVED]: 'Odobreno',
  [STATUS.PENDING]: 'Na čekanju',
  [STATUS.REJECTED]: 'Odbačeno',
  [STATUS.ACTIVE]: 'Odobreno' // Backward compatibility
} as const;

// Status colors for web (MUI color names)
export const STATUS_COLORS_WEB = {
  [STATUS.APPROVED]: 'success',
  [STATUS.PENDING]: 'warning',
  [STATUS.REJECTED]: 'error',
  [STATUS.ACTIVE]: 'success' // Backward compatibility
} as const;

// Status colors for mobile (hex colors)
export const STATUS_COLORS_MOBILE = {
  [STATUS.APPROVED]: '#4caf50',
  [STATUS.PENDING]: '#ff9800',
  [STATUS.REJECTED]: '#f44336',
  [STATUS.ACTIVE]: '#4caf50' // Backward compatibility
} as const;

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  MODERATOR: 'moderator'
} as const;

// Role display names
export const ROLE_LABELS = {
  [USER_ROLES.USER]: 'Korisnik',
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.SUPER_ADMIN]: 'Super Administrator',
  [USER_ROLES.MODERATOR]: 'Moderator'
} as const; 