// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add Reanimated plugin
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-reanimated/plugin'),
};

// Allow .cjs extensions for Reanimated
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
};

module.exports = config;