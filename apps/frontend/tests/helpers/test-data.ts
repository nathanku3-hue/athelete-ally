// Test data helpers with proper typing
// Placeholder helpers for legacy tests; replace with real fixtures if needed.

interface TestUser {
  id: string;
  email: string;
  name: string;
}

interface TestProtocol {
  id: string;
  name: string;
  createdBy: string;
  isPublic: boolean;
}

interface TestShareInput {
  protocolId: string;
  sharedBy?: string;
  sharedWith: string;
  permissions?: string[];
}

interface TestShare {
  id: string;
  protocolId: string;
  sharedBy: string;
  sharedWith: string;
  permissions: string[];
  isActive: boolean;
}

export async function createTestUser(email: string, name: string): Promise<TestUser> {
  return { id: 'user_' + Math.random().toString(36).slice(2), email, name };
}

export async function createTestProtocol(name: string, createdBy: string): Promise<TestProtocol> {
  return {
    id: 'prot_' + Math.random().toString(36).slice(2),
    name,
    createdBy,
    isPublic: false,
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
