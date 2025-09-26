// Loose test-data stub to satisfy TypeScript/Jest resolution
// NOTE: Replace with real helpers if these tests are kept.

export const ANY: any = {};

export function createTestUser(email: string, name: string) {
  return { id: `user_${Date.now()}`, email, name };
}

export function createTestProtocol(name: string, createdBy: string) {
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
  } as any; // keep loose typing for legacy tests
}

export function createTestShare(
  protocolId: string,
  sharedBy: string,
  sharedWith: string,
  permissions: string[]
) {
  return {
    id: `share_${Date.now()}`,
    protocolId,
    sharedBy,
    sharedWith,
    permissions,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;
}

export default {};
