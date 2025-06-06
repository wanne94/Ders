const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable hot reload and fast refresh
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Asset extensions for proper resolution
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'
];

// Source extensions
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'js', 'jsx', 'ts', 'tsx', 'json'
];

// Optimize for development
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enable symlinks for monorepo
config.resolver.unstable_enableSymlinks = true;

// Watch for changes in the entire project
config.watchFolders = [__dirname];

// Exclude problematic directories from watching
config.watchFolders = [__dirname];
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/react-native\/.*/,
  /web\/.*/,
  /server\/.*/,
  /deployment\/.*/,
];

module.exports = config; 