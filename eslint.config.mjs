// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals", "next/typescript"), {
  ignores: [
    "node_modules/**",
    ".next/**",
    "**/.next/**",
    "out/**",
    "**/out/**",
    "build/**",
    "**/build/**",
    "next-env.d.ts",
    "scripts/**",
    "**/prisma/generated/**",
  ],
}, // Global overrides for Next.js rules that assume "pages" directory
{
  rules: {
    "@next/next/no-html-link-for-pages": "off",
  },
}, // Frontend-specific configuration
{
  files: ["apps/frontend/**/*.{ts,tsx,js,jsx}"],
  rules: {
    // Next.js App Router specific rules
    "@next/next/no-page-custom-font": "off",
    "@next/next/no-html-link-for-pages": "off",
    "@next/next/no-img-element": "warn",
    "@next/next/no-sync-scripts": "error",
    "@next/next/no-title-in-document-head": "off",
    // Disable pages directory warnings for App Router
    "@next/next/no-head-element": "off",
    "@next/next/no-script-component-in-head": "off",
    // Allow Next.js internal module imports
    "import/no-internal-modules": ["warn", {
      allow: [
        "./**", 
        "../**", 
        "@athlete-ally/**", 
        "@/**",
        "next/font/google",
        "next/font/local",
        "next/navigation",
        "next/server",
        "next/image",
        "next/link",
        "next/headers",
        "next/cache",
        "next/og"
      ]
    }],
  },
},
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
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-require-imports": "off",
    "import/no-commonjs": "off",
    "import/no-internal-modules": "off",
    "no-restricted-imports": [
      "error",
      { "paths": [ { "name": "vitest", "message": "Use Jest APIs instead of Vitest. Import from '@jest/globals' if needed." } ] }
    ],
  },
}, {
  files: ["**/*.{ts,tsx}"],
  ignores: ["**/__tests__/**", "**/tests/**", "**/*.spec.*", "**/*.test.*", "apps/frontend/**"],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "warn",
    "prefer-const": "warn",
    "no-var": "error",
    "import/no-internal-modules": ["warn", {
      allow: ["./**", "../**", "@athlete-ally/**", "@/**", "dotenv/config", "@prisma/client", "../prisma/generated/client", "next/server", "next/image"]
    }],
    "no-restricted-imports": ["warn", {
      patterns: [
        { group: ["packages/*/src/**"], message: "Import from package entrypoint (no deep src/*)." },
        { group: ["apps/*/src/**"], message: "Do not import app internals across workspaces." },
        { group: ["services/**"], message: "Apps should not directly import from services. Use shared packages or API calls instead." },
        { group: ["apps/**"], message: "Services should not import from apps. This violates architectural boundaries." }
      ]
    }]
  }
}, // Packages: enforce no-console=error
{
  files: ["packages/**/*.{ts,tsx,js,jsx}"],
  rules: { "no-console": "error" }
}, // Boundaries pilot (warn) for selected packages
// Boundaries pilot (warn) for selected packages
{
  files: [
    "packages/shared-types/**/*.{ts,tsx,js,jsx}",
    "packages/shared/**/*.{ts,tsx,js,jsx}",
    "packages/event-bus/**/*.{ts,tsx,js,jsx}"
  ],
  plugins: { boundaries },
  settings: {
    "boundaries/elements": [
      { type: "packages", pattern: "packages/*" },
      { type: "apps", pattern: "apps/*" },
      { type: "services", pattern: "services/*" }
    ],
    "boundaries/ignore": ["**/__tests__/**", "**/*.test.*"]
  },
  rules: {
    "boundaries/entry-point": "warn",
    "boundaries/no-unknown": "warn"
  }
}, {
  files: [
    "packages/shared-types/**/*.{ts,tsx,js,jsx}",
    "packages/shared/**/*.{ts,tsx,js,jsx}",
    "packages/event-bus/**/*.{ts,tsx,js,jsx}"
  ],
  plugins: { boundaries },
  settings: {
    "boundaries/elements": [
      { type: "packages", pattern: "packages/*" },
      { type: "apps", pattern: "apps/*" },
      { type: "services", pattern: "services/*" }
    ],
    "boundaries/ignore": ["**/__tests__/**", "**/*.test.*"]
  },
  rules: {
    "boundaries/entry-point": "warn",
    "boundaries/no-unknown": "warn"
  }
}, ...storybook.configs["flat/recommended"]];

export default eslintConfig;
