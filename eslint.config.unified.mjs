import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import boundaries from 'eslint-plugin-boundaries';

// Import DRY constants for Next.js patterns
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { ALLOWED_NEXT_PATTERNS } = require('./scripts/eslint-config-constants.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**', '**/.next/**',
      'out/**', '**/out/**',
      'build/**', '**/build/**',
      'dist/**', '**/dist/**',
      'coverage/**', '**/coverage/**',
      'next-env.d.ts', '**/next-env.d.ts',
      '**/prisma/generated/**',
    ],
  },
  // Frontend-specific (App Router)
  {
    files: ['apps/frontend/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@next/next/no-page-custom-font': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-sync-scripts': 'error',
      '@next/next/no-title-in-document-head': 'off',
      '@next/next/no-head-element': 'off',
      '@next/next/no-script-component-in-head': 'off',
    },
  },
  // Test files configuration - relaxed rules for testing environment
  {
    files: ['**/__tests__/**/*.{ts,tsx,js,jsx}', '**/*.test.{ts,tsx,js,jsx}', '**/tests/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        jest: true, node: true, describe: true, it: true, expect: true,
        beforeAll: true, afterAll: true, beforeEach: true, afterEach: true,
        process: true, console: true, Buffer: true,
        setTimeout: true, setInterval: true, clearTimeout: true, clearInterval: true,
        fetch: true, global: true, __dirname: true, __filename: true, module: true, require: true, exports: true,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'import/no-commonjs': 'off',
      'import/no-internal-modules': 'off',
      'no-restricted-imports': ['error', { paths: [ { name: 'vitest', message: "Use Jest APIs instead of Vitest. Import from '@jest/globals' if needed." } ] }],
    },
  },
  // Default TS rules (non-test files)
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/__tests__/**', '**/tests/**', '**/*.spec.*', '**/*.test.*'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'import/no-internal-modules': ['warn', {
        allow: ['./**', '../**', '@athlete-ally/**', '@/**', 'dotenv/config', '@prisma/client', '../prisma/generated/client', ...ALLOWED_NEXT_PATTERNS],
      }],
      'no-restricted-imports': ['warn', {
        patterns: [
          { group: ['packages/*/src/**'], message: 'Import from package entrypoint (no deep src/*).' },
          { group: ['apps/*/src/**'], message: 'Do not import app internals across workspaces.' },
          { group: ['services/**'], message: 'Apps should not directly import from services. Use shared packages or API calls instead.' },
          { group: ['apps/**'], message: 'Services should not import from apps. This violates architectural boundaries.' },
        ],
      }],
    },
  },
  // Packages: enforce no-console=error
  {
    files: ['packages/**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/__tests__/**', '**/tests/**', '**/*.spec.*', '**/*.test.*'],
    rules: { 'no-console': 'error' },
  },
  // Services: allow console for server-side logging
  {
    files: ['services/**/*.{ts,tsx,js,jsx}'],
    rules: { 'no-console': 'off' },
  },
  // Scripts: relaxed rules for build/CI scripts
  {
    files: ['scripts/**/*.{ts,js,mjs,cjs}'],
    rules: {
      'no-console': 'off',
      'import/no-internal-modules': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'import/no-commonjs': 'off',
    },
  },
  // Boundaries pilot (warn) for selected packages
  {
    files: [
      'packages/shared-types/**/*.{ts,tsx,js,jsx}',
      'packages/shared/**/*.{ts,tsx,js,jsx}',
      'packages/event-bus/**/*.{ts,tsx,js,jsx}',
    ],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'packages', pattern: 'packages/*' },
        { type: 'apps', pattern: 'apps/*' },
        { type: 'services', pattern: 'services/*' },
      ],
      'boundaries/ignore': ['**/__tests__/**', '**/*.test.*'],
    },
    rules: {
      'boundaries/entry-point': 'warn',
      'boundaries/no-unknown': 'warn',
    },
  },
];

export default eslintConfig;