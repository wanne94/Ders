/**
 * Image upload utility for mobile app
 * Converts from base64 approach to file upload approach to save database space
 */

import * as FileSystem from 'expo-file-system';
import { SERVER_URL } from '../config/api';

/**
 * Upload image file to server
 * @param {string} imageUri - Local image URI from ImagePicker
 * @param {string} fileName - Optional custom filename
 * @returns {Promise<string>} - Server image path
 */
export const uploadImageToServer = async (imageUri, fileName = null) => {
  try {
    if (!imageUri) {
      throw new Error('No image URI provided');
    }

    // Generate filename if not provided
    const timestamp = Date.now();
    const extension = imageUri.split('.').pop() || 'jpg';
    const finalFileName = fileName || `mobile-upload-${timestamp}.${extension}`;

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: `image/${extension}`,
      name: finalFileName,
    });

    console.log('📤 Uploading image to server:', {
      uri: imageUri,
      fileName: finalFileName,
      serverUrl: `${SERVER_URL}/api/upload`
    });

    // Upload to server
    const response = await fetch(`${SERVER_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await response.json();
    console.log('✅ Image uploaded successfully:', result);

    // Return the server path
    return result.path || result.imageUrl;
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
};

/**
 * Process and upload image from ImagePicker result
 * @param {Object} imagePickerAsset - Asset from ImagePicker
 * @returns {Promise<string>} - Server image path
 */
export const processAndUploadImage = async (imagePickerAsset) => {
  try {
    if (!imagePickerAsset || !imagePickerAsset.uri) {
      throw new Error('Invalid image asset');
    }

    // Check file size (5MB limit)
    if (imagePickerAsset.fileSize && imagePickerAsset.fileSize > 5 * 1024 * 1024) {
      throw new Error('Slika je prevelika. Maksimalna veličina je 5 MB.');
    }

    // Upload the image
    const serverPath = await uploadImageToServer(imagePickerAsset.uri);
    
    return serverPath;
  } catch (error) {
    console.error('❌ Error processing and uploading image:', error);
    throw error;
  }
};

/**
 * Check if image path is a base64 data URL
 * @param {string} imagePath 
 * @returns {boolean}
 */
export const isBase64Image = (imagePath) => {
  return imagePath && imagePath.startsWith('data:');
};

/**
 * Get display URI for image (handles both server paths and base64)
 * @param {string} imagePath - Server path or base64 data
 * @returns {string} - URI suitable for Image component
 */
export const getImageDisplayUri = (imagePath) => {
  console.log('🖼️ getImageDisplayUri called with:', imagePath);
  
  if (!imagePath) {
    console.log('🖼️ No image path provided, returning null');
    return null;
  }
  
  // If it's base64, return as is
  if (isBase64Image(imagePath)) {
    console.log('🖼️ Base64 image detected, returning as is');
    return imagePath;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('🖼️ Full URL detected, returning as is:', imagePath);
    return imagePath;
  }
  
  // If it starts with /, remove it to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Construct full URL with server
  const fullUrl = `${SERVER_URL}/${cleanPath}`;
  console.log('🖼️ Constructed full URL:', fullUrl);
  console.log('🖼️ SERVER_URL used:', SERVER_URL);
  
  return fullUrl;
};

export default {
  uploadImageToServer,
  processAndUploadImage,
  isBase64Image,
  getImageDisplayUri
}; 