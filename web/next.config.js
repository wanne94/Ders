/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },

  // Exclude other directories from build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Ignore non-web files
  webpack: (config, { isServer }) => {
    // Add path alias for @ to src
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Exclude non-web directories
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/server/**',
        '**/scripts/**',
        '**/cypress/**',
        '**/.git/**',
        '**/.expo/**',
        '**/public/**',
        '**/*.md',
        '**/package.json',
        '**/package-lock.json',
        '**/.gitignore',
        '**/app.json',
        '**/shared-colors.js',
        '**/combined.log',
        '**/error.log'
      ]
    };

    // Exclude non-web files from module resolution
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: [
        /node_modules/,
        /server/,
        /scripts/,
        /cypress/
      ]
    });

    return config;
  },

  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ders.ba',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5003',
        pathname: '/uploads/**',
      },
    ],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://ders.ba',
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'https://ders.ba',
  },

  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  poweredByHeader: false,
};

module.exports = nextConfig;
