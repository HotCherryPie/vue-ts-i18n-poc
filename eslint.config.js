import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';

console.log(1);

/** @type {import('eslint').Linter.Config} */
export default [
  /* LANG: JS */
  {
    name: 'lang/js',
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },

  /* LANG: TS */
  {
    name: 'lang/ts',
    files: ['**/*.{ts,mts,cts}'],
    languageOptions: {
      parser: ts.parser,
      sourceType: 'module',
      parserOptions: {
        // https://typescript-eslint.io/packages/parser/#projectservice
        projectService: true,
      },
    },
    plugins: {
      '@typescript-eslint': ts.plugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...ts.configs.strictTypeChecked.find(
        (it) => it.name === 'typescript-eslint/eslint-recommended',
      ).rules,
      ...ts.configs.strictTypeChecked.find(
        (it) => it.name === 'typescript-eslint/strict-type-checked',
      ).rules,
    },
  },

  /* ENV: Node */
  {
    name: 'env/node',
    files: ['eslint.config.js', 'vite.config.ts'],
    languageOptions: { globals: globals.node },
  },

  // TODO: consider using worker env
  /* ENV: Browser */
  {
    name: 'env/browser',
    files: ['lib/**/*.*'],
    languageOptions: { globals: globals.browser },
  },
];
