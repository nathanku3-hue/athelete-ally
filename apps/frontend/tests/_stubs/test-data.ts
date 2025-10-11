// Test data stubs with proper typing
// NOTE: Replace with real helpers if these tests are kept.

export interface TestProtocol {
  id: string;
  name: string;
  version: string;
  description?: string;
  category: string;
  difficulty: string;
  duration?: number;
  frequency?: number;
  isPublic: boolean;
  isActive: boolean;
  createdBy?: string;
  overview?: string;
  principles: string[];
  requirements: string[];
  blocks?: unknown[];
  templates?: unknown[];
  executions?: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TestShare {
  id: string;
  protocolId: string;
  sharedBy: string;
  sharedWith: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestUser {
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
