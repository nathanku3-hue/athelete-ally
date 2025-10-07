/**
 * lint-staged configuration for Athlete Ally monorepo
 * 
 * Applies stricter boundary rules to new/modified files only.
 * Legacy files remain at warn level to avoid blocking on technical debt.
 */

module.exports = {
  // TypeScript/TSX files: apply strict boundaries to new/modified files
  '**/*.{ts,tsx}': [
    'eslint --fix --config eslint.config.unified.mjs',
    'git add'
  ],
  
  // JavaScript files: apply basic linting
  '**/*.{js,jsx}': [
    'eslint --fix --config eslint.config.unified.mjs',
    'git add'
  ],
  
  // Package.json files: ensure proper formatting
  '**/package.json': [
    'prettier --write',
    'git add'
  ],
  
  // YAML files: ensure proper formatting
  '**/*.{yml,yaml}': [
    'prettier --write',
    'git add'
  ]
};
