interface TestDataModule {
  createTestUser: (email: string, name: string) => Promise<unknown>;
  createTestProtocol: (name: string, createdBy: string) => Promise<unknown>;
  createTestShare: (input: Record<string, unknown>) => Promise<unknown>;
  EMPTY_OBJECT: Record<string, unknown>;
}

declare module '*helpers/test-data' {
  const testData: TestDataModule;
  export = testData;
}

declare module '*services/planning-engine/src/llm.js' {
  const llmModule: {
    [key: string]: unknown;
  };
  export = llmModule;
}
