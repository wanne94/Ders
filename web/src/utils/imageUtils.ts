/**
 * Utility functions for handling image URLs
 * Web application specific implementation
 */

/**
 * Get the server URL based on environment
 * For web: uses NEXT_PUBLIC_SERVER_URL or localhost for development
 */
export const getServerUrl = (): string => {
  return process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5003';
};

/**
 * Get the full URL for an image
 * @param {string} imagePath - The image path (can be relative or full URL or base64 data)
 * @returns {string | null} - The full image URL or base64 data string
 */
export const getImageUrl = (imagePath?: string): string | null => {
  if (!imagePath) return null;
  
  // If it's a base64 data URL, return as is (backward compatibility)
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  const serverUrl = getServerUrl();
  
  // For uploads, always serve from the server
  if (imagePath.includes('uploads/')) {
    // Ensure path starts with / and construct full server URL
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${serverUrl}${cleanPath}`;
  }
  
  // If it starts with /, it's a public path - serve from server
  if (imagePath.startsWith('/')) {
    return `${serverUrl}${imagePath}`;
  }
  
  // For other paths, construct full URL with server
  return `${serverUrl}/${imagePath}`;
};

/**
 * Get the default image URL for lectures
 * @returns {string} - The default lecture image URL
 */
export const getDefaultLectureImage = (): string => {
  const serverUrl = getServerUrl();
  return `${serverUrl}/uploads/images/predavanjeslika.jpg`;
};

/**
 * Get the default image URL for daijas
 * @returns {string} - The default daija image URL
 */
export const getDefaultDaijaImage = (): string => {
  const serverUrl = getServerUrl();
  return `${serverUrl}/uploads/images/daijaslika.jpg`;
};

/**
 * Get the default image URL for organizations
 * @returns {string} - The default organization image URL
 */
export const getDefaultOrganizationImage = (): string => {
  const serverUrl = getServerUrl();
  return `${serverUrl}/uploads/images/udruzenjeslika.jpg`;
};

/**
 * Get the appropriate default image based on type
 * @param {string} type - The type of entity (lecture, daija, organization)
 * @returns {string} - The default image URL
 */
export const getDefaultImageByType = (type: 'lecture' | 'daija' | 'organization'): string => {
  switch (type) {
    case 'daija':
      return getDefaultDaijaImage();
    case 'organization':
      return getDefaultOrganizationImage();
    default:
      return getDefaultLectureImage();
  }
}; 