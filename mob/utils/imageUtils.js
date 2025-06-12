/**
 * Utility functions for handling image URLs
 * 
 * NOTE: Base64 support is maintained for backward compatibility with:
 * - Existing database records that may still contain base64 images
 * - Any legacy data that hasn't been migrated yet
 */

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'http://192.168.0.20:5003';  // Replace X with your actual local IP

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

/**
 * Upload an image to the server
 * @param {string} uri - The local URI of the image to upload
 * @returns {Promise<string>} - The path of the uploaded image on the server
 */
export const uploadImage = async (uri) => {
  try {
    // Create form data
    const formData = new FormData();
    
    // Get the filename from the URI
    const filename = uri.split('/').pop();
    
    // Infer the type from the extension
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    // Append the image file to form data
    formData.append('image', {
      uri,
      name: filename,
      type
    });

    // Send the request to the server
    const response = await fetch(`${WEB_URL}/api/upload-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data.path;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
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