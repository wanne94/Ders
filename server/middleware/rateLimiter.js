const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Try to connect to Redis
let redisClient = null;
try {
  redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  });
  
  redisClient.on('error', (err) => {
    console.log('Redis connection error for rate limiting:', err);
    redisClient = null;
  });
} catch (error) {
  console.log('Redis not available for rate limiting, using memory store');
}

// General API rate limiter
const apiLimiter = rateLimit({
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }) : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Previše zahtjeva sa ove IP adrese, pokušajte ponovo kasnije.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Previše zahtjeva',
      message: 'Premašili ste limit zahtjeva. Pokušajte ponovo za nekoliko minuta.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }) : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: 'Previše pokušaja prijave, pokušajte ponovo za 15 minuta.',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Previše pokušaja',
      message: 'Premašili ste limit pokušaja prijave. Pokušajte ponovo za 15 minuta.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Create account limiter
const createAccountLimiter = rateLimit({
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:signup:'
  }) : undefined,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 account creation requests per hour
  skipSuccessfulRequests: false,
  message: 'Previše registracija sa ove IP adrese.'
});

// Password reset limiter
const passwordResetLimiter = rateLimit({
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:reset:'
  }) : undefined,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  skipSuccessfulRequests: false,
  message: 'Previše zahtjeva za resetovanje lozinke.'
});

// File upload limiter
const uploadLimiter = rateLimit({
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:upload:'
  }) : undefined,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: 'Premašili ste limit upload-a. Pokušajte ponovo kasnije.'
});

// Export data limiter
const exportLimiter = rateLimit({
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:export:'
  }) : undefined,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 exports per hour
  message: 'Previše export zahtjeva. Pokušajte ponovo kasnije.'
});

// Dynamic rate limiter based on user role
const dynamicRateLimiter = (options = {}) => {
  return (req, res, next) => {
    let maxRequests = 100; // Default
    
    // Adjust based on user role
    if (req.user) {
      switch (req.user.role) {
        case 'super_admin':
          maxRequests = 1000;
          break;
        case 'admin':
          maxRequests = 500;
          break;
        case 'moderator':
          maxRequests = 200;
          break;
        case 'user':
          maxRequests = 100;
          break;
        default:
          maxRequests = 50;
      }
    } else {
      maxRequests = 50; // Non-authenticated users
    }
    
    const limiter = rateLimit({
      store: redisClient ? new RedisStore({
        client: redisClient,
        prefix: `rl:dynamic:${req.user?.id || req.ip}:`
      }) : undefined,
      windowMs: options.windowMs || 15 * 60 * 1000,
      max: maxRequests,
      ...options
    });
    
    limiter(req, res, next);
  };
};

// Slow down middleware for progressive delays
const speedLimiter = require('express-slow-down');

const speedLimiterMiddleware = speedLimiter({
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'sl:api:'
  }) : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per windowMs without delay
  delayMs: 100, // Add 100ms delay per request after delayAfter
  maxDelayMs: 2000, // Maximum delay of 2 seconds
  skipSuccessfulRequests: false,
  skipFailedRequests: true
});

// Custom rate limiter for specific IP addresses or users
class CustomRateLimiter {
  constructor() {
    this.blacklist = new Set();
    this.whitelist = new Set();
    this.customLimits = new Map();
  }
  
  addToBlacklist(identifier) {
    this.blacklist.add(identifier);
  }
  
  removeFromBlacklist(identifier) {
    this.blacklist.delete(identifier);
  }
  
  addToWhitelist(identifier) {
    this.whitelist.add(identifier);
  }
  
  removeFromWhitelist(identifier) {
    this.whitelist.delete(identifier);
  }
  
  setCustomLimit(identifier, limit) {
    this.customLimits.set(identifier, limit);
  }
  
  middleware() {
    return (req, res, next) => {
      const identifier = req.user?.id || req.ip;
      
      // Check blacklist
      if (this.blacklist.has(identifier)) {
        return res.status(403).json({
          error: 'Zabranjeno',
          message: 'Vaš pristup je blokiran.'
        });
      }
      
      // Skip rate limiting for whitelisted
      if (this.whitelist.has(identifier)) {
        return next();
      }
      
      // Apply custom limits if set
      if (this.customLimits.has(identifier)) {
        const customLimit = this.customLimits.get(identifier);
        const limiter = rateLimit({
          windowMs: 15 * 60 * 1000,
          max: customLimit
        });
        return limiter(req, res, next);
      }
      
      next();
    };
  }
}

const customRateLimiter = new CustomRateLimiter();

module.exports = {
  apiLimiter,
  authLimiter,
  createAccountLimiter,
  passwordResetLimiter,
  uploadLimiter,
  exportLimiter,
  dynamicRateLimiter,
  speedLimiterMiddleware,
  customRateLimiter
};