import { createNextHealthHandler } from '@athlete-ally/health-schema';

const healthHandler = createNextHealthHandler({
  serviceName: 'frontend',
  version: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
});

export async function GET() {
  return healthHandler();
}
