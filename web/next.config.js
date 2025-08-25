console.log("➡️ Loading next.config.js");

const path = require('path');
const envConfig = require('./config/environment');

console.log(`🌍 Next.js Environment: ${envConfig.NODE_ENV}`);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Completely disable static generation and optimization
  output: undefined, // Ensure no static export
  trailingSlash: false, // Disable trailing slash for static files
  generateEtags: false, // Disable ETags for static content
  generateBuildId: async () => {
    // Generate unique build ID on each build to force fresh content
    return `build-${Date.now()}`
  },
  distDir: '.next', // Standard build directory
  
  // Force all pages to be server-side rendered
  // Disable ALL static optimization
  poweredByHeader: false,
  compress: false, // Disable compression for dynamic content
  optimizeFonts: false, // Disable font optimization
  
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
  
  // Headers configuration to control caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
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
    
    // Disable code splitting and optimization for client bundles
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: false,
        splitChunks: {
          chunks: 'async', // Only split async chunks, not all
          cacheGroups: {
            default: false,
            vendors: false,
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
