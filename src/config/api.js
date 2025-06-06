// API Configuration for DERS Mobile App

import Constants from 'expo-constants';

// API Configuration
const isDevelopment = __DEV__;

// Debug info
console.log('🔍 API Config Debug:');
console.log('  - __DEV__:', __DEV__);
console.log('  - isDevelopment:', isDevelopment);
console.log('  - Constants.expoConfig?.extra?.apiUrl:', Constants.expoConfig?.extra?.apiUrl);

export const API_CONFIG = {
  // Use localhost for development, production for production
  BASE_URL: isDevelopment 
    ? 'http://192.168.0.20:5003' 
    : Constants.expoConfig?.extra?.apiUrl || 'https://ders.ba',
  
  // Previous production config:
  // BASE_URL: 'https://ders.ba',
  
  TIMEOUT: 10000,
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
    },
    LECTURES: {
      GET_ALL: '/api/lectures',
      GET_BY_ID: '/api/lectures',
      CREATE: '/api/lectures',
      UPDATE: '/api/lectures',
      DELETE: '/api/lectures',
    },
    DAIJE: {
      GET_ALL: '/api/daije',
      GET_BY_ID: '/api/daije',
      CREATE: '/api/daije',
      UPDATE: '/api/daije',
      DELETE: '/api/daije',
    },
    ORGANIZATIONS: {
      GET_ALL: '/api/organizations',
      GET_BY_ID: '/api/organizations',
      CREATE: '/api/organizations',
      UPDATE: '/api/organizations',
      DELETE: '/api/organizations',
    },
    USERS: {
      PROFILE: '/api/users/profile',
      UPDATE_PROFILE: '/api/users/profile',
    }
  }
};

// Debug log final URL
console.log('🔗 Final API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
console.log('🔗 Environment:', isDevelopment ? 'DEVELOPMENT (local server)' : 'PRODUCTION');

export default API_CONFIG;

// Base URL for the API
// Change this to match your server's URL
export const API_BASE_URL = API_CONFIG.BASE_URL;

// Alternative URLs for different environments
export const API_URLS = {
  emulator: 'http://10.0.2.2:5003',          // Android emulator (maps to host localhost)
  localhost: 'http://localhost:5003',        // For web testing
  network: 'http://192.168.0.20:5003',      // Your computer's IP address for device testing
  production: 'https://ders.ba',             // Production server using domain name (same as web app)
  production_direct: 'http://ders.ba:5003',  // Direct backend access (backup)
  production_ip: 'http://194.163.176.171:5003', // Production server IP (backup)
};

// Timeout settings
export const API_TIMEOUT = API_CONFIG.TIMEOUT;

// Other API settings
export const API_CONFIG_FULL = {
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Get the current API URL based on environment
export const getCurrentApiUrl = () => {
  // Use the main API_CONFIG.BASE_URL which automatically switches between dev and production
  const url = API_CONFIG.BASE_URL;
  console.log('🔗 getCurrentApiUrl() returning:', url);
  return url;
};

// Export SERVER_URL for image utilities
export const SERVER_URL = getCurrentApiUrl(); 