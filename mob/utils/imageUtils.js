/**
 * Utility functions for handling image URLs
 * 
 * NOTE: Base64 support is maintained for backward compatibility with:
 * - Existing database records that may still contain base64 images
 * - Any legacy data that hasn't been migrated yet
 */

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'http://localhost:3000';

/**
 * Get the full URL for an image
 * @param {string} imagePath - The image path (can be relative or full URL or base64 data)
 * @returns {string} - The full image URL or base64 data string
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's a base64 data URL, return as is (backward compatibility)
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // For uploads, serve from Next.js public directory via web URL
  if (imagePath.includes('uploads/') || imagePath.includes('upload/')) {
    // Ensure path starts with / for Next.js public directory
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${WEB_URL}${cleanPath}`;
  }
  
  // If it starts with /, it's a public path - serve from Next.js public directory
  if (imagePath.startsWith('/')) {
    return `${WEB_URL}${imagePath}`;
  }
  
  // For other paths, construct path for Next.js public directory
  return `${WEB_URL}/${imagePath}`;
};

/**
 * Get the default image URL for lectures
 * @returns {string} - The default lecture image URL
 */
export const getDefaultLectureImage = () => {
  // Mobile app always uses web URL, so use upload path (development path)
  return getImageUrl('/upload/images/predavanjeslika.jpg');
};

/**
 * Get the default image URL for daijas
 * @returns {string} - The default daija image URL
 */
export const getDefaultDaijaImage = () => {
  // Mobile app always uses web URL, so use upload path (development path)
  return getImageUrl('/upload/images/daijaslika.jpg');
};

/**
 * Get the default image URL for organizations
 * @returns {string} - The default organization image URL
 */
export const getDefaultOrganizationImage = () => {
  // Mobile app always uses web URL, so use upload path (development path)
  return getImageUrl('/upload/images/udruzenjeslika.jpg');
};

/**
 * Get the logo URL
 * @returns {string} - The logo URL
 */
export const getLogoUrl = () => {
  // Mobile app always uses web URL, so use upload path (development path)
  return getImageUrl('/upload/logo.jpg');
};

/**
 * Get the favicon URL
 * @returns {string} - The favicon URL
 */
export const getFaviconUrl = () => {
  // Mobile app always uses web URL, so use upload path (development path)
  return getImageUrl('/upload/images/favicon.png');
};

export default {
  getImageUrl,
  getDefaultLectureImage,
  getDefaultDaijaImage,
  getDefaultOrganizationImage,
  getLogoUrl,
  getFaviconUrl,
  WEB_URL
}; 