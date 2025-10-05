/**
 * ESLint Configuration Constants
 * 
 * DRY constants for ESLint configuration to avoid duplication
 * between config files, documentation, and verification scripts.
 */

// Allowed Next.js patterns for import/no-internal-modules rule
const ALLOWED_NEXT_PATTERNS = [
  'next/*',                    // All Next.js built-in modules
  'next/font/google',          // Google fonts
  'next/font/local',           // Local fonts
  'next/navigation',           // Navigation hooks
  'next/server',               // Server components
  'next/image',                // Optimized image component
  'next/link',                 // Link component
  'next/headers',              // Headers API
  'next/cache',                // Cache API
  'next/og',                   // Open Graph image generation
  'next/intl'                  // Internationalization
];

// Expected rule severities by file type
const EXPECTED_RULE_SEVERITIES = {
  'frontend': {
    'import/no-internal-modules': 'warn',
    'no-console': 'warn'
  },
  'package': {
    'import/no-internal-modules': 'warn', // Will flip to error later
    'no-console': 'error'
  },
  'service': {
    'import/no-internal-modules': 'warn',
    'no-console': 'off'
  }
};

module.exports = {
  ALLOWED_NEXT_PATTERNS,
  EXPECTED_RULE_SEVERITIES
};
