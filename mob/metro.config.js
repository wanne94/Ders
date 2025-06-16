const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure Metro only looks in the current project's node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules')
];

// Block parent node_modules
config.resolver.blockList = [
  /\/node_modules\/.*\/node_modules\//,
  new RegExp(path.resolve(__dirname, '..', 'node_modules').replace(/[\\]/g, '\\\\') + '.*')
];

// Optimizacije za smanjenje bundle veličine
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg');
config.resolver.blacklistRE = /(__tests__|\.test\.|\.spec\.|\.stories\.|node_modules[\/\\]react[\/\\]dist[\/\\].*)/;

// Dodaj polyfills za Node.js module koji nisu dostupni u React Native
config.resolver.alias = {
  crypto: 'crypto-browserify',
  stream: 'stream-browserify',
  http: 'stream-http',
  https: 'https-browserify',
  os: 'os-browserify/browser',
  url: 'url',
  zlib: 'browserify-zlib',
  path: 'path-browserify',
  vm: 'vm-browserify',
  fs: false,
  net: false,
  tls: false,
};

// Dodaj resolver konfiguraciju za Node.js module
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Dodaj globals za Node.js polyfills
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Ukloni source maps iz production build-a
if (process.env.NODE_ENV === 'production') {
  config.transformer.minifierConfig = {
    output: {
      comments: false,
    },
    sourceMap: false,
  };
}

module.exports = config; 