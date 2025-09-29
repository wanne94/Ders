/**
 * Image optimization utilities
 */

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const THUMBNAIL_WIDTH = 300;
const THUMBNAIL_HEIGHT = 300;
const QUALITY = 0.85;

/**
 * Compress and resize image
 */
export const optimizeImage = async (file, options = {}) => {
  const {
    maxWidth = MAX_WIDTH,
    maxHeight = MAX_HEIGHT,
    quality = QUALITY,
    format = 'webp'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions
        let { width, height } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                width,
                height,
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio: ((1 - blob.size / file.size) * 100).toFixed(2)
              });
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          `image/${format}`,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Generate thumbnail
 */
export const generateThumbnail = async (file, options = {}) => {
  const {
    width = THUMBNAIL_WIDTH,
    height = THUMBNAIL_HEIGHT,
    quality = 0.7,
    format = 'webp'
  } = options;

  return optimizeImage(file, {
    maxWidth: width,
    maxHeight: height,
    quality,
    format
  });
};

/**
 * Calculate dimensions maintaining aspect ratio
 */
const calculateDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }
  
  const aspectRatio = originalWidth / originalHeight;
  
  let width = maxWidth;
  let height = maxWidth / aspectRatio;
  
  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * aspectRatio;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
};

/**
 * Convert blob to base64
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Lazy load images with intersection observer
 */
export const lazyLoadImages = (selector = 'img[data-src]') => {
  const images = document.querySelectorAll(selector);
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      img.src = img.dataset.src;
      img.classList.add('loaded');
    });
  }
};

/**
 * Progressive image loading
 */
export class ProgressiveImage {
  constructor(lowQualitySrc, highQualitySrc) {
    this.lowQualitySrc = lowQualitySrc;
    this.highQualitySrc = highQualitySrc;
  }
  
  load(imgElement) {
    // Load low quality image first
    const lowQualityImg = new Image();
    lowQualityImg.src = this.lowQualitySrc;
    
    lowQualityImg.onload = () => {
      imgElement.src = this.lowQualitySrc;
      imgElement.classList.add('loading');
      
      // Load high quality image
      const highQualityImg = new Image();
      highQualityImg.src = this.highQualitySrc;
      
      highQualityImg.onload = () => {
        imgElement.src = this.highQualitySrc;
        imgElement.classList.remove('loading');
        imgElement.classList.add('loaded');
      };
    };
  }
}

/**
 * Check if image format is supported
 */
export const isFormatSupported = (format) => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const dataURL = canvas.toDataURL(`image/${format}`);
  return dataURL.indexOf(`image/${format}`) === 0;
};

/**
 * Get optimal image format
 */
export const getOptimalFormat = () => {
  if (isFormatSupported('webp')) return 'webp';
  if (isFormatSupported('jpeg')) return 'jpeg';
  return 'png';
};

/**
 * Preload images
 */
export const preloadImages = (urls) => {
  return Promise.all(
    urls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error(`Failed to load ${url}`));
        img.src = url;
      });
    })
  );
};

/**
 * Image upload with optimization
 */
export const uploadOptimizedImage = async (file, uploadFunction, options = {}) => {
  try {
    // Optimize image
    const optimized = await optimizeImage(file, options);
    
    // Create form data
    const formData = new FormData();
    formData.append('image', optimized.blob, file.name);
    formData.append('compressionRatio', optimized.compressionRatio);
    formData.append('dimensions', `${optimized.width}x${optimized.height}`);
    
    // Upload
    const result = await uploadFunction(formData);
    
    return {
      ...result,
      optimization: {
        originalSize: optimized.originalSize,
        compressedSize: optimized.compressedSize,
        compressionRatio: optimized.compressionRatio,
        dimensions: `${optimized.width}x${optimized.height}`
      }
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};