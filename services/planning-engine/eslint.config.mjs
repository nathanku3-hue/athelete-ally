/**
 * ESLint Configuration for Planning Engine Service
 * 
 * This configuration is more permissive for the planning-engine service
 * to handle legacy code with many 'any' types and unused variables.
 */

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

const eslintConfig = [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/__tests__/**", "**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        // Avoid type-aware linting to prevent CI parse errors on tsconfig
        tsconfigRootDir: new URL(".", import.meta.url)
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
      // TypeScript rules - more permissive for legacy code
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Import rules - allow internal modules for this service
      "import/no-internal-modules": "off",
      
      // General rules
      "no-console": "off",
      "no-unused-vars": "off", // Use TypeScript version instead
      "no-undef": "off", // TypeScript handles this
      "no-redeclare": "off", // TypeScript handles this
      "no-unreachable": "warn", // Allow unreachable code but warn
    }
  }
];

export default eslintConfig;
