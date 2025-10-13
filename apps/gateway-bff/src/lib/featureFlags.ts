import LaunchDarkly from 'launchdarkly-node-server-sdk';

let client: LaunchDarkly.LDClient | null = null;
let initializing: Promise<LaunchDarkly.LDClient | null> | null = null;

const CONTEXT = {
  kind: 'service' as const,
  key: 'gateway-bff',
  name: 'gateway-bff',
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
    return null;
  }

  const ldClient = LaunchDarkly.init(sdkKey, {
    application: {
      id: 'gateway-bff',
      version: process.env.npm_package_version || 'unknown',
    },
  });

  initializing = ldClient
    .waitForInitialization()
    .then(() => {
      client = ldClient;
      return client;
    })
    .catch(() => {
      ldClient.close();
      client = null;
      return null;
    })
    .finally(() => {
      initializing = null;
    });

  return initializing;
}

export async function isFeatureEnabled(flagKey: string, defaultValue: boolean): Promise<boolean> {
  const ldClient = await ensureClient();
  if (!ldClient) {
    return defaultValue;
  }

  try {
    return await ldClient.variation(flagKey, CONTEXT, defaultValue);
  } catch {
    return defaultValue;
  }
}

export async function closeFeatureFlags(): Promise<void> {
  if (!client) {
    return;
  }

  try {
    await client.flush();
  } finally {
    await client.close();
    client = null;
  }
}
