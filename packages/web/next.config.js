const path = require('path');
const envConfig = require('./config/environment');

if (process.env.NODE_ENV !== 'production') {
  console.log('➡️ Loading next.config.js');
  console.log(`🌍 Next.js Environment: ${envConfig.NODE_ENV}`);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  
  // Images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5003',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5004',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'ders.ba',
        pathname: '/uploads/**',
      },
    ],
    unoptimized: false,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: envConfig.API_URL,
    NEXT_PUBLIC_SERVER_URL: envConfig.SERVER_URL,
    NEXT_PUBLIC_IMAGE_SERVER_URL: envConfig.IMAGE_SERVER_URL,
    NEXT_PUBLIC_APP_URL: envConfig.APP_URL,
    NEXT_PUBLIC_DEBUG: envConfig.DEBUG.toString(),
    NEXT_PUBLIC_LOG_LEVEL: envConfig.LOG_LEVEL,
    NEXT_PUBLIC_ENABLE_DEV_TOOLS: envConfig.ENABLE_DEV_TOOLS.toString(),
    NEXT_PUBLIC_ENABLE_MOCK_DATA: envConfig.ENABLE_MOCK_DATA.toString(),
    NEXT_PUBLIC_CACHE_MAX_AGE: envConfig.CACHE_MAX_AGE.toString(),
    NEXT_PUBLIC_ENABLE_ANALYTICS: envConfig.ENABLE_ANALYTICS.toString(),
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/pages': path.resolve(__dirname, 'pages'),
    };
    return config;
  }
};

module.exports = nextConfig;
