// API Configuration
export const API_CONFIG = {
  // Development: Use local IP address for physical device testing
  // Production: Use the live server at ders.ba
  BASE_URL: __DEV__ 
    ? 'http://192.168.0.20:5003/api'  // Development - your computer's IP
    // Alternative development options:
    // ? 'http://10.0.2.2:5003/api'  // Android Emulator
    // ? 'http://localhost:5003/api'  // iOS Simulator
    : 'https://ders.ba/api', // Production
  
  // Server URL without /api suffix (for images and other resources)
  SERVER_URL: __DEV__ 
    ? 'http://192.168.0.20:5003'  // Development
    : 'https://ders.ba', // Production
  
  ENDPOINTS: {
    LECTURES: '/lectures/public',
    ORGANIZATIONS: '/organizations',
    DAIJE: '/daije',
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export default API_CONFIG; 