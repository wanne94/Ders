const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Monorepo setup - allow access to root node_modules
const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '../..');

config.watchFolders = [workspaceRoot];

// Allow Metro to resolve modules from both mobile and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules')
];

// Block only nested duplicate node_modules (avoid double installations)
config.resolver.blockList = [
  /\/node_modules\/.*\/node_modules\//
];

// Optimizacije za smanjenje bundle veličine
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg');
config.resolver.blacklistRE = /(__tests__|\.test\.|\.spec\.|\.stories\.|node_modules[\/\\]react[\/\\]dist[\/\\].*|.*@react-native-firebase\/messaging.*)/;

// Zakomentiraj polyfills koji mogu biti problematični
// config.resolver.alias = {
//   crypto: 'crypto-browserify',
//   stream: 'stream-browserify',
//   http: 'stream-http',
//   https: 'https-browserify',
//   os: 'os-browserify/browser',
//   url: 'url',
//   zlib: 'browserify-zlib',
//   path: 'path-browserify',
//   vm: 'vm-browserify',
//   fs: false,
//   net: false,
//   tls: false,
// };

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

// Dodaj shimove za problematične module
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'es-abstract': path.resolve(__dirname, 'node_modules/es-abstract'),
};

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