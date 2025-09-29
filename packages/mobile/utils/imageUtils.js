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
 * @param {Object} imageAsset - Image asset object from ImagePicker
 * @param {string} fileName - Optional filename
 * @returns {Promise<Object>} - Upload response with image path
 */
export const uploadImage = async (imageAsset, fileName = null) => {
  try {
    console.log('📤 [MOBILE UPLOAD] Starting image upload');
    console.log('🎯 [MOBILE UPLOAD] Target server:', ENV.UPLOAD_SERVER_URL);
    console.log('📁 [MOBILE UPLOAD] Image asset received:', {
      hasUri: !!imageAsset?.uri,
      uri: imageAsset?.uri?.substring(0, 100) + '...',
      mimeType: imageAsset?.mimeType,
      type: imageAsset?.type,
      fileName: imageAsset?.fileName,
      fileSize: imageAsset?.fileSize,
      fileSizeMB: imageAsset?.fileSize ? (imageAsset.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'unknown',
      width: imageAsset?.width,
      height: imageAsset?.height
    });

    if (!imageAsset || !imageAsset.uri) {
      console.error('❌ [MOBILE UPLOAD] Invalid image asset:', imageAsset);
      throw new Error('Greška pri obradi slike - nema URI');
    }

    const formData = new FormData();

    // Get file extension from URI or mimeType
    const uriParts = imageAsset.uri.split('.');
    const fileExtension = uriParts[uriParts.length - 1]?.toLowerCase() || 'jpg';

    // IMPORTANT: React Native expects exact MIME type format
    let mimeType = imageAsset.mimeType || imageAsset.type;
    if (!mimeType) {
      // Map common extensions to proper MIME types
      const mimeMap = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'heic': 'image/heic',
        'heif': 'image/heif'
      };
      mimeType = mimeMap[fileExtension] || 'image/jpeg';
    }

    const finalFileName = fileName || imageAsset.fileName || `mobile-upload-${Date.now()}.${fileExtension}`;

    console.log('📝 [MOBILE UPLOAD] Preparing FormData:', {
      uri: imageAsset.uri,
      type: mimeType,
      name: finalFileName
    });

    // CRITICAL: React Native FormData format
    // The object MUST have these exact properties
    formData.append('image', {
      uri: imageAsset.uri,
      type: mimeType,
      name: finalFileName,
    });

    console.log('🌐 [MOBILE UPLOAD] Sending request to:', `${ENV.UPLOAD_SERVER_URL}/api/upload-image`);

    // DO NOT set any headers - let React Native handle everything
    const response = await fetch(`${ENV.UPLOAD_SERVER_URL}/api/upload-image`, {
      method: 'POST',
      body: formData
    });

    console.log('📡 [MOBILE UPLOAD] Response status:', response.status);
    console.log('📡 [MOBILE UPLOAD] Response headers:', response.headers);

    const responseText = await response.text();
    console.log('📡 [MOBILE UPLOAD] Response text:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ [MOBILE UPLOAD] Failed to parse response:', parseError);
      throw new Error(`Server response nije JSON: ${responseText}`);
    }

    console.log('📡 [MOBILE UPLOAD] Parsed response:', result);

    if (!response.ok) {
      console.error('❌ [MOBILE UPLOAD] Server error response:', {
        status: response.status,
        result: result,
        message: result.message,
        error: result.error
      });
      throw new Error(result.message || result.error || `Upload failed with status ${response.status}`);
    }

    if (!result.success || !result.path) {
      console.error('❌ [MOBILE UPLOAD] Invalid response format:', result);
      throw new Error('Server response missing success flag or path');
    }

    return result;
  } catch (error) {
    console.error('❌ [MOBILE UPLOAD] Upload error:', error);
    // Re-throw with original message
    if (error.message === 'Greška pri obradi slike - nema URI') {
      throw error;
    }
    // For other errors, wrap them
    throw new Error(`Greška pri obradi slike: ${error.message}`);
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