/**
 * Jest Projects Orchestrator
 * 
 * This configuration runs all layered Jest configs in parallel.
 * Replaces the legacy root jest.config.js for unified testing.
 * 
 * Usage:
 * - npm test (runs all projects)
 * - npm run test:frontend (frontend only)
 * - npm run test:services (services only)
 * - npm run test:integration (integration only)
 */

module.exports = {
  projects: [
    '<rootDir>/jest/jest.config.frontend.cjs',
    '<rootDir>/jest/jest.config.services.cjs',
    '<rootDir>/jest/jest.config.integration.cjs'
  ]
};