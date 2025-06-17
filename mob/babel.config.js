module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Zakomentiraj dotenv plugin jer može biti problematičan
      // ['module:react-native-dotenv', {
      //   moduleName: '@env',
      //   path: process.env.EXPO_ENV === 'production'
      //     ? './config/env.production.js'
      //     : './config/env.development.js',
      //   safe: true,
      //   allowUndefined: false
      // }]
    ]
  };
}; 