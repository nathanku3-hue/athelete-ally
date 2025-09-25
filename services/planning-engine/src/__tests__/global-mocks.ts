// Global mocks for planning-engine tests
// This file is loaded before all tests to provide consistent mocking

// Common Prisma mock structure
const createPrismaMock = () => ({
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  trainingPlan: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  jobStatus: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
});

// Mock Prisma client to avoid initialization in unit tests
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => createPrismaMock()),
}));

// Mock database module with ESM virtual mock for all import paths
const mockPrisma = createPrismaMock();

// Mock all possible db.js import paths
jest.mock('../db.js', () => ({ prisma: mockPrisma }), { virtual: true });
jest.mock('./db.js', () => ({ prisma: mockPrisma }), { virtual: true });

// Mock Redis client
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    disconnect: jest.fn(),
  }));
});

// Mock NATS client
jest.mock('nats', () => ({
  connect: jest.fn().mockResolvedValue({
    jetstream: jest.fn().mockReturnValue({
      consumers: {
        create: jest.fn().mockResolvedValue({
          consume: jest.fn().mockReturnValue({
            [Symbol.asyncIterator]: jest.fn().mockReturnValue({
              next: jest.fn().mockResolvedValue({ done: true }),
            }),
          }),
        }),
      },
    }),
    close: jest.fn(),
  }),
}));
