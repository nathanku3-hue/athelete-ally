/**
 * Feature Hello Toggle
 * 
 * Example feature toggle implementation for the pilot package.
 */

export interface FeatureToggle {
  isEnabled(feature: string, userId?: string): boolean;
}

export class HelloFeatureToggle implements FeatureToggle {
  private readonly enabledFeatures: Set<string>;

  constructor(enabledFeatures: string[] = ['hello-greeting']) {
    this.enabledFeatures = new Set(enabledFeatures);
  }

  isEnabled(feature: string, userId?: string): boolean {
    return this.enabledFeatures.has(feature);
  }
}

export const defaultToggle = new HelloFeatureToggle();
