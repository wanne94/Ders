// API Caching Layer for Web Application
const cacheMap = new Map();
const pendingRequests = new Map();

// Cache configuration
const CACHE_CONFIG = {
  default: 5 * 60 * 1000, // 5 minutes
  lectures: 3 * 60 * 1000, // 3 minutes for lectures
  daije: 10 * 60 * 1000, // 10 minutes for daije
  organizations: 10 * 60 * 1000, // 10 minutes for organizations
  static: 30 * 60 * 1000, // 30 minutes for static data
};

// Generate cache key from URL and params
const getCacheKey = (url, params = {}) => {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${url}${paramString ? '?' + paramString : ''}`;
};

// Get cached response if valid
export const getCachedResponse = (url, params, cacheType = 'default') => {
  const key = getCacheKey(url, params);
  const cached = cacheMap.get(key);

  if (cached) {
    const cacheMaxAge = CACHE_CONFIG[cacheType] || CACHE_CONFIG.default;
    const isValid = Date.now() - cached.timestamp < cacheMaxAge;

    if (isValid) {
      return cached.data;
    } else {
      // Clean up expired cache
      cacheMap.delete(key);
    }
  }

  return null;
};

// Set cache for response
export const setCachedResponse = (url, params, data, cacheType = 'default') => {
  const key = getCacheKey(url, params);
  cacheMap.set(key, {
    data,
    timestamp: Date.now(),
    cacheType
  });
};

// Prevent duplicate requests
export const getPendingRequest = (url, params) => {
  const key = getCacheKey(url, params);
  return pendingRequests.get(key);
};

export const setPendingRequest = (url, params, promise) => {
  const key = getCacheKey(url, params);
  pendingRequests.set(key, promise);
  
  // Clean up after request completes
  promise.finally(() => {
    pendingRequests.delete(key);
  });
};

// Clear specific cache
export const clearCache = (pattern) => {
  if (!pattern) {
    cacheMap.clear();
    return;
  }

  for (const [key] of cacheMap) {
    if (key.includes(pattern)) {
      cacheMap.delete(key);
    }
  }
};

// Clear all cache
export const clearAllCache = () => {
  cacheMap.clear();
};

// Get cache stats
export const getCacheStats = () => {
  const stats = {
    totalEntries: cacheMap.size,
    totalSize: 0,
    byType: {}
  };

  for (const [key, value] of cacheMap) {
    const size = JSON.stringify(value.data).length;
    stats.totalSize += size;
    
    const type = value.cacheType || 'default';
    if (!stats.byType[type]) {
      stats.byType[type] = { count: 0, size: 0 };
    }
    stats.byType[type].count++;
    stats.byType[type].size += size;
  }
  
  return stats;
};

// Auto cleanup expired cache every 5 minutes
setInterval(() => {
  for (const [key, value] of cacheMap) {
    const cacheMaxAge = CACHE_CONFIG[value.cacheType] || CACHE_CONFIG.default;
    if (Date.now() - value.timestamp > cacheMaxAge) {
      cacheMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

const apiCache = {
  getCachedResponse,
  setCachedResponse,
  getPendingRequest,
  setPendingRequest,
  clearCache,
  clearAllCache,
  getCacheStats
};

export default apiCache;