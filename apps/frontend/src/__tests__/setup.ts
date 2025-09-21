// Jest测试环境设置
import '@testing-library/jest-dom';

// 模拟Next.js环境
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// 模拟Next.js Image组件
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const React = require('react');
    return React.createElement('img', props);
  },
}));

// 模拟Next.js Link组件
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => {
    const React = require('react');
    return React.createElement('a', { href, ...props }, children);
  },
}));

// 模拟fetch API - 使用原生fetch
if (typeof (global as any).fetch === 'undefined') { (global as any).fetch = require('node-fetch'); }

// 模拟localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// 模拟sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// 模拟IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
  root = null;
  rootMargin = '';
  thresholds = [];
};

// 模拟ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// 模拟matchMedia (仅在浏览器环境中)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // 模拟window.scrollTo
  Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true,
  });
}

// 模拟console方法以避免测试中的噪音
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps has been renamed')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// 清理模拟
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});
// Mock Next App Router (next/navigation)
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new (class {
      get(name: string) { return null; }
      toString() { return ''; }
      entries() { return ([] as any).entries(); }
      keys() { return ([] as any).keys(); }
      values() { return ([] as any).values(); }
      [Symbol.iterator]() { return ([] as any)[Symbol.iterator](); }
    })();
  },
}));

// Also attempt to mock Next internal path if present
try {
  require.resolve('next/src/client/components/navigation');
  jest.mock('next/src/client/components/navigation', () => ({
    useRouter() {
      return { push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn() };
    },
  }));
} catch {}



// Silence jsdom canvas getContext error
(() => {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const msg = String(args[0] ?? '');
    if (msg.includes('HTMLCanvasElement.prototype.getContext')) return;
    originalError.call(console, ...args);
  };
})();

// jsdom canvas shim to avoid axe color-contrast getContext error path
(() => {
  const g: any = globalThis as any;
  const Canvas = g.HTMLCanvasElement || (g.window && g.window.HTMLCanvasElement);
  if (Canvas && Canvas.prototype) {
    try {
      Canvas.prototype.getContext = jest.fn(() => ({
        measureText: () => ({ width: 0 }),
      }));
    } catch {}
  }
})();