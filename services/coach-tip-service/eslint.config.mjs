/**
 * ESLint Configuration for Coach Tip Service
 *
 * Stricter configuration for newer codebase with minimal legacy code.
 */

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

const eslintConfig = [
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "**/test/**",
      "**/__tests__/**",
      "**/*.test.ts",
      "**/*.test.js",
      "**/*.spec.ts",
      "**/*.spec.js",
      "src/test/**", // Exclude entire test directory
      "dist/**",
      "node_modules/**"
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json"
      },
      globals: {
        // Node.js globals
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        setImmediate: "readonly",
        TextDecoder: "readonly",
        TextEncoder: "readonly",
        NodeJS: "readonly",
        // Other globals
        global: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": typescript,
      import: (await import("eslint-plugin-import")).default,
    },
    rules: {
      // TypeScript rules - enforce type safety
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn", // Warn on 'any' usage

      // Import rules
      "import/no-internal-modules": "off",

      // General rules
      "no-console": ["warn", {
        "allow": ["warn", "error", "info"] // Allow intentional console usage in services
      }],
      "no-unused-vars": "off", // Use TypeScript version instead
      "no-undef": "off", // TypeScript handles this
      "no-redeclare": "off", // TypeScript handles this
      "no-unreachable": "error", // Strict - no unreachable code
    }
  },
  // Test files - more permissive
  {
    files: ["**/__tests__/**/*.{ts,tsx}", "**/*.test.{ts,tsx}", "**/test/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off"
    }
  }
];

export default eslintConfig;
