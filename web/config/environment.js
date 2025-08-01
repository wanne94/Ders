// Dynamic environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Base URLs based on environment
const config = {
  development: {
    API_URL: 'https://ders.ba/api',
    SERVER_URL: 'https://ders.ba',
    APP_URL: 'http://localhost:3000',
    DEBUG: true,
    LOG_LEVEL: 'debug',
    ENABLE_DEV_TOOLS: true,
    ENABLE_MOCK_DATA: false,
    CACHE_MAX_AGE: 0,
    ENABLE_ANALYTICS: false,
    // Firebase config for development (same as production for now)
    FIREBASE_API_KEY: 'YOUR_FIREBASE_API_KEY',
    FIREBASE_AUTH_DOMAIN: 'ders-6ea21.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'ders-6ea21',
    FIREBASE_STORAGE_BUCKET: 'ders-6ea21.appspot.com',
    FIREBASE_MESSAGING_SENDER_ID: 'YOUR_SENDER_ID',
    FIREBASE_APP_ID: 'YOUR_APP_ID',
    FIREBASE_MEASUREMENT_ID: 'YOUR_MEASUREMENT_ID'
  },
  production: {
    API_URL: 'https://ders.ba/api',
    SERVER_URL: 'https://ders.ba',
    APP_URL: 'https://ders.ba',
    DEBUG: false,
    LOG_LEVEL: 'error',
    ENABLE_DEV_TOOLS: false,
    ENABLE_MOCK_DATA: false,
    CACHE_MAX_AGE: 31536000,
    ENABLE_ANALYTICS: true,
    // Firebase config for production
    FIREBASE_API_KEY: 'YOUR_FIREBASE_API_KEY',
    FIREBASE_AUTH_DOMAIN: 'ders-6ea21.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'ders-6ea21',
    FIREBASE_STORAGE_BUCKET: 'ders-6ea21.appspot.com',
    FIREBASE_MESSAGING_SENDER_ID: 'YOUR_SENDER_ID',
    FIREBASE_APP_ID: 'YOUR_APP_ID',
    FIREBASE_MEASUREMENT_ID: 'YOUR_MEASUREMENT_ID'
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
  
  // Image server configuration - always use production server for images
  IMAGE_SERVER_URL: 'https://ders.ba',
  
  // Helper functions
  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Unified path handling for both environments - always use production server for images
    let cleanPath = imagePath;
    
    // Ensure /uploads/images/ format for both development and production
    cleanPath = imagePath.replace('/upload/images/', '/uploads/images/');
    if (!cleanPath.startsWith('/uploads/images/')) {
      cleanPath = `/uploads/images/${cleanPath.replace(/^\/+/, '')}`;
    }
    
    // Always use production server for images regardless of environment
    return `https://ders.ba${cleanPath}`;
  },
  
  getDefaultImages: () => ({
    lecture: `https://ders.ba/uploads/images/predavanjeslika.jpg`,
    daija: `https://ders.ba/uploads/images/daijaslika.jpg`,
    organization: `https://ders.ba/uploads/images/udruzenjeslika.jpg`,
    default: `https://ders.ba/uploads/images/default.jpg`,
    logo: `https://ders.ba/uploads/images/logo.jpg`,
    favicon: `https://ders.ba/uploads/images/favicon.png`
  })
};

// Log current configuration
console.log(`🌍 Environment: ${currentEnv}`);
console.log(`🔧 API URL: ${envConfig.API_URL}`);
console.log(`🔧 Server URL: ${envConfig.SERVER_URL}`);
console.log(`🔧 App URL: ${envConfig.APP_URL}`); 