/**
 * Upload Service - uvek koristi produkcijski server za upload slika
 *
 * Ovo osigurava da se slike upload-uju direktno na https://ders.ba server
 * čak i kada je web aplikacija u development modu
 */

import { secureGetToken } from './tokenManager';

// Uvek koristi produkcijski server za upload
const UPLOAD_SERVER_URL = 'https://ders.ba';

/**
 * Upload sliku na produkcijski server
 * @param {File} file - Fajl za upload
 * @param {string} token - Auth token (opciono)
 * @returns {Promise<Object>} - Upload response sa path-om slike
 */
export const uploadImage = async (file, token = null) => {
  try {
    console.log('📤 [UPLOAD SERVICE] Starting image upload to production server');
    console.log('🎯 [UPLOAD SERVICE] Target server:', UPLOAD_SERVER_URL);
    console.log('📁 [UPLOAD SERVICE] File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Slika je prevelika. Maksimalna veličina je 5MB.');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Nepodržan format slike. Koristite JPG, PNG, GIF ili WebP.');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('image', file);

    // Prepare headers - DO NOT set Content-Type for FormData (browser will set it automatically with boundary)
    const headers = {};

    // Add auth token if available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (typeof window !== 'undefined') {
      const storedToken = secureGetToken();
      if (storedToken) {
        headers.Authorization = `Bearer ${storedToken}`;
      }
    }

    console.log('🔐 [UPLOAD SERVICE] Headers prepared:', Object.keys(headers));

    // Make request to production server
    const uploadUrl = `${UPLOAD_SERVER_URL}/api/upload-image`;
    console.log('🌐 [UPLOAD SERVICE] Upload URL:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: headers
    });

    console.log('📡 [UPLOAD SERVICE] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [UPLOAD SERVICE] Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [UPLOAD SERVICE] Upload successful:', result);

    if (!result.success || !result.path) {
      throw new Error('Upload response missing success flag or path');
    }

    return result;
  } catch (error) {
    console.error('❌ [UPLOAD SERVICE] Upload error:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Upload sliku koristeći axios (fallback metoda)
 */
export const uploadImageWithAxios = async (file, token = null) => {
  const axios = (await import('axios')).default;
  
  try {
    console.log('📤 [UPLOAD SERVICE - AXIOS] Starting upload');
    
    const formData = new FormData();
    formData.append('image', file);

    const headers = {
      'Content-Type': 'multipart/form-data'
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (typeof window !== 'undefined') {
      const storedToken = secureGetToken();
      if (storedToken) {
        headers.Authorization = `Bearer ${storedToken}`;
      }
    }

    const response = await axios.post(`${UPLOAD_SERVER_URL}/api/upload-image`, formData, {
      headers: headers,
      timeout: 30000
    });

    console.log('✅ [UPLOAD SERVICE - AXIOS] Upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [UPLOAD SERVICE - AXIOS] Upload error:', error);
    throw error;
  }
};

const uploadService = {
  uploadImage,
  uploadImageWithAxios,
  UPLOAD_SERVER_URL
};

export default uploadService;