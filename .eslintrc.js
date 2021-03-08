module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:unicorn/recommended',
    'plugin:react/recommended',
  ],
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
  plugins: ['unicorn', 'react', 'react-hooks'],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'prefer-const': 'off',
    'react/prop-types': 0,
    'react/no-deprecated': 0,
    'react/display-name': 0,
    'react/no-find-dom-node': 1,
    'react/no-unescaped-entities': 'warn',
    'react/no-string-refs': 'warn',
    'react/jsx-no-target-blank': 'warn',
    'react/no-children-prop': 0,
    // suppress errors for missing 'import React' in files
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    'unicorn/filename-case': 'off',
    'unicorn/expiring-todo-comments': 'warn',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/consistent-function-scoping': 'off',
    'unicorn/no-nested-ternary': 'off',

    camelcase: 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-extra-semi': 'off',
  },
}
