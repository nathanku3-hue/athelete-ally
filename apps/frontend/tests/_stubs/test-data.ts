// Test data stubs with proper typing
// NOTE: Replace with real helpers if these tests are kept.

interface TestProtocol {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  difficulty: string;
  isPublic: boolean;
  isActive: boolean;
  createdBy: string;
  principles: unknown[];
  requirements: unknown[];
  blocks: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

interface TestShare {
  id: string;
  protocolId: string;
  sharedBy: string;
  sharedWith: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TestUser {
  id: string;
  email: string;
  name: string;
}

export const EMPTY_OBJECT: Record<string, unknown> = {};

export function createTestUser(email: string, name: string): TestUser {
  return { id: `user_${Date.now()}`, email, name };
}

export function createTestProtocol(name: string, createdBy: string): TestProtocol {
  return {
    id: `proto_${Date.now()}`,
    name,
    version: '1.0.0',
    description: 'test protocol',
    category: 'strength',
    difficulty: 'intermediate',
    isPublic: false,
    isActive: true,
    createdBy,
    principles: [],
    requirements: [],
    blocks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createTestShare(
  protocolId: string,
  sharedBy: string,
  sharedWith: string,
  permissions: string[]
): TestShare {
  return {
    id: `share_${Date.now()}`,
    protocolId,
    sharedBy,
    sharedWith,
    permissions,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Named exports for better IDE support
export const testDataExports = {
  EMPTY_OBJECT,
  createTestUser,
  createTestProtocol,
  createTestShare,
};
