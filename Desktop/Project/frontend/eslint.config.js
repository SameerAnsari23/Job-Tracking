import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'storybook-static', 'coverage', 'node_modules'] },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },

  // ── Architecture boundary rules (Phase 16.5 §4.7) ──────────────────────────
  // Only src/app/env.ts may read import.meta.env — everything else consumes
  // the validated `env` object.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/app/env.ts', 'src/vite-env.d.ts', 'src/ui/internal/dev.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.type='MetaProperty'][property.name='env']",
          message: 'Read environment values from @/app/env, not import.meta.env directly.',
        },
      ],
    },
  },

  // ui/ purity: the component library imports no HTTP, server-state, store,
  // or router modules (Phase 16.4 dependency law). Directory does not exist
  // yet — the rule is in force from the first component.
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'axios', message: 'ui/ components must not perform HTTP.' },
            { name: 'zustand', message: 'ui/ components must not read stores.' },
            {
              name: 'react-router-dom',
              message: 'ui/ is router-agnostic — accept hrefs/adapters via props.',
            },
            { name: '@tanstack/react-query', message: 'ui/ components receive data via props.' },
          ],
          patterns: [
            {
              group: ['@/api/*', '@/features/*', '@/services/*'],
              message: 'ui/ must not import app layers.',
            },
          ],
        },
      ],
    },
  },

  // Features must not import sibling features (Phase 16.5 boundary law).
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*'],
              message:
                'Features must not import other features. Share via @/shared or @/ui. (Importing within the SAME feature must use relative paths.)',
            },
          ],
        },
      ],
    },
  },

  // Only storageService touches localStorage directly.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/services/storageService.ts',
      'src/shared/stores/**',
      // Tests may inspect storage directly (e.g. persistence assertions).
      'src/**/*.test.{ts,tsx}',
      'src/test/**',
    ],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: 'Use @/services/storageService.' },
      ],
    },
  },

  prettier,
);
