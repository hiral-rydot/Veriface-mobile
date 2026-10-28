/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    // This project's node_modules and src are symlinked from turnout_mobile-master.
    // Watchman does not follow symlinks, so disable it and use Node's crawler.
    useWatchman: false,
  },
};
