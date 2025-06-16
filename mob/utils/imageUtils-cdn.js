/**
 * Mobile Image Utilities with CDN support
 * 
 * Supports both legacy /uploads paths and new /cdn paths
 * Automatically handles different image sizes and formats
 * Includes mobile-specific upload functionality
 */

// Server configuration
const SERVER_URL = 'https://ders.ba';

// Available image sizes
const IMAGE_SIZES = {
  THUMB: 'thumb',
  MEDIUM: 'medium',
  ORIGINAL: 'original'
};

/**
 * Get the full URL for an image with CDN support
 * @param {string} imagePath - The image path (can be relative or full URL or base64 data)
 * @param {string} size - Desired size: 'thumb', 'medium', or 'original' (default: 'medium')
 * @param {string} format - Desired format: 'webp' or 'jpeg' (default: 'webp')
 * @returns {string} - The full image URL or base64 data string
 */
export const getImageUrl = (imagePath, size = IMAGE_SIZES.MEDIUM, format = 'webp') => {
  // Default images
  const defaultImages = {
    lecture: '/cdn/images/defaults/predavanjeslika.jpg',
    daija: '/cdn/images/defaults/daijaslika.jpg',
    organization: '/cdn/images/defaults/udruzenjeslika.jpg',
    default: '/cdn/images/defaults/default.jpg'
  };
  
  if (!imagePath) return `${SERVER_URL}${defaultImages.default}`;
  
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
  
  // Handle new CDN paths
  if (imagePath.startsWith('/cdn/')) {
    // If it's already a CDN path with size suffix, use as is
    if (imagePath.includes('-thumb.') || imagePath.includes('-medium.') || imagePath.includes('-original.')) {
      return `${SERVER_URL}${imagePath}`;
    }
    
    // Otherwise, add size suffix
    const baseName = imagePath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    return `${SERVER_URL}${baseName}-${size}.${format}`;
  }
  
  // Handle legacy /uploads paths
  if (imagePath.startsWith('/uploads/')) {
    // For backward compatibility, return legacy path as is
    return `${SERVER_URL}${imagePath}`;
  }
  
  // Clean up legacy paths
  let cleanPath = imagePath;
  
  // Remove 'public' from the path if it exists
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.substring(7);
  }
  
  // Fix common path variations
  if (cleanPath.startsWith('/upload/images/')) {
    cleanPath = cleanPath.replace('/upload/images/', '/uploads/images/');\n  } else if (cleanPath.startsWith('upload/images/')) {
    cleanPath = cleanPath.replace('upload/images/', '/uploads/images/');
  }
  
  // Ensure path starts with /
  cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  
  // For any other path, assume it's a legacy upload
  if (!cleanPath.startsWith('/uploads/') && !cleanPath.startsWith('/cdn/')) {
    cleanPath = `/uploads/images/${cleanPath.replace(/^\/+/, '')}`;
  }
  
  return `${SERVER_URL}${cleanPath}`;
};

/**
 * Get image URL with specific size
 * @param {string} imagePath - The image path
 * @param {string} size - Size: 'thumb', 'medium', or 'original'
 * @returns {string} - The image URL with requested size
 */
export const getImageUrlWithSize = (imagePath, size) => {
  return getImageUrl(imagePath, size);
};

/**
 * Get thumbnail URL for an image
 * @param {string} imagePath - The image path
 * @returns {string} - The thumbnail URL
 */
export const getThumbnailUrl = (imagePath) => {
  return getImageUrl(imagePath, IMAGE_SIZES.THUMB);
};

/**
 * Upload image to server (mobile-specific)
 * @param {string} imageUri - Local image URI from ImagePicker
 * @param {string} fileName - Optional filename
 * @returns {Promise<Object>} - Upload response with image paths
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
 * Process image response from upload API
 * @param {Object} uploadResponse - Response from upload API
 * @returns {string} - The best available image path
 */
export const processUploadResponse = (uploadResponse) => {
  // If new CDN path is available, use it
  if (uploadResponse.path) {
    return uploadResponse.path;
  }
  
  // Fall back to legacy path
  if (uploadResponse.legacyPath) {
    return uploadResponse.legacyPath;
  }
  
  // If sizes object is available, use medium size
  if (uploadResponse.sizes && uploadResponse.sizes.medium) {
    return uploadResponse.sizes.medium.webp || uploadResponse.sizes.medium.jpeg;
  }
  
  return null;
};

/**
 * Get the default image URL for lectures
 * @returns {string} - The default lecture image URL
 */
export const getDefaultLectureImage = () => {
  const imagePath = '/cdn/images/defaults/predavanjeslika.jpg';
  return `${SERVER_URL}${imagePath}`;
};

/**
 * Get the default image URL for daijas
 * @returns {string} - The default daija image URL
 */
export const getDefaultDaijaImage = () => {
  const imagePath = '/cdn/images/defaults/daijaslika.jpg';
  return `${SERVER_URL}${imagePath}`;
};

/**
 * Get the default image URL for organizations
 * @returns {string} - The default organization image URL
 */
export const getDefaultOrganizationImage = () => {
  const imagePath = '/cdn/images/defaults/udruzenjeslika.jpg';
  return `${SERVER_URL}${imagePath}`;
};

/**
 * Get the logo URL
 * @returns {string} - The logo URL
 */
export const getLogoUrl = () => {
  const logoPath = '/cdn/images/defaults/logo.jpg';
  return `${SERVER_URL}${logoPath}`;
};

/**
 * Get the favicon URL
 * @returns {string} - The favicon URL
 */
export const getFaviconUrl = () => {
  const faviconPath = '/cdn/images/defaults/favicon.png';
  return `${SERVER_URL}${faviconPath}`;
};

export { IMAGE_SIZES, SERVER_URL };

export default {
  getImageUrl,
  getImageUrlWithSize,
  getThumbnailUrl,
  uploadImage,
  processUploadResponse,
  getDefaultLectureImage,
  getDefaultDaijaImage,
  getDefaultOrganizationImage,
  getLogoUrl,
  getFaviconUrl,
  IMAGE_SIZES,
  SERVER_URL
};