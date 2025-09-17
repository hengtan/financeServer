import 'reflect-metadata'
import { Container } from 'typedi'

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/financeserver_test?schema=public'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret'
process.env.REDIS_HOST = 'localhost'
process.env.REDIS_PORT = '6379'
process.env.REDIS_DB = '1'

// Mock Redis for tests
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    mget: jest.fn(),
    mset: jest.fn(),
    keys: jest.fn(),
    incrby: jest.fn(),
    hget: jest.fn(),
    hset: jest.fn(),
    expire: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
    memory: jest.fn().mockResolvedValue('1024'),
    quit: jest.fn(),
    on: jest.fn(),
    pipeline: jest.fn(() => ({
      setex: jest.fn(),
      exec: jest.fn().mockResolvedValue([])
    }))
  }))
})

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    account: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    transaction: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    $transaction: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn()
  }))
}))

// Mock BullMQ
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    getWaiting: jest.fn().mockResolvedValue(0),
    getActive: jest.fn().mockResolvedValue(0),
    getCompleted: jest.fn().mockResolvedValue(0),
    getFailed: jest.fn().mockResolvedValue(0),
    getDelayed: jest.fn().mockResolvedValue(0),
    pause: jest.fn(),
    resume: jest.fn(),
    clean: jest.fn(),
    getJob: jest.fn(),
    getFailed: jest.fn().mockResolvedValue([]),
    close: jest.fn()
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn()
  }))
}))

// Mock prom-client
jest.mock('prom-client', () => ({
  register: {
    metrics: jest.fn().mockResolvedValue('# Mock metrics'),
    getMetricsAsJSON: jest.fn().mockResolvedValue([]),
    getMetricsAsArray: jest.fn().mockReturnValue([]),
    getSingleMetric: jest.fn(),
    clear: jest.fn()
  },
  Counter: jest.fn().mockImplementation(() => ({
    inc: jest.fn()
  })),
  Histogram: jest.fn().mockImplementation(() => ({
    observe: jest.fn()
  })),
  Gauge: jest.fn().mockImplementation(() => ({
    set: jest.fn()
  })),
  collectDefaultMetrics: jest.fn()
}))

// Global test utilities
global.mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER',
  status: 'ACTIVE'
}

global.mockAccount = {
  id: 'test-account-id',
  userId: 'test-user-id',
  name: 'Test Account',
  type: 'CHECKING',
  balance: '1000.00',
  currency: 'USD',
  status: 'ACTIVE'
}

global.mockTransaction = {
  id: 'test-transaction-id',
  userId: 'test-user-id',
  description: 'Test Transaction',
  amount: '100.00',
  type: 'EXPENSE',
  categoryId: 'test-category-id',
  accountId: 'test-account-id',
  status: 'COMPLETED'
}

// Clear all containers before each test
beforeEach(() => {
  Container.reset()
  jest.clearAllMocks()
})

// Global error handler for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})