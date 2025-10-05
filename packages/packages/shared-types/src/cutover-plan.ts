/**
 * Contract Cutover Plan Configuration
 * 
 * Manages the transition from legacy mappings to canonical formats
 * with environment-specific settings and alerting.
 */

export interface CutoverConfig {
  environment: string;
  currentMode: 'on' | 'strict' | 'off';
  cutoverDate: string;
  alertThreshold: number;
  monitoringEnabled: boolean;
}

export interface CutoverPlan {
  phases: CutoverPhase[];
  alerts: CutoverAlert[];
  rollbackPlan: RollbackPlan;
}

export interface CutoverPhase {
  name: string;
  duration: string;
  mode: 'on' | 'strict' | 'off';
  description: string;
  successCriteria: string[];
  monitoringQueries: string[];
}

export interface CutoverAlert {
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: string;
}

export interface RollbackPlan {
  triggers: string[];
  steps: string[];
  estimatedTime: string;
  validationSteps: string[];
}

/**
 * Cutover configuration for different environments
 */
export const CUTOVER_CONFIGS: Record<string, CutoverConfig> = {
  development: {
    environment: 'development',
    currentMode: 'on',
    cutoverDate: '2025-02-01',
    alertThreshold: 10,
    monitoringEnabled: true
  },
  staging: {
    environment: 'staging',
    currentMode: 'strict',
    cutoverDate: '2025-01-15',
    alertThreshold: 5,
    monitoringEnabled: true
  },
  production: {
    environment: 'production',
    currentMode: 'on',
    cutoverDate: '2025-02-01',
    alertThreshold: 1,
    monitoringEnabled: true
  }
};

/**
 * Complete cutover plan
 */
export const CUTOVER_PLAN: CutoverPlan = {
  phases: [
    {
      name: 'Phase 1: Monitoring',
      duration: '0-30 days',
      mode: 'on',
      description: 'Enable telemetry and monitor legacy usage patterns',
      successCriteria: [
        'Telemetry data collected for 30 days',
        'Legacy usage patterns identified',
        'Migration tools prepared'
      ],
      monitoringQueries: [
        'sum(increase(contract_legacy_mapping_total[24h]))',
        'sum by (field) (increase(contract_legacy_mapping_total[7d]))',
        'sum by (environment) (increase(contract_legacy_mapping_total[24h]))'
      ]
    },
    {
      name: 'Phase 2: Warning',
      duration: '30-60 days',
      mode: 'strict',
      description: 'Increase warning frequency and notify teams',
      successCriteria: [
        'All teams notified of deprecation',
        'Migration timeline communicated',
        'Legacy usage trending downward'
      ],
      monitoringQueries: [
        'sum(increase(contract_legacy_mapping_total[24h])) < 50',
        'sum by (field) (increase(contract_legacy_mapping_total[7d]))',
        'rate(contract_legacy_mapping_total[1h])'
      ]
    },
    {
      name: 'Phase 3: Preparation',
      duration: '60-90 days',
      mode: 'strict',
      description: 'Prepare migration tools and finalize v2.0.0',
      successCriteria: [
        'Migration tools tested',
        'v2.0.0 ready for deployment',
        'All clients ready for migration'
      ],
      monitoringQueries: [
        'sum(increase(contract_legacy_mapping_total[24h])) < 10',
        'sum by (field) (increase(contract_legacy_mapping_total[7d]))',
        'count by (environment) (contract_legacy_mapping_total)'
      ]
    },
    {
      name: 'Phase 4: Cutover',
      duration: '90+ days',
      mode: 'off',
      description: 'Deploy v2.0.0 and disable legacy mappings',
      successCriteria: [
        'v2.0.0 deployed successfully',
        'Legacy mappings disabled',
        'No legacy usage detected'
      ],
      monitoringQueries: [
        'sum(increase(contract_legacy_mapping_total[24h])) == 0',
        'sum by (field) (increase(contract_legacy_mapping_total[7d])) == 0',
        'count by (environment) (contract_legacy_mapping_total) == 0'
      ]
    }
  ],
  alerts: [
    {
      name: 'High Legacy Usage',
      condition: 'sum(increase(contract_legacy_mapping_total[1h])) > 100',
      severity: 'high',
      description: 'High volume of legacy mapping usage detected',
      action: 'Investigate source and accelerate migration'
    },
    {
      name: 'Legacy Usage After Cutover',
      condition: 'sum(increase(contract_legacy_mapping_total[24h])) > 0',
      severity: 'critical',
      description: 'Legacy mappings still in use after cutover date',
      action: 'Immediate investigation and potential rollback'
    },
    {
      name: 'Migration Progress Stalled',
      condition: 'rate(contract_legacy_mapping_total[7d]) > 0.1',
      severity: 'medium',
      description: 'Legacy usage not decreasing as expected',
      action: 'Review migration progress and provide additional support'
    }
  ],
  rollbackPlan: {
    triggers: [
      'Critical system failures',
      'Data corruption detected',
      'Performance degradation > 50%',
      'Customer impact reports'
    ],
    steps: [
      'Set CONTRACT_V1_COMPAT=on in all environments',
      'Deploy previous version with legacy support',
      'Verify system stability',
      'Notify stakeholders of rollback',
      'Schedule post-mortem meeting'
    ],
    estimatedTime: '15-30 minutes',
    validationSteps: [
      'Verify all API endpoints responding',
      'Check metrics collection',
      'Validate data integrity',
      'Confirm customer impact resolved'
    ]
  }
};

