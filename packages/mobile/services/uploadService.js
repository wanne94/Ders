/**
 * Upload Service for Mobile App - isto kao web aplikacija
 * 
 * Koristi hibridni pristup:
 * - API pozivi: lokalni server (development) 
 * - Upload slika: uvek produkcijski server (https://ders.ba)
 * - Prikaz slika: uvek produkcijski server (https://ders.ba)
 */

import { ENV } from '../config';
import axiosInstance from '../utils/axiosConfig';

/**
 * Upload sliku na produkcijski server
 * @param {Object} imageAsset - Image asset from ImagePicker
 * @param {string} token - Auth token (optional)
 * @returns {Promise<Object>} - Upload response sa path-om slike
 */
export const uploadImage = async (imageAsset, token = null) => {
  try {
    console.log('📤 [MOBILE UPLOAD] Starting image upload to production server');
    console.log('🎯 [MOBILE UPLOAD] Target server:', ENV.UPLOAD_SERVER_URL);
    console.log('📁 [MOBILE UPLOAD] Image asset:', imageAsset);

    if (!imageAsset || !imageAsset.uri) {
      throw new Error('No image asset or URI provided');
    }

    // Create FormData for React Native
    const formData = new FormData();
    
    // Get file extension from URI or default to jpg
    const uriParts = imageAsset.uri.split('.');
    const fileExtension = uriParts[uriParts.length - 1];
    const mimeType = imageAsset.mimeType || `image/${fileExtension}` || 'image/jpeg';
    
    // For React Native, we need to format the file object properly
    const imageFile = {
      uri: imageAsset.uri,
      type: mimeType,
      name: imageAsset.fileName || `image_${Date.now()}.${fileExtension || 'jpg'}`
    };

    formData.append('image', imageFile);

    // Prepare headers - DO NOT set Content-Type for multipart/form-data
    const headers = {};

    // Add auth token if available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log('🔐 [MOBILE UPLOAD] Headers prepared:', Object.keys(headers));

    // Make request to production server
    const uploadUrl = `${ENV.UPLOAD_SERVER_URL}/api/upload-image`;
    console.log('🌐 [MOBILE UPLOAD] Upload URL:', uploadUrl);

    // IMPORTANT: Let React Native handle multipart boundary
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: headers.Authorization ? headers : undefined
    });

    console.log('📡 [MOBILE UPLOAD] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [MOBILE UPLOAD] Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [MOBILE UPLOAD] Upload successful:', result);

    if (!result.success || !result.path) {
      throw new Error('Upload response missing success flag or path');
    }

    return result;
  } catch (error) {
    console.error('❌ [MOBILE UPLOAD] Upload error:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Get image URL - uvek koristi produkcijski server
 * @param {string} imagePath - Path to image
 * @returns {string} - Full image URL
 */
export const getImageUrl = (imagePath) => {
  return ENV.getImageUrl(imagePath);
};

/**
 * Get default images
 * @returns {Object} - Default image URLs
 */
export const getDefaultImages = () => {
  return ENV.getDefaultImages();
};


export default {
  uploadImage,
  getImageUrl,
  getDefaultImages,
  UPLOAD_SERVER_URL: ENV.UPLOAD_SERVER_URL,
  IMAGE_SERVER_URL: ENV.IMAGE_SERVER_URL
};