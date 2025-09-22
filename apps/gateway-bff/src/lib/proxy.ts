import fetch, { Response } from 'node-fetch';
import { businessMetrics } from '../telemetry.js';

function statusClass(code: number): string {
  if (code >= 200 && code < 300) return '2xx';
  if (code >= 300 && code < 400) return '3xx';
  if (code >= 400 && code < 500) return '4xx';
  if (code >= 500) return '5xx';
  return 'other';
}

export async function proxyRequest(
  method: 'GET'|'POST'|'PUT'|'DELETE',
  url: string,
  body: any | undefined,
  labels: { upstream: string; route: string },
  headers: Record<string,string> = { 'content-type': 'application/json' }
): Promise<Response> {
  const start = Date.now();
  try {
    businessMetrics.apiRequests.add(1, {
      'http.method': method,
      'http.path': labels.route,
      'upstream_service': labels.upstream,
    } as any);

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    } as any);

    const dur = (Date.now() - start) / 1000;
    businessMetrics.apiResponseTime.record(dur, {
      'http.method': method,
      'http.path': labels.route,
      'http.status_code': String(res.status),
      'upstream_service': labels.upstream,
    } as any);

    if (!res.ok) {
      businessMetrics.apiErrors.add(1, {
        'error.type': 'upstream_error',
        'upstream_service': labels.upstream,
        'http.status_class': statusClass(res.status),
      } as any);
    }

    return res;
  } catch (err) {
    const dur = (Date.now() - start) / 1000;
    businessMetrics.apiResponseTime.record(dur, {
      'http.method': method,
      'http.path': labels.route,
      'http.status_code': '0',
      'upstream_service': labels.upstream,
    } as any);
    businessMetrics.apiErrors.add(1, {
      'error.type': 'network_error',
      'upstream_service': labels.upstream,
    } as any);
    throw err;
  }
}