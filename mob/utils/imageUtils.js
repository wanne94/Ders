/**
 * Simple Mobile Image Utilities for consistent image handling
 * 
 * Hibridni pristup kao web aplikacija:
 * - API pozivi: lokalni server (development)
 * - Slike: uvek produkcijski server (https://ders.ba)
 */

import { ENV } from '../config';

/**
 * Get the full URL for an image
 * @param {string} imagePath - The image path (can be relative or full URL or base64 data)
 * @returns {string} - The full image URL or base64 data string
 */
export const getImageUrl = (imagePath) => {
  // Mobile-specific: ako je local file URI (za preview), vrati kao je
  if (imagePath && imagePath.startsWith('file://')) {
    return imagePath;
  }
  
  // Za sve ostalo, koristi ENV helper funkciju
  return ENV.getImageUrl(imagePath);
};

/**
 * Upload image to production server (mobile-specific)
 * @param {string} imageUri - Local image URI from ImagePicker
 * @param {string} fileName - Optional filename
 * @returns {Promise<Object>} - Upload response with image path
 */
export const uploadImage = async (imageUri, fileName = null) => {
  try {
    console.log('📤 [MOBILE UPLOAD] Starting image upload');
    console.log('🎯 [MOBILE UPLOAD] Target server:', ENV.UPLOAD_SERVER_URL);
    
    const formData = new FormData();
    
    // Create file object for FormData
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const finalFileName = fileName || `mobile-upload-${Date.now()}.${fileExtension}`;
    
    formData.append('image', {
      uri: imageUri,
      type: `image/${fileExtension}`,
      name: finalFileName,
    });

    const response = await fetch(`${ENV.UPLOAD_SERVER_URL}/api/upload-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    console.log('📡 [MOBILE UPLOAD] Response:', result);
    
    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    return result;
  } catch (error) {
    console.error('❌ [MOBILE UPLOAD] Upload error:', error);
    throw error;
  }
};

/**
 * Get default images
 * @returns {Object} - Default image URLs
 */
export const getDefaultImages = () => {
  return ENV.getDefaultImages();
};

/**
 * Get the default image URL for lectures
 * @returns {string} - The default lecture image URL
 */
export const getDefaultLectureImage = () => {
  return ENV.getDefaultImages().lecture;
};

/**
 * Get the default image URL for daijas
 * @returns {string} - The default daija image URL
 */
export const getDefaultDaijaImage = () => {
  return ENV.getDefaultImages().daija;
};

/**
 * Get the default image URL for organizations
 * @returns {string} - The default organization image URL
 */
export const getDefaultOrganizationImage = () => {
  return ENV.getDefaultImages().organization;
};

/**
 * Get the logo URL
 * @returns {string} - The logo URL
 */
export const getLogoUrl = () => {
  // Return local asset path for offline capability
  return require('../assets/images/logo.jpg');
};

/**
 * Get logo fallback URL from server
 * @returns {string} - The server logo URL
 */
export const getLogoFallbackUrl = () => {
  return `${ENV.IMAGE_SERVER_URL}/uploads/images/logo.jpg`;
};

/**
 * Get the favicon URL
 * @returns {string} - The favicon URL
 */
export const getFaviconUrl = () => {
  return `${ENV.IMAGE_SERVER_URL}/uploads/images/favicon.png`;
};

export default {
  getImageUrl,
  uploadImage,
  getDefaultImages,
  getDefaultLectureImage,
  getDefaultDaijaImage,
  getDefaultOrganizationImage,
  getLogoUrl,
  getLogoFallbackUrl,
  getFaviconUrl,
  IMAGE_SERVER_URL: ENV.IMAGE_SERVER_URL,
  UPLOAD_SERVER_URL: ENV.UPLOAD_SERVER_URL
};