// Frontend logger wrapper using shared facade
import { createLogger } from '@athlete-ally/logger';
import browserAdapter from '@athlete-ally/logger/browser';

export const logger = createLogger(browserAdapter, { module: 'frontend', service: 'frontend' });
