/**
 * Feature Hello Server-Only Guard
 * 
 * This file contains server-only functionality that should not be
 * accessible from client-side code. The boundaries pattern ensures
 * this separation.
 */

import type { HelloRequest, HelloResponse } from './schemas.js';
import { defaultToggle } from './toggle.js';
import { defaultMetrics } from './metrics.js';

/**
 * Server-only greeting service that processes requests
 * and returns responses with feature toggle integration.
 */
export class HelloService {
  constructor(
    private toggle = defaultToggle,
    private metrics = defaultMetrics
  ) {}

  async processGreeting(request: HelloRequest): Promise<HelloResponse> {
    const startTime = Date.now();
    
    try {
      const featureEnabled = this.toggle.isEnabled('hello-greeting');
      
      if (!featureEnabled) {
        this.metrics.increment('hello.disabled');
        throw new Error('Hello feature is disabled');
      }

      const greeting = `Hello, ${request.message}!`;
      const response: HelloResponse = {
        greeting,
        timestamp: new Date().toISOString(),
        featureEnabled,
      };

      this.metrics.increment('hello.processed', { status: 'success' });
      this.metrics.timing('hello.processing_time', Date.now() - startTime);
      
      return response;
    } catch (error) {
      this.metrics.increment('hello.processed', { status: 'error' });
      throw error;
    }
  }
}

export const defaultHelloService = new HelloService();
