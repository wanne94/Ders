/**
 * Simple Image Utilities for consistent image handling
 * 
 * This file now acts as a bridge to the shared image utilities
 * while maintaining backward compatibility with existing code
 * 
 * NOTE: Base64 support is maintained for backward compatibility with:
 * - Existing database records that may still contain base64 images
 * - Any legacy data that hasn't been migrated yet
 */

import { 
  IMAGE_CONFIG,
  getImageUrl as getImageUrlShared,
  getImageFallbackUrl as getImageFallbackUrlShared,
  getDefaultLectureImage as getDefaultLectureImageShared,
  getDefaultDaijaImage as getDefaultDaijaImageShared,
  getDefaultOrganizationImage as getDefaultOrganizationImageShared,
  getLogoUrl as getLogoUrlShared,
  getFaviconUrl as getFaviconUrlShared
} from '@ders-ba/shared';

// Re-export from shared for backward compatibility
export const IMAGE_SERVER_URL = IMAGE_CONFIG.IMAGE_SERVER_URL;

// Use shared functions directly
export const getImageUrl = getImageUrlShared;
export const getImageFallbackUrl = getImageFallbackUrlShared;
export const getDefaultLectureImage = getDefaultLectureImageShared;
export const getDefaultDaijaImage = getDefaultDaijaImageShared;
export const getDefaultOrganizationImage = getDefaultOrganizationImageShared;
export const getLogoUrl = getLogoUrlShared;
export const getFaviconUrl = getFaviconUrlShared;

// Export as default for backward compatibility
const imageUtils = {
  getImageUrl,
  getDefaultLectureImage,
  getDefaultDaijaImage,
  getDefaultOrganizationImage,
  getLogoUrl,
  getFaviconUrl
};

export default imageUtils;