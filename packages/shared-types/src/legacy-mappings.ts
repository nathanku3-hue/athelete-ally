/**
 * Backward Compatibility Mappings
 * 
 * Temporary mappings for legacy clients that may still use old formats.
 * These should be deprecated and removed in future versions.
 */

import { FatigueLevel, Season } from './index';
import { recordLegacyMapping } from './telemetry';
import { shouldApplyLegacyMapping, isTelemetryEnabled, getContractConfig } from './config';

/**
 * Maps legacy fatigue level 'normal' to canonical 'moderate'
 * @deprecated Use 'moderate' instead of 'normal'. This mapping will be removed in v2.0.0
 */
export function mapLegacyFatigueLevel(level: string): FatigueLevel {
  // Check if legacy mapping should be applied
  if (!shouldApplyLegacyMapping()) {
    throw new Error(`Legacy mapping disabled. Invalid fatigue level: ${level}. Must be one of: low, moderate, high`);
  }
  
  switch (level) {
    case 'normal':
      // Record telemetry if enabled
      if (isTelemetryEnabled()) {
        const config = getContractConfig();
        recordLegacyMapping('fatigue_level', 'normal', config.environment);
      }

      // eslint-disable-next-line no-console
      console.warn('⚠️ Deprecated: "normal" fatigue level detected. Use "moderate" instead. This mapping will be removed in v2.0.0');
      return 'moderate';
    case 'low':
    case 'moderate':
    case 'high':
      return level as FatigueLevel;
    default:
      throw new Error(`Invalid fatigue level: ${level}. Must be one of: low, moderate, high`);
  }
}

/**
 * Maps legacy hyphenated season formats to canonical formats
 * @deprecated Use 'offseason', 'preseason', 'inseason' instead of hyphenated versions. This mapping will be removed in v2.0.0
 */
export function mapLegacySeason(season: string): Season {
  // Check if legacy mapping should be applied
  if (!shouldApplyLegacyMapping()) {
    throw new Error(`Legacy mapping disabled. Invalid season: ${season}. Must be one of: offseason, preseason, inseason`);
  }
  
  switch (season) {
    case 'off-season':
      if (isTelemetryEnabled()) {
        const config = getContractConfig();
        recordLegacyMapping('season', 'off-season', config.environment);
      }
      // eslint-disable-next-line no-console
      console.warn('⚠️ Deprecated: "off-season" detected. Use "offseason" instead. This mapping will be removed in v2.0.0');
      return 'offseason';
    case 'pre-season':
      if (isTelemetryEnabled()) {
        const config = getContractConfig();
        recordLegacyMapping('season', 'pre-season', config.environment);
      }
      // eslint-disable-next-line no-console
      console.warn('⚠️ Deprecated: "pre-season" detected. Use "preseason" instead. This mapping will be removed in v2.0.0');
      return 'preseason';
    case 'in-season':
      if (isTelemetryEnabled()) {
        const config = getContractConfig();
        recordLegacyMapping('season', 'in-season', config.environment);
      }
      // eslint-disable-next-line no-console
      console.warn('⚠️ Deprecated: "in-season" detected. Use "inseason" instead. This mapping will be removed in v2.0.0');
      return 'inseason';
    case 'offseason':
    case 'preseason':
    case 'inseason':
      return season as Season;
    default:
      throw new Error(`Invalid season: ${season}. Must be one of: offseason, preseason, inseason`);
  }
}

/**
 * Legacy API response mapper for backward compatibility
 * @deprecated This function will be removed in v2.0.0
 */
export function mapLegacyApiResponse(response: Record<string, unknown>): Record<string, unknown> {
  if (response.level && typeof response.level === 'string' && response.level === 'normal') {
    return {
      ...response,
      level: 'moderate',
      _deprecated: {
        message: 'The "normal" fatigue level is deprecated. Use "moderate" instead.',
        version: '2.0.0',
        removalDate: '2025-06-01'
      }
    };
  }
  
  if (response.season && typeof response.season === 'string' && ['off-season', 'pre-season', 'in-season'].includes(response.season)) {
    return {
      ...response,
      season: mapLegacySeason(response.season),
      _deprecated: {
        message: 'Hyphenated season formats are deprecated. Use "offseason", "preseason", "inseason" instead.',
        version: '2.0.0',
        removalDate: '2025-06-01'
      }
    };
  }
  
  return response;
}

/**
 * Legacy API request mapper for backward compatibility
 * @deprecated This function will be removed in v2.0.0
 */
export function mapLegacyApiRequest(request: Record<string, unknown>): Record<string, unknown> {
  const mapped = { ...request };
  
  if (mapped.level && typeof mapped.level === 'string' && mapped.level === 'normal') {
    mapped.level = 'moderate';
  }
  
  if (mapped.season && typeof mapped.season === 'string' && ['off-season', 'pre-season', 'in-season'].includes(mapped.season)) {
    mapped.season = mapLegacySeason(mapped.season);
  }
  
  return mapped;
}
