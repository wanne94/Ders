// Konfiguracija za Expo Go development
const getLocalIP = () => {
  // Koristimo produkcijsku API adresu jer lokalni server ne radi
  return 'https://ders.ba';
};;

const getBackupURL = () => {
  // Backup opcija - može se koristiti alternativna IP adresa
  return 'http://192.168.0.20:5004';
};

const getFallbackLocalURL = () => {
  // Fallback opcija
  return 'http://192.168.0.20:5004';
};

export const ENV = {
  IS_DEV: true,
  
  // API Configuration  
  API_URL: `http://localhost:5004/api`,
  SERVER_URL: `http://localhost:5004/api`,
  BACKUP_API_URL: `https://ders.ba/api`,
  UPLOADS_URL: `http://localhost:5004/uploads`,
  FALLBACK_API_URL: `https://ders.ba/api`, // Fallback URL
  
  // Image handling
  IMAGE_SERVER_URL: 'https://ders.ba',
  UPLOAD_SERVER_URL: 'https://ders.ba',
  
  // App info
  APP_NAME: 'DERS Mobile',
  ENV_NAME: 'development',
  DEBUG: true,
  
  // WebSocket
  WS_URL: 'wss://ders.ba',

  // API Endpoints (relative to API_URL)
  API_ENDPOINTS: {
    PREDAVANJA: '/lectures',
    DAIJE: '/daije',
    UDRUZENJA: '/organizations',
    USERS: '/users'
  },

  // Features
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_ANALYTICS: false,

  // Other settings
  LOG_LEVEL: 'debug',
  REQUEST_TIMEOUT: 30000,
  MAX_RETRY_ATTEMPTS: 3,
  
  // Helper function za slike
  getImageUrl: (imagePath, preferOptimized = false) => {
    if (!imagePath) return 'https://ders.ba/uploads/images/default.jpg';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Unified path handling
    let cleanPath = imagePath;
    
    // Ensure /uploads/images/ format
    cleanPath = imagePath.replace('/upload/images/', '/uploads/images/');
    if (!cleanPath.startsWith('/uploads/images/')) {
      cleanPath = `/uploads/images/${cleanPath.replace(/^\/+/, '')}`;
    }
    
    // Ne koristi optimized verziju jer ne postoji na serveru
    // Direktno vrati običnu putanju
    return `https://ders.ba${cleanPath}`;
  },
  
  // Helper function for fallback (non-optimized) images
  getImageFallbackUrl: (imagePath) => {
    return module.exports.getImageUrl(imagePath, false);
  },
  
  getDefaultImages: () => ({
    lecture: 'https://ders.ba/uploads/images/predavanjeslika.jpg',
    daija: 'https://ders.ba/uploads/images/daijaslika.jpg',
    organization: 'https://ders.ba/uploads/images/udruzenjeslika.jpg',
    default: 'https://ders.ba/uploads/images/default.jpg',
    logo: 'https://ders.ba/uploads/images/logo.jpg'
  })
};;; 