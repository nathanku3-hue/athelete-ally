// Placeholder helpers for legacy tests; replace with real fixtures if needed.
export async function createTestUser(email: string, name: string): Promise<any> {
  return { id: 'user_' + Math.random().toString(36).slice(2), email, name };
}

export async function createTestProtocol(name: string, createdBy: string): Promise<any> {
  return {
    id: 'prot_' + Math.random().toString(36).slice(2),
    name,
    createdBy,
    isPublic: false,
  };
}

export async function createTestShare(input: any): Promise<any> {
  return {
    id: 'share_' + Math.random().toString(36).slice(2),
    protocolId: input.protocolId,
    sharedBy: input.sharedBy || 'user_default',
    sharedWith: input.sharedWith,
    permissions: input.permissions || ['read'],
    isActive: true,
  };
}

const ANY: any = {};
export default ANY;
