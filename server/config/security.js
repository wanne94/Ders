// Security Headers Configuration
const getSecurityHeaders = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: isDevelopment ? [
          "'self'",
          "http://localhost:*",
          "ws://localhost:*",
          "http://127.0.0.1:*"
        ] : [
          "'self'",
          "https://ders.ba",
          "https://www.ders.ba",
          "https://api.ders.ba",
          "wss://ders.ba",
          "wss://www.ders.ba"
        ],
        scriptSrc: isDevelopment ? [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'"
        ] : [
          "'self'",
          "'strict-dynamic'",
          "'nonce-{NONCE}'" // Implement nonce generation for inline scripts
        ],
        styleSrc: isDevelopment ? [
          "'self'",
          "'unsafe-inline'"
        ] : [
          "'self'",
          "'nonce-{NONCE}'" // Implement nonce generation for inline styles
        ],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "blob:"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"]
      },
      reportOnly: false
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
  };
};

// Rate Limiting Configuration
const rateLimitConfig = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: process.env.NODE_ENV === 'production'
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit auth attempts to 5 per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
    trustProxy: process.env.NODE_ENV === 'production'
  },
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'development' ? 200 : 60, // Higher limit for development
    message: 'API rate limit exceeded, please slow down.',
    trustProxy: process.env.NODE_ENV === 'production'
  }
};

module.exports = {
  getSecurityHeaders,
  rateLimitConfig
};