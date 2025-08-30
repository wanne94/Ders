console.log("➡️ Loading next.config.js");

const path = require('path');
const envConfig = require('./config/environment');

console.log(`🌍 Next.js Environment: ${envConfig.NODE_ENV}`);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable optimizations for better performance
  swcMinify: true, // Use SWC for faster minification
  compress: true, // Enable gzip compression
  optimizeFonts: true, // Enable font optimization
  poweredByHeader: false, // Security: hide X-Powered-By header
  
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production
  
  generateBuildId: async () => {
    // Use consistent build ID for better caching
    return process.env.BUILD_ID || `build-${Date.now()}`
  },
  distDir: '.next', // Standard build directory
  
  // Images configuration with optimization
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
    // Enable image optimization
    unoptimized: false,
    // Cache images for 1 hour
    minimumCacheTTL: 3600,
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Increase static generation timeout
  staticPageGenerationTimeout: 120,
  
  // Headers configuration with smart caching
  async headers() {
    return [
      {
        // Static assets should be cached
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes should not be cached
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        // Default caching for other pages
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=59',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  
  // Environment variables that will be available in the browser
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

  webpack: (config, { dev, isServer }) => {
    // Add watch options for development
    if (dev) {
      config.watchOptions = {
        poll: 1000, // provjerava svakih 1s
        aggregateTimeout: 300,
        ignored: ['**/.next/**', '**/node_modules/**'],
      };
    }
    
    // Enable smart code splitting for better performance
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/pages': path.resolve(__dirname, 'pages'),
    };
    return config;
  }
};

module.exports = nextConfig;
