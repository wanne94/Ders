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
 * @param {Object} imageUri - Image URI from picker
 * @param {string} token - Auth token (optional)
 * @returns {Promise<Object>} - Upload response sa path-om slike
 */
export const uploadImage = async (imageUri, token = null) => {
  try {
    console.log('📤 [MOBILE UPLOAD] Starting image upload to production server');
    console.log('🎯 [MOBILE UPLOAD] Target server:', ENV.UPLOAD_SERVER_URL);
    console.log('📁 [MOBILE UPLOAD] Image URI:', imageUri);

    if (!imageUri) {
      throw new Error('No image URI provided');
    }

    // Create FormData for React Native
    const formData = new FormData();
    
    // For React Native, we need to format the file object properly
    const imageFile = {
      uri: imageUri,
      type: 'image/jpeg', // Default to jpeg, can be determined from URI
      name: `image_${Date.now()}.jpg`
    };

    formData.append('image', imageFile);

    // Prepare headers
    const headers = {
      'Content-Type': 'multipart/form-data',
    };

    // Add auth token if available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log('🔐 [MOBILE UPLOAD] Headers prepared:', Object.keys(headers));

    // Make request to production server
    const uploadUrl = `${ENV.UPLOAD_SERVER_URL}/api/upload-image`;
    console.log('🌐 [MOBILE UPLOAD] Upload URL:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: headers
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

/**
 * Fetch existing images from server
 * @returns {Promise<Array>} - Array of existing images
 */
export const fetchExistingImages = async () => {
  try {
    // Use axiosInstance for consistency
    console.log('📸 [MOBILE] Fetching existing images');
    
    const response = await axiosInstance.get('/existing-images');
    
    const data = response.data;
    console.log('✅ [MOBILE] Fetched', data.images?.length || 0, 'existing images');
    
    return data.images || [];
  } catch (error) {
    console.error('❌ [MOBILE] Error fetching existing images:', error);
    return [];
  }
};

export default {
  uploadImage,
  getImageUrl,
  getDefaultImages,
  fetchExistingImages,
  UPLOAD_SERVER_URL: ENV.UPLOAD_SERVER_URL,
  IMAGE_SERVER_URL: ENV.IMAGE_SERVER_URL
};