/**
 * Utility functions for handling image URLs
 * 
 * NOTE: Base64 support is maintained for backward compatibility with:
 * - Existing database records that may still contain base64 images
 * - Any legacy data that hasn't been migrated yet
 */

const SERVER_URL = 'https://ders.ba';

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
  
  // For uploads, always serve from the server
  if (imagePath.includes('uploads/')) {
    // Ensure path starts with / and construct full server URL
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${SERVER_URL}${cleanPath}`;
  }
  
  // If it starts with /, it's a public path - serve from server
  if (imagePath.startsWith('/')) {
    return `${SERVER_URL}${imagePath}`;
  }
  
  // For other paths, construct full URL with server
  return `${SERVER_URL}/${imagePath}`;
};

/**
 * Get the default image URL for lectures
 * @returns {string} - The default lecture image URL
 */
export const getDefaultLectureImage = () => {
  return getImageUrl('/uploads/images/predavanjeslika.jpg');
};

/**
 * Get the default image URL for daijas
 * @returns {string} - The default daija image URL
 */
export const getDefaultDaijaImage = () => {
  return getImageUrl('/uploads/images/daijaslika.jpg');
};

/**
 * Get the default image URL for organizations
 * @returns {string} - The default organization image URL
 */
export const getDefaultOrganizationImage = () => {
  return getImageUrl('/uploads/images/udruzenjeslika.jpg');
};

export default {
  getImageUrl,
  getDefaultLectureImage,
  getDefaultDaijaImage,
  getDefaultOrganizationImage,
  SERVER_URL
}; 