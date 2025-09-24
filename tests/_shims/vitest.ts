// Minimal Vitest shim for Jest runtime
export const vi = {
  fn: jest.fn.bind(jest),
  spyOn: jest.spyOn.bind(jest),
  mock: jest.fn.bind(jest),
  clearAllMocks: jest.clearAllMocks.bind(jest),
  resetAllMocks: jest.resetAllMocks ? jest.resetAllMocks.bind(jest) : () => {},
};
export const describe = global.describe;
export const it = global.it;
export const test = global.test;
export const beforeAll = global.beforeAll;
export const beforeEach = global.beforeEach;
export const afterEach = global.afterEach;
export const afterAll = global.afterAll;
export const expect = global.expect;
export default { vi, describe, it, test, beforeAll, beforeEach, afterEach, afterAll, expect };
