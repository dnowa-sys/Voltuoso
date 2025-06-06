// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .cjs files
config.resolver.sourceExts.push('cjs');
// Add firebase and stripe to resolver
config.resolver.assetExts.push('db');

module.exports = config;