// CORS Configuration with Security Best Practices
const corsConfig = {
  development: {
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://192.168.0.20:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
  },
  production: {
    origin: [
      'https://ders.ba',
      'https://www.ders.ba',
      'http://ders.ba', // Remove in production when HTTPS is enforced
      'http://www.ders.ba', // Remove in production when HTTPS is enforced
      'http://localhost:3001', // Development access to production uploads
      'http://127.0.0.1:3001' // Development access to production uploads
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
  }
};

// CORS Options Generator
const getCorsOptions = () => {
  const environment = process.env.NODE_ENV || 'development';
  const config = corsConfig[environment] || corsConfig.development;
  
  return {
    ...config,
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, server-side)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is allowed
      const allowedOrigins = Array.isArray(config.origin) ? config.origin : [config.origin];
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    }
  };
};

module.exports = getCorsOptions;