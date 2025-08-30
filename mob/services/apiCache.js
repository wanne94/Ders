// API Caching Layer for Mobile Application
import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryCache = new Map();
const pendingRequests = new Map();

// Cache configuration
const CACHE_CONFIG = {
  default: 5 * 60 * 1000, // 5 minutes
  lectures: 3 * 60 * 1000, // 3 minutes for lectures
  daije: 10 * 60 * 1000, // 10 minutes for daije
  organizations: 10 * 60 * 1000, // 10 minutes for organizations
  static: 30 * 60 * 1000, // 30 minutes for static data
};

// Storage keys prefix
const CACHE_PREFIX = '@apiCache:';

// Generate cache key from URL and params
const getCacheKey = (url, params = {}) => {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${url}${paramString ? '?' + paramString : ''}`;
};

// Get cached response from memory first, then storage
export const getCachedResponse = async (url, params, cacheType = 'default') => {
  const key = getCacheKey(url, params);
  
  // Check memory cache first
  const memoryCached = memoryCache.get(key);
  if (memoryCached) {
    const cacheMaxAge = CACHE_CONFIG[cacheType] || CACHE_CONFIG.default;
    const isValid = Date.now() - memoryCached.timestamp < cacheMaxAge;
    
    if (isValid) {
      return memoryCached.data;
    } else {
      memoryCache.delete(key);
    }
  }
  
  // Check AsyncStorage for persistent cache
  try {
    const storageKey = CACHE_PREFIX + key;
    const storedData = await AsyncStorage.getItem(storageKey);
    
    if (storedData) {
      const cached = JSON.parse(storedData);
      const cacheMaxAge = CACHE_CONFIG[cacheType] || CACHE_CONFIG.default;
      const isValid = Date.now() - cached.timestamp < cacheMaxAge;
      
      if (isValid) {
        // Update memory cache
        memoryCache.set(key, cached);
        return cached.data;
      } else {
        // Clean up expired cache
        await AsyncStorage.removeItem(storageKey);
      }
    }
  } catch (error) {
    console.error('Error reading from cache:', error);
  }
  
  return null;
};

// Set cache in both memory and storage
export const setCachedResponse = async (url, params, data, cacheType = 'default') => {
  const key = getCacheKey(url, params);
  const cacheData = {
    data,
    timestamp: Date.now(),
    cacheType
  };
  
  // Set in memory cache
  memoryCache.set(key, cacheData);
  
  // Set in AsyncStorage for persistence
  try {
    const storageKey = CACHE_PREFIX + key;
    await AsyncStorage.setItem(storageKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
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
export const clearCache = async (pattern) => {
  // Clear memory cache
  if (!pattern) {
    memoryCache.clear();
  } else {
    for (const [key] of memoryCache) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
      }
    }
  }
  
  // Clear AsyncStorage cache
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => {
      if (!key.startsWith(CACHE_PREFIX)) return false;
      if (!pattern) return true;
      return key.includes(pattern);
    });
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Clear all cache
export const clearAllCache = async () => {
  memoryCache.clear();
  
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_PREFIX));
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

// Get cache stats
export const getCacheStats = async () => {
  const stats = {
    memoryEntries: memoryCache.size,
    storageEntries: 0,
    totalSize: 0,
    byType: {}
  };
  
  // Memory cache stats
  for (const [key, value] of memoryCache) {
    const size = JSON.stringify(value.data).length;
    stats.totalSize += size;
    
    const type = value.cacheType || 'default';
    if (!stats.byType[type]) {
      stats.byType[type] = { count: 0, size: 0 };
    }
    stats.byType[type].count++;
    stats.byType[type].size += size;
  }
  
  // Storage cache stats
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_PREFIX));
    stats.storageEntries = cacheKeys.length;
  } catch (error) {
    console.error('Error getting cache stats:', error);
  }
  
  return stats;
};

// Auto cleanup expired memory cache every 5 minutes
setInterval(() => {
  for (const [key, value] of memoryCache) {
    const cacheMaxAge = CACHE_CONFIG[value.cacheType] || CACHE_CONFIG.default;
    if (Date.now() - value.timestamp > cacheMaxAge) {
      memoryCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export default {
  getCachedResponse,
  setCachedResponse,
  getPendingRequest,
  setPendingRequest,
  clearCache,
  clearAllCache,
  getCacheStats
};