/**
 * Get current cutover configuration for environment
 */
export function getCutoverConfig(environment: string = process.env.NODE_ENV || 'development'): CutoverConfig {
  return CUTOVER_CONFIGS[environment] || CUTOVER_CONFIGS.development;
}

/**
 * Check if cutover should be triggered
 */
export function shouldTriggerCutover(environment: string): boolean {
  const config = getCutoverConfig(environment);
  const cutoverDate = new Date(config.cutoverDate);
  const now = new Date();
  
  return now >= cutoverDate;
}

/**
 * Get next phase in cutover plan
 */
export function getNextPhase(currentPhase: string): CutoverPhase | null {
  const currentIndex = CUTOVER_PLAN.phases.findIndex(phase => phase.name === currentPhase);
  
  if (currentIndex === -1 || currentIndex >= CUTOVER_PLAN.phases.length - 1) {
    return null;
  }
  
  return CUTOVER_PLAN.phases[currentIndex + 1];
}

/**
 * Generate cutover status report
 */
export function generateCutoverReport(environment: string): string {
  const config = getCutoverConfig(environment);
  const shouldCutover = shouldTriggerCutover(environment);
  
  return `
# Contract Cutover Status Report

**Environment:** ${config.environment}
**Current Mode:** ${config.currentMode}
**Cutover Date:** ${config.cutoverDate}
**Should Trigger Cutover:** ${shouldCutover ? 'YES' : 'NO'}
**Alert Threshold:** ${config.alertThreshold}
**Monitoring Enabled:** ${config.monitoringEnabled}

## Next Steps
${shouldCutover ? 
  '⚠️ Cutover date reached - proceed with next phase' : 
  `📅 Cutover scheduled for ${config.cutoverDate}`
}

## Monitoring Queries
${CUTOVER_PLAN.phases
  .find(phase => phase.mode === config.currentMode)
  ?.monitoringQueries.map(query => `- \`${query}\``).join('\n') || 'No queries available'}

## Alerts
${CUTOVER_PLAN.alerts.map(alert => 
  `- **${alert.name}** (${alert.severity}): ${alert.description}`
).join('\n')}
  `.trim();
}

/**
 * Validate cutover readiness
 */
export function validateCutoverReadiness(environment: string): {
  ready: boolean;
  issues: string[];
  recommendations: string[];
} {
  const config = getCutoverConfig(environment);
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check if cutover date has passed
  if (shouldTriggerCutover(environment)) {
    if (config.currentMode === 'on') {
      issues.push('Cutover date passed but still in "on" mode');
      recommendations.push('Switch to "strict" mode immediately');
    }
  }
  
  // Check monitoring status
  if (!config.monitoringEnabled) {
    issues.push('Monitoring not enabled');
    recommendations.push('Enable monitoring before cutover');
  }
  
  // Check alert threshold
  if (config.alertThreshold > 5) {
    issues.push('Alert threshold too high for production');
    recommendations.push('Lower alert threshold to 1-2 for production');
  }
  
  return {
    ready: issues.length === 0,
    issues,
    recommendations
  };
}
