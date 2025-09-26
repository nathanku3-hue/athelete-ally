/**
 * Strict ESLint Configuration for New/Modified Files
 * 
 * This configuration applies error-level boundary rules to new/modified files.
 * Used by lint-staged and CI boundaries check.
 */

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

const eslintConfig = [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.base.json"
      }
    },
    plugins: {
      "@typescript-eslint": typescript,
      import: (await import("eslint-plugin-import")).default,
      boundaries: (await import("eslint-plugin-boundaries")).default
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      
      // STRICT Boundaries (error level for new/modified files)
      // Prevent deep internal module imports; prefer package entry points
      "import/no-internal-modules": ["error", { 
        allow: ["@athlete-ally/**", "@/**", "dotenv/config"] 
      }],

      // monorepo layer direction: apps -> services -> packages
      "no-restricted-imports": ["error", {
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
  }
];

export default eslintConfig;
