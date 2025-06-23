const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add pusher-js resolution for React Native
config.resolver.alias = {
  ...config.resolver.alias,
  'pusher-js/react-native': 'pusher-js',
};

module.exports = config;
