// Shared image configuration and helpers for web and mobile applications
// This ensures consistent image handling across all platforms

// Image server configuration
export const IMAGE_CONFIG = {
  // Production server URL for all images
  IMAGE_SERVER_URL: 'https://ders.ba',
  UPLOAD_SERVER_URL: 'https://ders.ba',
  
  // Image paths
  IMAGE_BASE_PATH: '/uploads/images/',
  OPTIMIZED_PATH: '/optimized/',
  
  // Default images
  DEFAULT_IMAGES: {
    lecture: 'predavanjeslika.jpg',
    daija: 'daijaslika.jpg', 
    organization: 'udruzenjeslika.jpg',
    default: 'default.jpg',
    logo: 'logo.jpg',
    favicon: 'favicon.png',
    icon: 'icon.png',
    adaptiveIcon: 'adaptive-icon.png',
    splash: 'splash.png',
    splashIcon: 'splash-icon.png',
    maxResDefault: 'maxresdefault.jpg'
  }
};

// Get full URL for default images
export const getDefaultImages = () => ({
  lecture: `${IMAGE_CONFIG.IMAGE_SERVER_URL}${IMAGE_CONFIG.IMAGE_BASE_PATH}${IMAGE_CONFIG.DEFAULT_IMAGES.lecture}`,
  daija: `${IMAGE_CONFIG.IMAGE_SERVER_URL}${IMAGE_CONFIG.IMAGE_BASE_PATH}${IMAGE_CONFIG.DEFAULT_IMAGES.daija}`,
  organization: `${IMAGE_CONFIG.IMAGE_SERVER_URL}${IMAGE_CONFIG.IMAGE_BASE_PATH}${IMAGE_CONFIG.DEFAULT_IMAGES.organization}`,
  default: `${IMAGE_CONFIG.IMAGE_SERVER_URL}${IMAGE_CONFIG.IMAGE_BASE_PATH}${IMAGE_CONFIG.DEFAULT_IMAGES.default}`,
  logo: `${IMAGE_CONFIG.IMAGE_SERVER_URL}${IMAGE_CONFIG.IMAGE_BASE_PATH}${IMAGE_CONFIG.DEFAULT_IMAGES.logo}`,
  favicon: `${IMAGE_CONFIG.IMAGE_SERVER_URL}${IMAGE_CONFIG.IMAGE_BASE_PATH}${IMAGE_CONFIG.DEFAULT_IMAGES.favicon}`
});

// Helper to get default image by type
export const getDefaultImageByType = (type) => {
  const defaultImages = getDefaultImages();
  return defaultImages[type] || defaultImages.default;
};

// Individual default image getters for convenience
export const getDefaultLectureImage = () => getDefaultImageByType('lecture');
export const getDefaultDaijaImage = () => getDefaultImageByType('daija');
export const getDefaultOrganizationImage = () => getDefaultImageByType('organization');
export const getLogoUrl = () => getDefaultImageByType('logo');
export const getFaviconUrl = () => getDefaultImageByType('favicon');

// Core image URL helper function
export const getImageUrl = (imagePath, preferOptimized = false) => {
  // Return empty string for null/undefined
  if (!imagePath || imagePath === 'null' || imagePath === 'undefined') {
    return '';
  }

  // Trim whitespace
  const trimmedPath = imagePath.trim();

  // Return as-is for URLs that are already full URLs or data URIs
  if (trimmedPath.startsWith('http://') || 
      trimmedPath.startsWith('https://') || 
      trimmedPath.startsWith('data:') ||
      trimmedPath.startsWith('file://')) {
    
    // Return default for social media URLs
    if (isSocialMediaUrl(trimmedPath)) {
      return getDefaultLectureImage();
    }
    return trimmedPath;
  }

  // Handle base64 images (backward compatibility)
  if (trimmedPath.includes('base64,')) {
    return trimmedPath;
  }

  // Build the full URL
  let fullPath = trimmedPath;
  
  // Ensure path starts with /uploads/images/
  if (!fullPath.startsWith('/uploads/images/') && !fullPath.startsWith('uploads/images/')) {
    fullPath = fullPath.startsWith('/') ? fullPath.substring(1) : fullPath;
    fullPath = `uploads/images/${fullPath}`;
  }

  // Ensure leading slash
  if (!fullPath.startsWith('/')) {
    fullPath = '/' + fullPath;
  }

  // Add optimized path if preferred and not already optimized
  if (preferOptimized && !fullPath.includes('/optimized/')) {
    fullPath = fullPath.replace('/uploads/images/', '/uploads/images/optimized/');
  }

  return `${IMAGE_CONFIG.IMAGE_SERVER_URL}${fullPath}`;
};

// Get non-optimized version of image
export const getImageFallbackUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // Remove optimized from path if present
  const normalPath = imagePath.replace('/optimized/', '/');
  return getImageUrl(normalPath, false);
};

// Check if URL is from social media
const isSocialMediaUrl = (url) => {
  const socialDomains = [
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'youtube.com',
    'linkedin.com',
    'tiktok.com'
  ];
  
  return socialDomains.some(domain => url.includes(domain));
};

// List of default image filenames (used for filtering)
export const DEFAULT_IMAGE_FILENAMES = Object.values(IMAGE_CONFIG.DEFAULT_IMAGES);

export default {
  IMAGE_CONFIG,
  getDefaultImages,
  getDefaultImageByType,
  getDefaultLectureImage,
  getDefaultDaijaImage,
  getDefaultOrganizationImage,
  getLogoUrl,
  getFaviconUrl,
  getImageUrl,
  getImageFallbackUrl,
  DEFAULT_IMAGE_FILENAMES
};