/**
 * Contract Compatibility Configuration
 * 
 * Environment-based control for backward compatibility mappings.
 */

export type ContractCompatibilityMode = 'on' | 'off' | 'strict';

interface ContractConfig {
  mode: ContractCompatibilityMode;
  environment: string;
  enableTelemetry: boolean;
  strictModeThreshold: number; // Days after which to enforce strict mode
}

class ContractConfigManager {
  private config: ContractConfig;
  
  constructor() {
    this.config = this.loadConfig();
  }
  
  private loadConfig(): ContractConfig {
    const mode = (process.env.CONTRACT_V1_COMPAT as ContractCompatibilityMode) || 'on';
    const environment = process.env.NODE_ENV || 'development';
    const enableTelemetry = process.env.CONTRACT_TELEMETRY !== 'false';
    const strictModeThreshold = parseInt(process.env.CONTRACT_STRICT_THRESHOLD || '90'); // 90 days default
    
    return {
      mode,
      environment,
      enableTelemetry,
      strictModeThreshold
    };
  }
  
  /**
   * Check if legacy mappings should be enabled
   */
  isLegacyMappingEnabled(): boolean {
    switch (this.config.mode) {
      case 'off':
        return false;
      case 'strict':
        return this.shouldAllowLegacyInStrictMode();
      case 'on':
      default:
        return true;
    }
  }
  
  /**
   * Check if we should allow legacy in strict mode (e.g., after grace period)
   */
  private shouldAllowLegacyInStrictMode(): boolean {
    // In strict mode, you might want to check deployment date, etc.
    // For now, we'll allow it but log warnings
    // eslint-disable-next-line no-console
    console.warn('⚠️ Contract strict mode active - legacy mappings should be minimal');
    return true; // Still allow but with warnings
  }
  
  /**
   * Get current configuration
   */
  getConfig(): ContractConfig {
    return { ...this.config };
  }
  
  /**
   * Update configuration (useful for testing)
   */
  updateConfig(updates: Partial<ContractConfig>) {
    this.config = { ...this.config, ...updates };
  }
  
  /**
   * Check if telemetry should be enabled
   */
  isTelemetryEnabled(): boolean {
    return this.config.enableTelemetry;
  }
  
  /**
   * Get environment-specific settings
   */
  getEnvironmentSettings() {
    return {
      isProduction: this.config.environment === 'production',
      isDevelopment: this.config.environment === 'development',
      isTest: this.config.environment === 'test',
      environment: this.config.environment
    };
  }
}

// Global config instance
export const contractConfig = new ContractConfigManager();

/**
 * Helper function to check if legacy mapping should be applied
 */
export function shouldApplyLegacyMapping(): boolean {
  return contractConfig.isLegacyMappingEnabled();
}

/**
 * Get current contract configuration
 */
export function getContractConfig() {
  return contractConfig.getConfig();
}

/**
 * Check if telemetry is enabled
 */
export function isTelemetryEnabled(): boolean {
  return contractConfig.isTelemetryEnabled();
}
