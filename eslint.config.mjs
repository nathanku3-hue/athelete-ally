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
    ],
  },
  // Test files configuration - relaxed rules for testing environment
  {
    files: ["**/__tests__/**/*.ts", "**/__tests__/**/*.js", "**/*.test.ts", "**/*.test.js"],
    languageOptions: {
      globals: {
        // Jest globals
        jest: true,
        describe: true,
        it: true,
        expect: true,
        beforeAll: true,
        afterAll: true,
        beforeEach: true,
        afterEach: true,
        // Node.js globals commonly used in tests
        process: true,
        console: true,
        Buffer: true,
        setTimeout: true,
        setInterval: true,
        clearTimeout: true,
        clearInterval: true,
        fetch: true,
        global: true,
        // CommonJS globals (for compatibility)
        __dirname: true,
        __filename: true,
        module: true,
        require: true,
        exports: true
      }
    },
    rules: {
      // Relaxed rules for test files
      "@typescript-eslint/no-require-imports": "off",
      "import/no-commonjs": "off",
      "@typescript-eslint/no-explicit-any": "off", // Allow 'any' in tests for flexibility
      "@typescript-eslint/no-unused-vars": "off", // Allow unused vars in tests
      "import/no-internal-modules": "off", // Allow internal imports in tests
      
      // Prevent Vitest usage (enforce Jest)
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
  // Source code configuration - strict rules for production code
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/__tests__/**", "**/tests/**", "**/*.spec.*", "**/*.test.*"],
    rules: {
      // TypeScript best practices
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Import boundaries - prevent deep internal module imports
      // Allow: @athlete-ally packages, Next.js aliases, dotenv, relative imports
      "import/no-internal-modules": ["warn", { 
        allow: ["@athlete-ally/**", "@/**", "dotenv/config", "./**", "../**"] 
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
  },
];

export default eslintConfig;
