// Test data helpers with proper typing
// Placeholder helpers for legacy tests; replace with real fixtures if needed.

import { TestProtocol, TestUser, TestShare } from '../_stubs/test-data';

// Re-export types for convenience
export type { TestProtocol, TestUser, TestShare };

interface TestShareInput {
  protocolId: string;
  sharedBy?: string;
  sharedWith: string;
  permissions?: string[];
}

export async function createTestUser(email: string, name: string): Promise<TestUser> {
  return { id: 'user_' + Math.random().toString(36).slice(2), email, name };
}

export async function createTestProtocol(name: string, createdBy: string): Promise<TestProtocol> {
  return {
    id: 'prot_' + Math.random().toString(36).slice(2),
    name,
    version: '1.0.0',
    description: 'test protocol',
    category: 'strength',
    difficulty: 'intermediate',
    duration: 12,
    frequency: 3,
    isPublic: false,
    isActive: true,
    createdBy,
    overview: 'Test protocol overview',
    principles: ['Progressive overload', 'Periodization'],
    requirements: ['Barbell', 'Plates', 'Squat rack'],
    blocks: [],
    templates: [],
    executions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function createTestShare(input: TestShareInput): Promise<TestShare> {
  return {
    id: 'share_' + Math.random().toString(36).slice(2),
    protocolId: input.protocolId,
    sharedBy: input.sharedBy || 'user_default',
    sharedWith: input.sharedWith,
    permissions: input.permissions || ['read'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export const EMPTY_OBJECT: Record<string, unknown> = {};

// Named exports for better module resolution
export const testHelpers = {
  createTestUser,
  createTestProtocol,
  createTestShare,
  EMPTY_OBJECT,
};
