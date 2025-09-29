// Dynamic environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Import shared constants
const { getImageUrl, getDefaultImages } = require('@ders-ba/shared');

// Base URLs based on environment
const config = {
  development: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api',
    SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5004',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    DEBUG: true,
    LOG_LEVEL: 'debug',
    ENABLE_DEV_TOOLS: true,
    ENABLE_MOCK_DATA: false,
    CACHE_MAX_AGE: 0,
    ENABLE_ANALYTICS: false,
    // Firebase config for development (same as production for now)
    FIREBASE_API_KEY: 'AIzaSyA8hsgRprPm2JLUSFs3lsIsZzYDnJ-r-qo',
    FIREBASE_AUTH_DOMAIN: 'ders-6ea21.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'ders-6ea21',
    FIREBASE_STORAGE_BUCKET: 'ders-6ea21.appspot.com',
    FIREBASE_MESSAGING_SENDER_ID: '187360391937',
    FIREBASE_APP_ID: '1:187360391937:web:7ecfd06992e41c4e1be100',
    FIREBASE_MEASUREMENT_ID: 'G-XXXXXXXXXX'
  },
  production: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://ders.ba/api',
    SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'https://ders.ba',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://ders.ba',
    DEBUG: false,
    LOG_LEVEL: 'error',
    ENABLE_DEV_TOOLS: false,
    ENABLE_MOCK_DATA: false,
    CACHE_MAX_AGE: 31536000,
    ENABLE_ANALYTICS: true,
    // Firebase config for production
    FIREBASE_API_KEY: 'AIzaSyA8hsgRprPm2JLUSFs3lsIsZzYDnJ-r-qo',
    FIREBASE_AUTH_DOMAIN: 'ders-6ea21.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'ders-6ea21',
    FIREBASE_STORAGE_BUCKET: 'ders-6ea21.appspot.com',
    FIREBASE_MESSAGING_SENDER_ID: '187360391937',
    FIREBASE_APP_ID: '1:187360391937:web:7ecfd06992e41c4e1be100',
    FIREBASE_MEASUREMENT_ID: 'G-XXXXXXXXXX'
  }
};

// Get current environment config
const currentEnv = isDevelopment ? 'development' : 'production';
const envConfig = config[currentEnv];

// Export environment variables
module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: isProduction,
  ...envConfig,
  
  // Image server configuration - use shared constants
  IMAGE_SERVER_URL: 'https://ders.ba',
  
  // Use shared helper functions
  getImageUrl,
  getDefaultImages
};

// Log current configuration
console.log(`🌍 Environment: ${currentEnv}`);
console.log(`🔧 API URL: ${envConfig.API_URL}`);
console.log(`🔧 Server URL: ${envConfig.SERVER_URL}`);
console.log(`🔧 App URL: ${envConfig.APP_URL}`); 