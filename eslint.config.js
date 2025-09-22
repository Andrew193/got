// eslint.config.js (CommonJS)
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

// ЯВНО импортируем плагины
const ngPlugin = require('@angular-eslint/eslint-plugin');
const ngTemplatePlugin = require('@angular-eslint/eslint-plugin-template');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      ...tseslint.configs.stylistic,
      // По желанию:
      // ...angular.configs.tsRecommended,
      // или для инлайн-шаблонов:
      // ...angular.configs.tsRecommendedWithTemplate,
    ],
    plugins: {
      // Регистрируем плагины под теми именами, которые используем в rules
      '@angular-eslint': ngPlugin,
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
    },
  },

  // ---- Angular HTML templates ----
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended, // включает parser @angular-eslint/template-parser
    ],
    plugins: {
      '@angular-eslint/template': ngTemplatePlugin,
    },
    rules: {
      // template-правила по желанию
    },
  }
);
