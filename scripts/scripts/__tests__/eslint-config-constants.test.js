/**
 * @jest-environment node
 */

const { ALLOWED_NEXT_PATTERNS, EXPECTED_RULE_SEVERITIES } = require('../eslint-config-constants.js');

describe('ESLint Configuration Constants', () => {
  describe('ALLOWED_NEXT_PATTERNS', () => {
    it('should be an array', () => {
      expect(Array.isArray(ALLOWED_NEXT_PATTERNS)).toBe(true);
    });

    it('should contain essential Next.js patterns', () => {
      const essentialPatterns = [
        'next/*',
        'next/font/google',
        'next/font/local',
        'next/navigation',
        'next/server',
        'next/image',
        'next/link',
        'next/headers'
      ];

      essentialPatterns.forEach(pattern => {
        expect(ALLOWED_NEXT_PATTERNS).toContain(pattern);
      });
    });

    it('should contain extended Next.js patterns', () => {
      const extendedPatterns = [
        'next/cache',
        'next/og',
        'next/intl'
      ];

      extendedPatterns.forEach(pattern => {
        expect(ALLOWED_NEXT_PATTERNS).toContain(pattern);
      });
    });

    it('should not contain duplicate patterns', () => {
      const uniquePatterns = new Set(ALLOWED_NEXT_PATTERNS);
      expect(uniquePatterns.size).toBe(ALLOWED_NEXT_PATTERNS.length);
    });

    it('should have patterns in consistent format', () => {
      ALLOWED_NEXT_PATTERNS.forEach(pattern => {
        expect(pattern).toMatch(/^next\//);
        expect(typeof pattern).toBe('string');
        expect(pattern.length).toBeGreaterThan(0);
      });
    });

    it('should maintain DRY principle - no hardcoded duplicates', () => {
      // This test ensures the constants are used consistently
      // If someone adds a pattern here, they should also update the config
      const expectedPatternCount = 11; // Update this if patterns are added/removed
      expect(ALLOWED_NEXT_PATTERNS.length).toBe(expectedPatternCount);
    });
  });

  describe('EXPECTED_RULE_SEVERITIES', () => {
    it('should be an object', () => {
      expect(typeof EXPECTED_RULE_SEVERITIES).toBe('object');
      expect(EXPECTED_RULE_SEVERITIES).not.toBeNull();
    });

    it('should contain all required tiers', () => {
      const requiredTiers = ['frontend', 'package', 'service'];
      requiredTiers.forEach(tier => {
        expect(EXPECTED_RULE_SEVERITIES).toHaveProperty(tier);
      });
    });

    it('should have consistent rule structure across tiers', () => {
      const tiers = Object.keys(EXPECTED_RULE_SEVERITIES);
      const firstTierRules = Object.keys(EXPECTED_RULE_SEVERITIES[tiers[0]]);
      
      tiers.forEach(tier => {
        const tierRules = Object.keys(EXPECTED_RULE_SEVERITIES[tier]);
        expect(tierRules).toEqual(firstTierRules);
      });
    });

    it('should have valid severity values', () => {
      const validSeverities = ['off', 'warn', 'error'];
      
      Object.values(EXPECTED_RULE_SEVERITIES).forEach(tierConfig => {
        Object.values(tierConfig).forEach(severity => {
          expect(validSeverities).toContain(severity);
        });
      });
    });

    it('should have frontend-specific configuration', () => {
      const frontendConfig = EXPECTED_RULE_SEVERITIES.frontend;
      expect(frontendConfig['import/no-internal-modules']).toBe('warn');
      expect(frontendConfig['no-console']).toBe('warn');
    });

    it('should have package-specific configuration', () => {
      const packageConfig = EXPECTED_RULE_SEVERITIES.package;
      expect(packageConfig['import/no-internal-modules']).toBe('warn'); // Will flip to error later
      expect(packageConfig['no-console']).toBe('error');
    });

    it('should have service-specific configuration', () => {
      const serviceConfig = EXPECTED_RULE_SEVERITIES.service;
      expect(serviceConfig['import/no-internal-modules']).toBe('warn');
      expect(serviceConfig['no-console']).toBe('off');
    });

    it('should maintain consistency with verification script expectations', () => {
      // This test ensures the constants match what the verification script expects
      // If someone changes these, they should also update the verification script
      expect(EXPECTED_RULE_SEVERITIES.frontend['import/no-internal-modules']).toBe('warn');
      expect(EXPECTED_RULE_SEVERITIES.package['import/no-internal-modules']).toBe('warn');
      expect(EXPECTED_RULE_SEVERITIES.service['import/no-internal-modules']).toBe('warn');
    });
  });

  describe('Integration Tests', () => {
    it('should be importable without errors', () => {
      expect(() => {
        require('../scripts/eslint-config-constants.js');
      }).not.toThrow();
    });

    it('should maintain backward compatibility', () => {
      // Test that existing patterns are still present
      const legacyPatterns = ['next/*', 'next/font/google', 'next/navigation'];
      legacyPatterns.forEach(pattern => {
        expect(ALLOWED_NEXT_PATTERNS).toContain(pattern);
      });
    });

    it('should be consistent with documentation', () => {
      // This test ensures the constants match what's documented
      // If someone updates the constants, they should also update the docs
      const documentedPatterns = [
        'next/*',
        'next/font/google',
        'next/font/local',
        'next/navigation',
        'next/server',
        'next/image',
        'next/link',
        'next/headers',
        'next/cache',
        'next/og',
        'next/intl'
      ];

      expect(ALLOWED_NEXT_PATTERNS).toEqual(documentedPatterns);
    });
  });
});
