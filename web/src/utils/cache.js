/**
 * Cache management utilities
 */

class CacheManager {
  constructor(options = {}) {
    this.storage = options.storage || 'localStorage'; // 'localStorage', 'sessionStorage', 'memory'
    this.prefix = options.prefix || 'app_cache_';
    this.defaultTTL = options.defaultTTL || 3600000; // 1 hour in milliseconds
    this.maxSize = options.maxSize || 50; // Maximum number of cached items
    this.memoryCache = new Map();
  }

  /**
   * Generate cache key
   */
  generateKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Set item in cache
   */
  set(key, value, ttl = this.defaultTTL) {
    const cacheKey = this.generateKey(key);
    const data = {
      value,
      timestamp: Date.now(),
      ttl,
      expiresAt: Date.now() + ttl
    };

    try {
      if (this.storage === 'memory') {
        // Check size limit for memory cache
        if (this.memoryCache.size >= this.maxSize) {
          // Remove oldest item
          const firstKey = this.memoryCache.keys().next().value;
          this.memoryCache.delete(firstKey);
        }
        this.memoryCache.set(cacheKey, data);
      } else {
        const storageObj = this.storage === 'sessionStorage' ? sessionStorage : localStorage;
        
        // Check size limit
        if (this.getSize() >= this.maxSize) {
          this.removeOldest();
        }
        
        storageObj.setItem(cacheKey, JSON.stringify(data));
      }
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      // If quota exceeded, try to clear old items
      if (error.name === 'QuotaExceededError') {
        this.clearExpired();
        try {
          if (this.storage !== 'memory') {
            const storageObj = this.storage === 'sessionStorage' ? sessionStorage : localStorage;
            storageObj.setItem(cacheKey, JSON.stringify(data));
          }
          return true;
        } catch (retryError) {
          console.error('Cache retry failed:', retryError);
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Get item from cache
   */
  get(key) {
    const cacheKey = this.generateKey(key);
    
    try {
      let data;
      
      if (this.storage === 'memory') {
        data = this.memoryCache.get(cacheKey);
      } else {
        const storageObj = this.storage === 'sessionStorage' ? sessionStorage : localStorage;
        const stored = storageObj.getItem(cacheKey);
        if (!stored) return null;
        data = JSON.parse(stored);
      }
      
      if (!data) return null;
      
      // Check if expired
      if (Date.now() > data.expiresAt) {
        this.remove(key);
        return null;
      }
      
      return data.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Remove item from cache
   */
  remove(key) {
    const cacheKey = this.generateKey(key);
    
    try {
      if (this.storage === 'memory') {
        this.memoryCache.delete(cacheKey);
      } else {
        const storageObj = this.storage === 'sessionStorage' ? sessionStorage : localStorage;
        storageObj.removeItem(cacheKey);
      }
      return true;
    } catch (error) {
      console.error('Cache remove error:', error);
      return false;
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Clear all cache items with prefix
   */
  clear() {
    try {
      if (this.storage === 'memory') {
        this.memoryCache.clear();
      } else {
        const storageObj = this.storage === 'sessionStorage' ? sessionStorage : localStorage;
        const keys = Object.keys(storageObj);
        keys.forEach(key => {
          if (key.startsWith(this.prefix)) {
            storageObj.removeItem(key);
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Clear expired items
   */
  clearExpired() {
    try {
      if (this.storage === 'memory') {
        const now = Date.now();
        for (const [key, data] of this.memoryCache.entries()) {
          if (now > data.expiresAt) {
            this.memoryCache.delete(key);
          }
        }
      } else {
        const storageObj = this.storage === 'sessionStorage' ? sessionStorage : localStorage;
        const keys = Object.keys(storageObj);
        const now = Date.now();
        
        keys.forEach(key => {
          if (key.startsWith(this.prefix)) {
            try {
              const data = JSON.parse(storageObj.getItem(key));
              if (data && now > data.expiresAt) {
                storageObj.removeItem(key);
              }
            } catch (e) {
              // Invalid data, remove it
              storageObj.removeItem(key);
            }
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Clear expired error:', error);
      return false;
    }
  }

  /**
   * Get cache size
   */
  getSize() {
    if (this.storage === 'memory') {
      return this.memoryCache.size;
    } else {
      const storageObj = this.storage === 'sessionStorage' ? sessionStorage : localStorage;
      return Object.keys(storageObj).filter(key => key.startsWith(this.prefix)).length;
    }
  }

  /**
   * Remove oldest item
   */
  removeOldest() {
    try {
      if (this.storage === 'memory') {
        const firstKey = this.memoryCache.keys().next().value;
        if (firstKey) this.memoryCache.delete(firstKey);
      } else {
        const storageObj = this.storage === 'sessionStorage' ? sessionStorage : localStorage;
        const keys = Object.keys(storageObj).filter(key => key.startsWith(this.prefix));
        
        if (keys.length > 0) {
          let oldestKey = keys[0];
          let oldestTime = Infinity;
          
          keys.forEach(key => {
            try {
              const data = JSON.parse(storageObj.getItem(key));
              if (data && data.timestamp < oldestTime) {
                oldestTime = data.timestamp;
                oldestKey = key;
              }
            } catch (e) {
              // Invalid data, mark for removal
              oldestKey = key;
              oldestTime = 0;
            }
          });
          
          storageObj.removeItem(oldestKey);
        }
      }
    } catch (error) {
      console.error('Remove oldest error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const size = this.getSize();
    let totalBytes = 0;
    let expired = 0;
    const now = Date.now();
    
    if (this.storage !== 'memory') {
      const storageObj = this.storage === 'sessionStorage' ? sessionStorage : localStorage;
      const keys = Object.keys(storageObj).filter(key => key.startsWith(this.prefix));
      
      keys.forEach(key => {
        try {
          const item = storageObj.getItem(key);
          totalBytes += item.length * 2; // Approximate bytes (UTF-16)
          
          const data = JSON.parse(item);
          if (data && now > data.expiresAt) {
            expired++;
          }
        } catch (e) {
          // Ignore invalid items
        }
      });
    }
    
    return {
      size,
      totalBytes,
      expired,
      maxSize: this.maxSize,
      storage: this.storage
    };
  }
}

// Create singleton instances
export const localCache = new CacheManager({
  storage: 'localStorage',
  prefix: 'app_local_',
  defaultTTL: 3600000 // 1 hour
});

export const sessionCache = new CacheManager({
  storage: 'sessionStorage',
  prefix: 'app_session_',
  defaultTTL: 1800000 // 30 minutes
});

export const memoryCache = new CacheManager({
  storage: 'memory',
  prefix: 'app_memory_',
  defaultTTL: 600000 // 10 minutes
});

// API Response cache wrapper
export const cachedFetch = async (url, options = {}, cacheOptions = {}) => {
  const {
    cache = localCache,
    ttl = 300000, // 5 minutes default
    forceRefresh = false,
    cacheKey = null
  } = cacheOptions;
  
  const key = cacheKey || `fetch_${url}_${JSON.stringify(options)}`;
  
  // Check cache first
  if (!forceRefresh) {
    const cached = cache.get(key);
    if (cached) {
      console.log('Cache hit:', key);
      return cached;
    }
  }
  
  // Fetch from network
  console.log('Cache miss, fetching:', key);
  const response = await fetch(url, options);
  const data = await response.json();
  
  // Store in cache
  if (response.ok) {
    cache.set(key, data, ttl);
  }
  
  return data;
};

// React Hook for cache
export const useCache = (key, fetcher, options = {}) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  const {
    cache = localCache,
    ttl = 300000,
    dependencies = []
  } = options;
  
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check cache
        const cached = cache.get(key);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }
        
        // Fetch fresh data
        const freshData = await fetcher();
        cache.set(key, freshData, ttl);
        setData(freshData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [key, ...dependencies]);
  
  const refresh = async () => {
    cache.remove(key);
    const freshData = await fetcher();
    cache.set(key, freshData, ttl);
    setData(freshData);
  };
  
  return { data, loading, error, refresh };
};

export default CacheManager;