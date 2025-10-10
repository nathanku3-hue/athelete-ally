/**
 * Feature Hello Schemas
 * 
 * Example schemas for the pilot package demonstrating boundaries pattern.
 */

import { z } from 'zod';

export const HelloRequestSchema = z.object({
  message: z.string().min(1).max(100),
  userId: z.string().uuid().optional(),
});

export const HelloResponseSchema = z.object({
  greeting: z.string(),
  timestamp: z.string().datetime(),
  featureEnabled: z.boolean(),
});

export type HelloRequest = z.infer<typeof HelloRequestSchema>;
export type HelloResponse = z.infer<typeof HelloResponseSchema>;
