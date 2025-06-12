// Dynamic environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Base URLs based on environment
const config = {
  development: {
    API_URL: 'http://localhost:5003/api',
    SERVER_URL: 'http://localhost:5003',
    APP_URL: 'http://localhost:3000',
    DEBUG: true,
    LOG_LEVEL: 'debug',
    ENABLE_DEV_TOOLS: true,
    ENABLE_MOCK_DATA: false,
    CACHE_MAX_AGE: 0,
    ENABLE_ANALYTICS: false
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
    ENABLE_ANALYTICS: true
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
  
  // Helper functions
  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Unified path handling for both environments
    let cleanPath = imagePath;
    
    // Ensure /uploads/images/ format for both development and production
    cleanPath = imagePath.replace('/upload/images/', '/uploads/images/');
    if (!cleanPath.startsWith('/uploads/images/')) {
      cleanPath = `/uploads/images/${cleanPath.replace(/^\/+/, '')}`;
    }
    
    return `${envConfig.SERVER_URL}${cleanPath}`;
  },
  
  getDefaultImages: () => ({
    lecture: `${envConfig.SERVER_URL}/uploads/images/predavanjeslika.jpg`,
    daija: `${envConfig.SERVER_URL}/uploads/images/daijaslika.jpg`,
    organization: `${envConfig.SERVER_URL}/uploads/images/udruzenjeslika.jpg`,
    default: `${envConfig.SERVER_URL}/uploads/images/default.jpg`,
    logo: `${envConfig.SERVER_URL}/uploads/logo.jpg`,
    favicon: `${envConfig.SERVER_URL}/uploads/images/favicon.png`
  })
};

// Log current configuration
console.log(`🌍 Environment: ${currentEnv}`);
console.log(`🔧 API URL: ${envConfig.API_URL}`);
console.log(`🔧 Server URL: ${envConfig.SERVER_URL}`);
console.log(`🔧 App URL: ${envConfig.APP_URL}`); 