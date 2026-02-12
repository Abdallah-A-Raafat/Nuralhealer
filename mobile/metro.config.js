const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'cjs'],
    // Prioritize react-native field in package.json to use browser builds
    resolverMainFields: ['react-native', 'browser', 'module', 'main'],
    resolveRequest: (context, moduleName, platform) => {
      // Force axios to use browser build for React Native
      if (moduleName === 'axios') {
        return {
          filePath: path.resolve(__dirname, 'node_modules/axios/dist/browser/axios.cjs'),
          type: 'sourceFile',
        };
      }
      // Use default resolution
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
