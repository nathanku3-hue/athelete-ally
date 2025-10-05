import { NextRequest, NextResponse } from 'next/server';
import { createMetricsApiHandler, createHealthCheckHandler } from '@athlete-ally/shared-types';

// Lock runtime to Node.js and disable caching
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Secure metrics endpoint with authentication and network restrictions
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Security checks
  if (!isAuthorizedForMetrics(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }

  // Rate limiting check
  if (!isWithinRateLimit(request)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60'
        }
      }
    );
  }

  // Use secure metrics handler
  const metricsHandler = createMetricsApiHandler();
  return metricsHandler(request, NextResponse);
}

/**
 * Health check endpoint (less restrictive)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const healthHandler = createHealthCheckHandler();
  return await healthHandler(request, NextResponse);
}

/**
 * Check if request is authorized for metrics access
 * Production: Gateway/IP allowlist + API key
 * Development: Localhost allowances
 */
function isAuthorizedForMetrics(request: NextRequest): boolean {
  const clientIP = getClientIP(request);
  
  // In production, implement proper authentication
  if (process.env.NODE_ENV === 'production') {
    // Check API key first
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.METRICS_API_KEY;
    
    if (!validApiKey || !apiKey || apiKey !== validApiKey) {
      return false;
    }
    
    // Check IP allowlist
    if (isIPAllowed(clientIP)) {
      return true;
    }
    
    return false;
  }
  
  // In development, allow localhost access
  return clientIP === '127.0.0.1' || clientIP === '::1' || clientIP?.startsWith('192.168.');
}

/**
 * Check if IP is in allowlist
 */
function isIPAllowed(clientIP: string | null): boolean {
  if (!clientIP) return false;
  
  // Check METRICS_ALLOWLIST (comma-separated IPs)
  const allowlist = process.env.METRICS_ALLOWLIST;
  if (allowlist) {
    const allowedIPs = allowlist.split(',').map(ip => ip.trim());
    if (allowedIPs.includes(clientIP)) {
      return true;
    }
  }
  
  // Check METRICS_ALLOWLIST_CIDR (comma-separated CIDR blocks)
  const cidrAllowlist = process.env.METRICS_ALLOWLIST_CIDR;
  if (cidrAllowlist) {
    const cidrBlocks = cidrAllowlist.split(',').map(cidr => cidr.trim());
    if (isIPInCIDR(clientIP, cidrBlocks)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if IP is in CIDR block (simplified implementation)
 */
function isIPInCIDR(ip: string, cidrBlocks: string[]): boolean {
  // Simplified CIDR check - in production, use a proper CIDR library
  for (const cidr of cidrBlocks) {
    if (cidr.includes('/')) {
      const [network, prefixLength] = cidr.split('/');
      const networkIP = ipToNumber(network);
      const clientIPNum = ipToNumber(ip);
      const mask = (0xffffffff << (32 - parseInt(prefixLength))) >>> 0;
      
      if ((clientIPNum & mask) === (networkIP & mask)) {
        return true;
      }
    } else if (cidr === ip) {
      return true;
    }
  }
  return false;
}

/**
 * Convert IP to number for CIDR calculations
 */
function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

/**
 * Check if request is within rate limits
 */
function isWithinRateLimit(request: NextRequest): boolean {
  // Simple rate limiting - in production, use Redis or similar
  const clientIP = getClientIP(request);
  
  // For now, just return true - implement proper rate limiting in production
  return true;
}

/**
 * Extract client IP from request
 */
function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return null; // NextRequest doesn't have ip property
}
