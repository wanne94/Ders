export const ENV = {
  API_URL: 'https://ders.ba/api',
  SERVER_URL: 'https://ders.ba',
  // Add backup URLs for production
  BACKUP_API_URL: 'https://ders.ba/api',
  BACKUP_SERVER_URL: 'https://ders.ba',
  FALLBACK_API_URL: 'https://ders.ba/api',
  FALLBACK_SERVER_URL: 'https://ders.ba',
  
  // Image handling - same as development
  IMAGE_SERVER_URL: 'https://ders.ba',
  UPLOAD_SERVER_URL: 'https://ders.ba',
  
  APP_NAME: 'DERS Mobile',
  ENV_NAME: 'production',
  DEBUG: false,
  API_ENDPOINTS: {
    PREDAVANJA: '/lectures',
    DAIJE: '/daije',
    UDRUZENJA: '/organizations',
    USERS: '/users'
  },
  
  // Helper function za slike - isto kao development
  getImageUrl: (imagePath, preferOptimized = true) => {
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
    
    // For images in /uploads/images/, try optimized version first if preferred
    if (preferOptimized && cleanPath.startsWith('/uploads/images/') && !cleanPath.includes('/optimized/')) {
      const filename = cleanPath.replace('/uploads/images/', '');
      const optimizedPath = `/uploads/images/optimized/${filename}`;
      return `https://ders.ba${optimizedPath}`;
    }
    
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
}; 