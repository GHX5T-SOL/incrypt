const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Ensure React Native is properly resolved
config.resolver.extraNodeModules = {
  'react-native': require.resolve('react-native'),
};

// Enable require context for dynamic imports
config.transformer.unstable_allowRequireContext = true;

// Add resolver for native modules
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config; 