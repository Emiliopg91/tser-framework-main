module.exports = {
  extends: [
    'eslint:recommended',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    '@typescript-eslint/no-empty-function': [
      'error',
      {
        allow: ['private-constructors']
      }
    ],
    semi: 'error',
    'no-global-assign': 'off',
    'prefer-const': 'warn'
  }
};
