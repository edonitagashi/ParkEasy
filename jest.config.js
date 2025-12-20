module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/__tests__/**/*.test.js"],

  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },

  transformIgnorePatterns: [
    "node_modules/(?!(expo-modules-core|expo(nent)?|@expo(nent)?|expo-router|@react-native|react-native|react-native-reanimated|react-native-worklets|@react-navigation)/)",
  ],

  moduleNameMapper: {
    "^\\.\\./\\.\\./firebase/firebase$": "<rootDir>/__mocks__/firebaseClient.js"
  }
};
