interface TestDataExports {
  createTestUser: (email: string, name: string) => Promise<unknown>;
  createTestProtocol: (name: string, createdBy: string) => Promise<unknown>;
  createTestShare: (input: Record<string, unknown>) => Promise<unknown>;
  EMPTY_OBJECT: Record<string, unknown>;
}

declare module '../helpers/test-data' {
  const testData: TestDataExports;
  export = testData;
}
