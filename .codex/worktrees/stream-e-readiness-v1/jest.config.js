/**
 * Jest Orchestrator Configuration for Athlete Ally monorepo
 * 
 * This configuration orchestrates all layered Jest projects.
 * 
 * Usage:
 * - npm test (runs all projects via orchestrator)
 * - npm run test:frontend (frontend only)
 * - npm run test:services (services only)
 * - npm run test:integration (integration only)
 * 
 * See docs/Testing-Architecture.md for details.
 */

module.exports = require('./jest/jest.projects.cjs');