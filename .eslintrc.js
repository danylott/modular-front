module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'simple-import-sort',
  ],
  rules: {
    "simple-import-sort/sort": "warn",
    "no-underscore-dangle": "off",
    "sort-imports": "off",
    "import/order": "off",
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    "react/jsx-props-no-spreading": "off",
    "no-unused-expressions": "warn",
    "no-restricted-syntax": "off",
  },
};
