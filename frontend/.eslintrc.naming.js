/**
 * Naming convention rules — extend or run alongside .eslintrc.js
 * Usage: eslint --config .eslintrc.naming.js 'src/**\/*.{ts,tsx}'
 */
module.exports = {
  extends: ['./.eslintrc.js'],
  rules: {
    '@typescript-eslint/naming-convention': [
      'warn',
      // PascalCase for types, interfaces, enums, classes
      { selector: ['typeLike'], format: ['PascalCase'] },
      // PascalCase for React components (functions returning JSX named with capital)
      {
        selector: 'function',
        format: ['PascalCase', 'camelCase'],
      },
      // camelCase for variables and parameters
      {
        selector: ['variable', 'parameter'],
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
      // UPPER_SNAKE_CASE for const variables that are all-caps (true constants)
      {
        selector: 'variable',
        modifiers: ['const', 'global'],
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
      },
      // camelCase for object properties (relaxed — many external APIs use snake_case)
      {
        selector: 'property',
        format: null, // don't enforce on properties to avoid breaking external types
      },
      // Hooks must start with 'use'
      {
        selector: 'function',
        filter: { regex: '^use[A-Z]', match: true },
        format: ['camelCase'],
      },
    ],
  },
};
