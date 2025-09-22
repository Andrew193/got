const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

const ngPlugin = require('@angular-eslint/eslint-plugin');
const ngTemplatePlugin = require('@angular-eslint/eslint-plugin-template');
const unusedImports = require('eslint-plugin-unused-imports');
const importPlugin = require('eslint-plugin-import');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.stylistic],
    plugins: {
      '@angular-eslint': ngPlugin,
      'unused-imports': unusedImports,
      import: importPlugin,
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      'unused-imports/no-unused-imports': 'error',

      //Lines
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: '*', next: ['function', 'class'] },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
      'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 1 }],
      'import/newline-after-import': 'error',
    },
  },
  // ---- Angular HTML templates ----
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
    plugins: {
      '@angular-eslint/template': ngTemplatePlugin,
    },
    rules: {},
  },
  {
    ignores: ['node_modules', 'dist', 'coverage', '.angular', '.idea', '.vscode', 'db.json'],
  },
);
