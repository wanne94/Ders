/**
 * Utility functions for handling image URLs
 * 
 * All images are loaded from server directory in both development and production
 * 
 * NOTE: Base64 support is maintained for backward compatibility with:
 * - Existing database records that may still contain base64 images
 * - Any legacy data that hasn't been migrated yet
 */

// Always use server URL for images - no local public folder
const IMAGE_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://ders.ba';

/**
 * Get the full URL for an image
 * @param {string} imagePath - The image path (can be relative or full URL or base64 data)
 * @returns {string} - The full image URL or base64 data string
 */
export const getImageUrl = (imagePath) => {
  // Always load from server - unified /uploads/images/ path for both development and production
  const defaultImage = '/uploads/images/default.jpg';
  
  if (!imagePath) return `${IMAGE_SERVER_URL}${defaultImage}`;
  
  // If it's a base64 data URL, return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove 'public' from the path if it exists (legacy cleanup)
  let cleanPath = imagePath;
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.substring(7); // Remove 'public/' prefix
  }
  
  // Ensure we use unified /uploads/images/ path for both environments
  if (cleanPath.startsWith('/upload/images/')) {
    cleanPath = cleanPath.replace('/upload/images/', '/uploads/images/');
  } else if (cleanPath.startsWith('upload/images/')) {
    cleanPath = cleanPath.replace('upload/images/', '/uploads/images/');
  }
  
  // Ensure path starts with /uploads/images/ if it contains images
  if (!cleanPath.startsWith('/uploads/') && cleanPath.includes('images/')) {
    cleanPath = `/uploads/images/${cleanPath.replace(/^\/+/, '').replace(/^images\//, '')}`;
  }
  
  // Ensure path starts with /
  cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  
  // Always return server URL - no local public folder usage
  // Add timestamp to prevent caching
  const timestamp = Date.now();
  const separator = cleanPath.includes('?') ? '&' : '?';
  return `${IMAGE_SERVER_URL}${cleanPath}${separator}t=${timestamp}`;
};

/**
 * Get the default image URL for lectures
 * @returns {string} - The default lecture image URL
 */
export const getDefaultLectureImage = () => {
  const imagePath = '/uploads/images/predavanjeslika.jpg';
  const timestamp = Date.now();
  return `${IMAGE_SERVER_URL}${imagePath}?t=${timestamp}`;
};

/**
 * Get the default image URL for daijas
 * @returns {string} - The default daija image URL
 */
export const getDefaultDaijaImage = () => {
  const imagePath = '/uploads/images/daijaslika.jpg';
  const timestamp = Date.now();
  return `${IMAGE_SERVER_URL}${imagePath}?t=${timestamp}`;
};

/**
 * Get the default image URL for organizations
 * @returns {string} - The default organization image URL
 */
export const getDefaultOrganizationImage = () => {
  const imagePath = '/uploads/images/udruzenjeslika.jpg';
  const timestamp = Date.now();
  return `${IMAGE_SERVER_URL}${imagePath}?t=${timestamp}`;
};

/**
 * Get the logo URL
 * @returns {string} - The logo URL
 */
export const getLogoUrl = () => {
  const logoPath = '/uploads/logo.jpg';
  const timestamp = Date.now();
  return `${IMAGE_SERVER_URL}${logoPath}?t=${timestamp}`;
};

/**
 * Get the favicon URL
 * @returns {string} - The favicon URL
 */
export const getFaviconUrl = () => {
  const faviconPath = '/uploads/images/favicon.png';
  const timestamp = Date.now();
  return `${IMAGE_SERVER_URL}${faviconPath}?t=${timestamp}`;
};

export default {
  getImageUrl,
  getDefaultLectureImage,
  getDefaultDaijaImage,
  getDefaultOrganizationImage,
  getLogoUrl,
  getFaviconUrl
}; 