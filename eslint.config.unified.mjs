/**
 * Unified ESLint Configuration - Single Source of Truth
 * 
 * This configuration eliminates config drift between local and CI environments
 * by providing targeted overrides for different workspace types.
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
// DRY: share Next.js allowlist with scripts and docs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { ALLOWED_NEXT_PATTERNS } = require('./scripts/eslint-config-constants.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base configuration for all files
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "**/next-env.d.ts",
      "**/prisma/generated/**",
      "coverage/**",
      "test-results/**",
      "tmp/**",
      "patches/**",
      ".codex/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/test-results/**",
      "**/tmp/**",
      "**/patches/**",
      "**/.codex/**",
    ],
  },

  // Monorepo layer direction enforcement (applied to all files)
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["**/__tests__/**", "**/tests/**", "**/*.spec.*", "**/*.test.*"],
    rules: {
      // Layer direction: apps -> services -> packages
      "no-restricted-imports": ["warn", {
        patterns: [
          { 
            group: ["packages/*/src/**"], 
            message: "Import from package entrypoint (no deep src/*)." 
          },
          { 
            group: ["apps/*/src/**"], 
            message: "Do not import app internals across workspaces." 
          },
          {
            group: ["services/**"],
            message: "Apps should not directly import from services. Use shared packages or API calls instead."
          },
          {
            group: ["apps/**"],
            message: "Services should not import from apps. This violates architectural boundaries."
          }
        ]
      }]
    }
  },

  // Next.js Frontend App Configuration
  {
    files: ["apps/frontend/**/*.{ts,tsx,js,jsx}"],
    rules: {
      // Next.js specific rules
      "@next/next/no-page-custom-font": "off",
      "@next/next/no-html-link-for-pages": "off", 
      "@next/next/no-img-element": "warn",
      "@next/next/no-sync-scripts": "error",
      "@next/next/no-title-in-document-head": "off",
      "@next/next/no-head-element": "off",
      "@next/next/no-script-component-in-head": "off",
      
      // Import boundaries - allow Next.js patterns
      // Allowed patterns: relative imports, monorepo packages, Next.js aliases, Next.js built-ins
      "import/no-internal-modules": ["warn", { 
        allow: [
          "./**",           // Relative imports within app
          "../**",          // Parent directory imports
          "@athlete-ally/**", // Internal monorepo packages
          "@/**",           // Next.js path aliases
          "dotenv/config",  // Environment configuration
          ...ALLOWED_NEXT_PATTERNS  // Use curated Next.js patterns
        ] 
      }],

      // Logging policy - allow console.warn/error in client
      "no-console": ["warn", { 
        allow: ["warn", "error"] 
      }],

      // TypeScript rules - let TS handle unused detection
      "@typescript-eslint/no-unused-vars": "off", // Handled by TS noUnusedLocals
      "@typescript-eslint/no-explicit-any": "warn",
      
      // React rules
      "react/no-unescaped-entities": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // General code quality
      "prefer-const": "warn",
      "no-var": "error",
    },
  },

  // Node.js Services Configuration
  {
    files: ["services/**/*.{ts,js}"],
    rules: {
      // Import boundaries - services can import packages
      "import/no-internal-modules": ["warn", { 
        allow: [
          "./**", 
          "../**", 
          "@athlete-ally/**", 
          "dotenv/config",
          "prisma/**",
          ...ALLOWED_NEXT_PATTERNS  // Use curated Next.js patterns
        ] 
      }],

      // Logging policy - allow console in services
      "no-console": "off",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "off", // Handled by TS
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Node.js specific
      "@typescript-eslint/no-require-imports": "off",
      "import/no-commonjs": "off",
    },
  },

  // Packages Configuration
  {
    files: ["packages/**/*.{ts,js}"],
    rules: {
      // Import boundaries - packages should be self-contained
      "import/no-internal-modules": ["warn", {
        allow: [
          "./**",           // Relative imports within package
          "../**",          // Parent directory imports
          "@athlete-ally/**", // Internal monorepo packages
          "dotenv/config",  // Environment configuration
          ...ALLOWED_NEXT_PATTERNS  // Use curated Next.js patterns
        ]
      }],

      // Logging policy - minimal logging in packages
      "no-console": ["error", {
        allow: ["warn", "error"]
      }],

      // TypeScript rules - strict for packages
      "@typescript-eslint/no-unused-vars": "off", // Handled by TS
      "@typescript-eslint/no-explicit-any": "error",

      // Package specific
      "import/no-anonymous-default-export": "error",
    },
  },

  // Scripts Configuration
  {
    files: ["scripts/**/*.{ts,js}"],
    rules: {
      // Relaxed rules for scripts
      "import/no-internal-modules": "off",
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "import/no-commonjs": "off",
    },
  },

  // CommonJS files (.cjs) - allow require() imports
  // Must come before test files to apply to test .cjs files too
  {
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "import/no-commonjs": "off",
    },
  },

  // Test files configuration
  {
    files: ["**/__tests__/**/*.{ts,tsx,js,jsx}", "**/*.test.{ts,tsx,js,jsx}", "**/*.spec.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: {
        jest: true,
        node: true,
        describe: true,
        it: true,
        expect: true,
        beforeAll: true,
        afterAll: true,
        beforeEach: true,
        afterEach: true,
        process: true,
        console: true,
        Buffer: true,
        setTimeout: true,
        setInterval: true,
        clearTimeout: true,
        clearInterval: true,
        fetch: true,
        global: true,
        __dirname: true,
        __filename: true,
        module: true,
        require: true,
        exports: true
      }
    },
    rules: {
      // Relaxed rules for tests
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
      "import/no-commonjs": "off",
      "import/no-internal-modules": "off",
      "no-console": "off",
      
      // Prevent use of Vitest APIs in a Jest project
      "no-restricted-imports": [
        "error",
        {
          "paths": [
            {
              "name": "vitest",
              "message": "Use Jest APIs instead of Vitest. Import from '@jest/globals' if needed."
            }
          ]
        }
      ],
    },
  },
];

export default eslintConfig;
