import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { EventBus } from '../src/index.ts';
import type { JetStreamClient, JetStreamManager, NatsConnection } from 'nats';

jest.mock('nats', () => ({
  connect: jest.fn(),
}));

jest.mock('../src/validator.js', () => ({
  eventValidator: {
    validateEvent: jest.fn(),
    getCacheStatus: jest.fn().mockReturnValue({}),
  },
}), { virtual: true });

jest.mock('../src/config.js', () => ({
  nanos: jest.fn(),
  getStreamConfigs: jest.fn().mockReturnValue([]),
  getStreamMode: jest.fn().mockReturnValue('managed'),
  getStreamCandidates: jest.fn().mockReturnValue([]),
  AppStreamConfig: {},
}), { virtual: true });

jest.mock('@athlete-ally/contracts', () => ({
  EVENT_TOPICS: {},
}), { virtual: true });

jest.mock('prom-client', () => ({
  register: {
    registerMetric: jest.fn(),
    metrics: jest.fn().mockResolvedValue(''),
  },
  Counter: jest.fn().mockImplementation(() => ({
    inc: jest.fn(),
  })),
  Histogram: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
  })),
}));

jest.mock('@athlete-ally/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@athlete-ally/logger/server', () => ({}));

describe('EventBus typed getters', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it('throws when EventBus is not connected', () => {
    expect(() => bus.getNatsConnection()).toThrow(/EventBus not connected/);
    expect(() => bus.getJetStream()).toThrow(/EventBus not connected/);
    expect(() => bus.getJetStreamManager()).toThrow(/EventBus not connected/);
  });

  it('returns typed instances once internal clients are assigned', () => {
    const fakeNc = {} as NatsConnection;
    const fakeJs = {} as JetStreamClient;
    const fakeJsm = {} as JetStreamManager;

    // Access private members via cast for test purposes
    (bus as unknown as { nc: NatsConnection | null }).nc = fakeNc;
    (bus as unknown as { js: JetStreamClient | null }).js = fakeJs;
    (bus as unknown as { jsm: JetStreamManager | null }).jsm = fakeJsm;

    expect(bus.getNatsConnection()).toBe(fakeNc);
    expect(bus.getJetStream()).toBe(fakeJs);
    expect(bus.getJetStreamManager()).toBe(fakeJsm);
  });
});
