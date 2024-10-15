module.exports = {
  root: true,
  extends: '@react-native',
  rules: {},
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: true,
    ecmaVersion: 2018,
    sourceType: 'module',
  },
};
