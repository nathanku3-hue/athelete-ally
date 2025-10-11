// Type definitions for vitest test framework
// Use actual vitest types instead of any

type TestFunction = (name: string, fn: () => void | Promise<void>, timeout?: number) => void;
type HookFunction = (fn: () => void | Promise<void>, timeout?: number) => void;

interface MockFunction {
  (...args: unknown[]): unknown;
  mockReturnValue(value: unknown): MockFunction;
  mockResolvedValue(value: unknown): MockFunction;
  mockRejectedValue(value: unknown): MockFunction;
  mockImplementation(fn: (...args: unknown[]) => unknown): MockFunction;
}

interface ExpectStatic {
  (value: unknown): {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toContain(item: unknown): void;
    toHaveLength(length: number): void;
    toThrow(error?: string | RegExp): void;
    toHaveBeenCalled(): void;
    toHaveBeenCalledTimes(times: number): void;
    toHaveBeenCalledWith(...args: unknown[]): void;
    resolves: {
      toBe(expected: unknown): Promise<void>;
      toEqual(expected: unknown): Promise<void>;
    };
    rejects: {
      toThrow(error?: string | RegExp): Promise<void>;
    };
  };
}

interface VitestApi {
  fn(): MockFunction;
  fn(implementation: (...args: unknown[]) => unknown): MockFunction;
  mock(path: string, factory?: () => unknown): void;
  clearAllMocks(): void;
  resetAllMocks(): void;
  restoreAllMocks(): void;
  spyOn(object: Record<string, unknown>, method: string): MockFunction;
}

declare module 'vitest' {
  export const vi: VitestApi;
  export const describe: TestFunction;
  export const it: TestFunction;
  export const test: TestFunction;
  export const beforeAll: HookFunction;
  export const beforeEach: HookFunction;
  export const afterEach: HookFunction;
  export const afterAll: HookFunction;
  export const expect: ExpectStatic;

  const vitestDefault: {
    vi: VitestApi;
    describe: TestFunction;
    it: TestFunction;
    test: TestFunction;
    beforeAll: HookFunction;
    beforeEach: HookFunction;
    afterEach: HookFunction;
    afterAll: HookFunction;
    expect: ExpectStatic;
  };
  export default vitestDefault;
}
