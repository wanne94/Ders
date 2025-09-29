/**
 * Shared image helper utilities for web and mobile applications
 * Extends the constants/images.js with additional helper functions
 */

import { 
  getImageUrl as getImageUrlBase,
  getDefaultImageByType,
  IMAGE_CONFIG 
} from '../constants/images';

/**
 * Check if image exists (not a default image)
 * @param {string} imagePath - Image path to check
 * @param {string} type - Type of default image to compare against
 * @returns {boolean} True if image exists and is not default
 */
export const hasCustomImage = (imagePath, type) => {
  if (!imagePath) return false;
  
  const defaultImage = getDefaultImageByType(type);
  const fullImageUrl = getImageUrlBase(imagePath);
  
  return fullImageUrl && fullImageUrl !== defaultImage;
};

/**
 * Get image URL with fallback to default
 * @param {string} imagePath - Image path
 * @param {string} defaultType - Type of default image to use as fallback
 * @param {boolean} preferOptimized - Whether to prefer optimized version
 * @returns {string} Image URL or default image URL
 */
export const getImageWithFallback = (imagePath, defaultType = 'default', preferOptimized = false) => {
  if (!imagePath || imagePath === 'null' || imagePath === 'undefined') {
    return getDefaultImageByType(defaultType);
  }
  
  const imageUrl = getImageUrlBase(imagePath, preferOptimized);
  return imageUrl || getDefaultImageByType(defaultType);
};

/**
 * Extract filename from image path
 * @param {string} imagePath - Full image path or URL
 * @returns {string} Filename only
 */
export const getImageFilename = (imagePath) => {
  if (!imagePath) return '';
  
  // Remove query parameters
  const pathWithoutQuery = imagePath.split('?')[0];
  
  // Get last segment after slash
  const segments = pathWithoutQuery.split('/');
  return segments[segments.length - 1] || '';
};

/**
 * Check if image is from external source
 * @param {string} imagePath - Image path or URL
 * @returns {boolean} True if image is from external source
 */
export const isExternalImage = (imagePath) => {
  if (!imagePath) return false;
  
  const lowerPath = imagePath.toLowerCase();
  
  // Check for common external sources
  const externalDomains = [
    'youtube.com',
    'ytimg.com',
    'googleusercontent.com',
    'facebook.com',
    'fbcdn.net',
    'cloudinary.com',
    'amazonaws.com'
  ];
  
  return externalDomains.some(domain => lowerPath.includes(domain));
};

/**
 * Get YouTube thumbnail from video URL
 * @param {string} videoUrl - YouTube video URL
 * @param {string} quality - Thumbnail quality (default, hq, mq, sd, maxres)
 * @returns {string} Thumbnail URL or empty string
 */
export const getYouTubeThumbnail = (videoUrl, quality = 'hq') => {
  if (!videoUrl || !videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
    return '';
  }
  
  let videoId = '';
  
  // Extract video ID from different YouTube URL formats
  if (videoUrl.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(videoUrl.split('?')[1]);
    videoId = urlParams.get('v');
  } else if (videoUrl.includes('youtu.be/')) {
    videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
  } else if (videoUrl.includes('youtube.com/embed/')) {
    videoId = videoUrl.split('youtube.com/embed/')[1].split('?')[0];
  }
  
  if (!videoId) return '';
  
  const qualityMap = {
    default: 'default',
    mq: 'mqdefault',
    hq: 'hqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault'
  };
  
  const selectedQuality = qualityMap[quality] || 'hqdefault';
  return `https://img.youtube.com/vi/${videoId}/${selectedQuality}.jpg`;
};

/**
 * Build image srcset for responsive images
 * @param {string} imagePath - Base image path
 * @param {number[]} widths - Array of widths to generate
 * @returns {string} srcset string for img tag
 */
export const buildImageSrcSet = (imagePath, widths = [320, 640, 960, 1280]) => {
  if (!imagePath) return '';
  
  const baseUrl = getImageUrlBase(imagePath);
  if (!baseUrl) return '';
  
  // For now, just return the base URL for all sizes
  // In future, this could integrate with an image resizing service
  return widths.map(width => `${baseUrl} ${width}w`).join(', ');
};

/**
 * Get image alt text from filename
 * @param {string} imagePath - Image path or filename
 * @param {string} fallback - Fallback alt text
 * @returns {string} Alt text for image
 */
export const getImageAltText = (imagePath, fallback = 'Slika') => {
  if (!imagePath) return fallback;
  
  const filename = getImageFilename(imagePath);
  if (!filename) return fallback;
  
  // Remove file extension and replace special characters
  const altText = filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .trim();
  
  return altText || fallback;
};

/**
 * Validate image file type
 * @param {string} filename - Image filename
 * @returns {boolean} True if valid image file
 */
export const isValidImageFile = (filename) => {
  if (!filename) return false;
  
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowerFilename = filename.toLowerCase();
  
  return validExtensions.some(ext => lowerFilename.endsWith(ext));
};

// Export all functions
export default {
  hasCustomImage,
  getImageWithFallback,
  getImageFilename,
  isExternalImage,
  getYouTubeThumbnail,
  buildImageSrcSet,
  getImageAltText,
  isValidImageFile
};