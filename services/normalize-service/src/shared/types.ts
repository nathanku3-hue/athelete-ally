/**
 * Shared type definitions for normalize-service
 */

// Telemetry types
export interface TelemetrySpan {
  setAttribute: (key: string, value: string | number) => void;
  setStatus: (status: { code: number; message?: string }) => void;
  end: () => void;
  recordException: (err: unknown) => void;
}

export interface TelemetryTracer {
  startActiveSpan: (name: string, fn: (span: TelemetrySpan) => Promise<void>) => Promise<void>;
}

export interface TelemetryMeter {
  createCounter: (name: string, options: { description: string }) => {
    add: (value: number, labels: Record<string, string>) => void;
  };
}

export interface TelemetryBootstrap {
  tracer: TelemetryTracer;
  meter: TelemetryMeter;
}

export interface WithExtractedContext {
  (headers: Record<string, string>, fn: () => Promise<void>): Promise<void>;
}

// Consumer configuration types
export interface ConsumerConfig {
  durableName: string;
  maxDeliver: number;
  dlqSubject: string;
  ackWaitMs: number;
  subject: string;
  streamName?: string;
}

// Message processing types
export interface MessageMetadata {
  streamSeq?: number;
  deliverySeq?: number;
  redeliveries: number;
  subject: string;
}

// Data payload types
export interface HRVPayload {
  userId: string;
  date: string;
  rMSSD?: number;
  rmssd?: number;
  lnRMSSD?: number;
  lnRmssd?: number;
}

export interface SleepPayload {
  userId: string;
  date: string;
  durationMinutes: number;
  capturedAt?: string;
  raw?: Record<string, unknown>;
}
