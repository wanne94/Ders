console.log("➡️ Loading next.config.js");

const path = require('path');
const envConfig = require('./config/environment');

console.log(`🌍 Next.js Environment: ${envConfig.NODE_ENV}`);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Explicitly disable static generation
  output: undefined, // Ensure no static export
  trailingSlash: false, // Disable trailing slash for static files
  generateEtags: false, // Disable ETags for static content
  distDir: '.next', // Standard build directory
  
  // Force all pages to be server-side rendered
  // No static optimization
  poweredByHeader: false,
  
  // Images configuration - allow loading from server in both environments
  // Disable image caching completely
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5003',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'ders.ba',
        pathname: '/uploads/**',
      },
    ],
    // Disable image optimization and caching
    unoptimized: true,
    // Set minimum cache TTL to 0 (no cache)
    minimumCacheTTL: 0,
  },
  
  // Increase static generation timeout
  staticPageGenerationTimeout: 120,
  
  // Environment variables that will be available in the browser
  env: {
    NEXT_PUBLIC_API_URL: envConfig.API_URL,
    NEXT_PUBLIC_SERVER_URL: envConfig.SERVER_URL,
    NEXT_PUBLIC_APP_URL: envConfig.APP_URL,
    NEXT_PUBLIC_DEBUG: envConfig.DEBUG.toString(),
    NEXT_PUBLIC_LOG_LEVEL: envConfig.LOG_LEVEL,
    NEXT_PUBLIC_ENABLE_DEV_TOOLS: envConfig.ENABLE_DEV_TOOLS.toString(),
    NEXT_PUBLIC_ENABLE_MOCK_DATA: envConfig.ENABLE_MOCK_DATA.toString(),
    NEXT_PUBLIC_CACHE_MAX_AGE: envConfig.CACHE_MAX_AGE.toString(),
    NEXT_PUBLIC_ENABLE_ANALYTICS: envConfig.ENABLE_ANALYTICS.toString(),
  },

  // Only use webpackDevMiddleware in development
  ...(process.env.NODE_ENV === 'development' && {
    webpackDevMiddleware: config => {
      config.watchOptions = {
        poll: 1000, // provjerava svakih 1s
        aggregateTimeout: 300,
        ignored: ['**/.next/**', '**/node_modules/**'],
      };
      return config;
    },
  }),

  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  }
};

module.exports = nextConfig;
