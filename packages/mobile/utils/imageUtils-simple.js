/**
 * Simple Mobile Image Utilities for consistent image handling
 * 
 * All images are loaded from server/uploads directory in both development and production
 * Includes mobile-specific upload functionality
 */

// Server configuration
const SERVER_URL = 'https://ders.ba';

/**
 * Get the full URL for an image
 * @param {string} imagePath - The image path (can be relative or full URL or base64 data)
 * @returns {string} - The full image URL or base64 data string
 */
export const getImageUrl = (imagePath) => {
  // Always load from server - unified /uploads/images/ path for both development and production
  const defaultImage = '/uploads/images/default.jpg';
  
  if (!imagePath) return `${SERVER_URL}${defaultImage}`;
  
  // If it's a base64 data URL, return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // If it's a local file URI (mobile specific), return as is for preview
  if (imagePath.startsWith('file://')) {
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
  return `${SERVER_URL}${cleanPath}`;
};

/**
 * Upload image to server (mobile-specific)
 * @param {string} imageUri - Local image URI from ImagePicker
 * @param {string} fileName - Optional filename
 * @returns {Promise<Object>} - Upload response with image path
 */
export const uploadImage = async (imageUri, fileName = null) => {
  try {
    const formData = new FormData();
    
    // Create file object for FormData
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const finalFileName = fileName || `mobile-upload-${Date.now()}.${fileExtension}`;
    
    formData.append('image', {
      uri: imageUri,
      type: `image/${fileExtension}`,
      name: finalFileName,
    });

    const response = await fetch(`${SERVER_URL}/api/upload-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    return result;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Get the default image URL for lectures
 * @returns {string} - The default lecture image URL
 */
export const getDefaultLectureImage = () => {
  const imagePath = '/uploads/images/predavanjeslika.jpg';
  return `${SERVER_URL}${imagePath}`;
};

/**
 * Get the default image URL for daijas
 * @returns {string} - The default daija image URL
 */
export const getDefaultDaijaImage = () => {
  const imagePath = '/uploads/images/daijaslika.jpg';
  return `${SERVER_URL}${imagePath}`;
};

/**
 * Get the default image URL for organizations
 * @returns {string} - The default organization image URL
 */
export const getDefaultOrganizationImage = () => {
  const imagePath = '/uploads/images/udruzenjeslika.jpg';
  return `${SERVER_URL}${imagePath}`;
};

/**
 * Get the logo URL
 * @returns {string} - The logo URL
 */
export const getLogoUrl = () => {
  // Return local asset path for offline capability
  return require('../assets/logo.jpg');
};

/**
 * Get the favicon URL
 * @returns {string} - The favicon URL
 */
export const getFaviconUrl = () => {
  const faviconPath = '/uploads/images/favicon.png';
  return `${SERVER_URL}${faviconPath}`;
};

export { SERVER_URL };

export default {
  getImageUrl,
  uploadImage,
  getDefaultLectureImage,
  getDefaultDaijaImage,
  getDefaultOrganizationImage,
  getLogoUrl,
  getFaviconUrl,
  SERVER_URL
};