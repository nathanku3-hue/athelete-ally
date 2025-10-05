/**
 * Server-Only Contract Utilities
 * 
 * This module ensures that backward compatibility mappings and telemetry
 * are only used in server-side code (API routes, services) and not
 * bundled into client-side code.
 */

import { NextRequest } from 'next/server';

/**
 * Check if code is running on the server side
 */
function isServerSide(): boolean {
  return typeof window === 'undefined' && typeof process !== 'undefined';
}

/**
 * Check if code is running in Next.js Edge Runtime
 */
function isEdgeRuntime(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (globalThis as any).EdgeRuntime !== 'undefined' || 
         (typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'edge');
}

/**
 * Server-only wrapper for contract utilities
 * Throws an error if called on client side
 */
export function serverOnly<T>(fn: () => T, context: string = 'server-only function'): T {
  if (!isServerSide()) {
    throw new Error(`❌ ${context} called on client side. This function should only be used in API routes or server components.`);
  }
  
  if (isEdgeRuntime()) {
    throw new Error(`❌ ${context} called in Edge Runtime. This function requires Node.js APIs and should not be used in Edge Runtime.`);
  }
  
  return fn();
}

/**
 * Safe import for server-only contract utilities
 * Only imports when running on server side
 */
export async function importServerContractUtils() {
  if (!isServerSide()) {
    throw new Error('❌ Contract utilities can only be imported on server side');
  }
  
  if (isEdgeRuntime()) {
    throw new Error('❌ Contract utilities cannot be used in Edge Runtime');
  }
  
  // Dynamic import to ensure it's only loaded on server
  const { 
    mapLegacyApiRequest, 
    mapLegacyApiResponse,
    recordLegacyMapping,
    getContractMetrics,
    shouldApplyLegacyMapping,
    isTelemetryEnabled
  } = await import('@athlete-ally/shared-types');
  
  return {
    mapLegacyApiRequest,
    mapLegacyApiResponse,
    recordLegacyMapping,
    getContractMetrics,
    shouldApplyLegacyMapping,
    isTelemetryEnabled
  };
}

/**
 * Server-only contract request handler
 * Wraps legacy mapping with server-side checks
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleServerContractRequest<T>(request: NextRequest, handler: (mappedRequest: unknown) => Promise<T>): Promise<T> {
  return serverOnly(async () => {
    const { mapLegacyApiRequest } = await importServerContractUtils();
    
    const body = await request.json();
    const mappedBody = mapLegacyApiRequest(body);
    
    return handler(mappedBody);
  }, 'contract request handler');
}

/**
 * Server-only contract response handler
 * Wraps legacy mapping with server-side checks
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleServerContractResponse<T>(response: any, handler: (mappedResponse: any) => T): Promise<T> {
  return serverOnly(async () => {
    const { mapLegacyApiResponse } = await import('@athlete-ally/shared-types');
    
    const mappedResponse = mapLegacyApiResponse(response);
    
    return handler(mappedResponse);
  }, 'contract response handler');
}

/**
 * Runtime environment detection
 */
export function getRuntimeInfo() {
  return {
    isServerSide: isServerSide(),
    isEdgeRuntime: isEdgeRuntime(),
    isClientSide: typeof window !== 'undefined',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    runtime: typeof (globalThis as any).EdgeRuntime !== 'undefined' ? 'edge' : 
            typeof process !== 'undefined' ? 'node' : 'unknown'
  };
}
