import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scripts/**",
      "**/prisma/generated/**",
    ],
  },
  // Frontend-specific configuration
  {
    files: ["apps/frontend/**/*.{ts,tsx,js,jsx}"],
    rules: {
      // Next.js App Router specific rules
      "@next/next/no-page-custom-font": "off", // App Router doesn't use pages directory
      "@next/next/no-html-link-for-pages": "off", // App Router uses different routing
      "@next/next/no-img-element": "warn", // Prefer next/image
      "@next/next/no-sync-scripts": "error", // Security rule
      "@next/next/no-title-in-document-head": "off", // App Router handles this differently
      
      // Disable pages directory warnings for App Router
      "@next/next/no-head-element": "off",
      "@next/next/no-script-component-in-head": "off",
    },
  },
  // Test files configuration - relaxed rules for testing environment
  {
    files: ["**/__tests__/**/*.{ts,tsx,js,jsx}", "**/*.test.{ts,tsx,js,jsx}"],
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
      // Relax TypeScript rules for tests
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      // Allow CommonJS imports/requires in tests if needed
      "@typescript-eslint/no-require-imports": "off",
      "import/no-commonjs": "off",
      // Allow internal module imports in tests
      "import/no-internal-modules": "off",
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
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/__tests__/**", "**/tests/**", "**/*.spec.*", "**/*.test.*"],
    rules: {
      // Unified baseline: warn for legacy code, error for new/modified
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      
      // General code quality rules
      "no-console": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      
      // Import boundaries - prevent deep internal module imports; prefer package entry points
      // Allow: @athlete-ally packages, Next.js aliases, dotenv, relative imports
      "import/no-internal-modules": ["warn", { 
        allow: ["./**", "../**", "@athlete-ally/**", "@/**", "dotenv/config", "@prisma/client", "../prisma/generated/client"] 
      }],

      // monorepo layer direction: apps -> services -> packages
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
  },  ,
  // Packages: enforce no-console=error
  {
    files: ["packages/**/*.{ts,tsx,js,jsx}"],
    rules: { "no-console": "error" }
  }
];

export default eslintConfig;

