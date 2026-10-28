module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-gesture-handler|react-native-svg|react-native-reanimated|react-native-worklets)/)',
  ],
    moduleNameMapper: {
      '^react-native-gesture-handler$': '<rootDir>/__mocks__/gesture-handler.tsx',
      '^react-native-reanimated$': '<rootDir>/__mocks__/react-native-reanimated.ts',
      '^react-native-vector-icons/Ionicons$': '<rootDir>/__mocks__/ionicons.tsx',
    },
};
