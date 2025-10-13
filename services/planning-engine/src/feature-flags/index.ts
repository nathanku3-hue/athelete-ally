import LaunchDarkly from 'launchdarkly-node-server-sdk';
import { createLogger } from '@athlete-ally/logger';
import nodeAdapter from '@athlete-ally/logger/server';

const log = createLogger(nodeAdapter, { module: 'feature-flags', service: 'planning-engine' });

let client: LaunchDarkly.LDClient | null = null;
let initializing: Promise<LaunchDarkly.LDClient | null> | null = null;

const CONTEXT = {
  kind: 'service' as const,
  key: 'planning-engine',
  name: 'planning-engine',
};

async function ensureClient(): Promise<LaunchDarkly.LDClient | null> {
  if (client) {
    return client;
  }

  if (initializing) {
    return initializing;
  }

  const sdkKey = process.env.LAUNCHDARKLY_SDK_KEY;
  if (!sdkKey) {
    log.warn('LaunchDarkly SDK key not provided; feature flags disabled');
    return null;
  }

  const ldClient = LaunchDarkly.init(sdkKey, {
    application: {
      id: 'planning-engine',
      version: process.env.npm_package_version || 'unknown',
    },
  });

  initializing = ldClient
    .waitForInitialization()
    .then(() => {
      client = ldClient;
      log.info('LaunchDarkly client initialized');
      return client;
    })
    .catch((error: unknown) => {
      const err = error instanceof Error ? error : new Error(String(error));
      log.error(err, { route: 'feature-flags:init' });
      ldClient.close();
      client = null;
      return null;
    })
    .finally(() => {
      initializing = null;
    });

  return initializing;
}

export async function initializeFeatureFlags(): Promise<void> {
  await ensureClient();
}

export async function isFeatureEnabled(flagKey: string, defaultValue = false): Promise<boolean> {
  const ldClient = await ensureClient();
  if (!ldClient) {
    return defaultValue;
  }

  try {
    return await ldClient.variation(flagKey, CONTEXT, defaultValue);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log.error(err, { route: `feature-flags:${flagKey}` });
    return defaultValue;
  }
}

export async function closeFeatureFlags(): Promise<void> {
  if (!client) {
    return;
  }

  try {
    await client.flush();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    log.warn('LaunchDarkly flush failed during shutdown', {
      route: 'feature-flags:close',
      value: err.message,
    });
  }

  await client.close();
  client = null;
  log.info('LaunchDarkly client closed');
}
