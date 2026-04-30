// // Jest test setup
// // Mock environment variables
// process.env.NODE_ENV = 'test';
// process.env.JWT_SECRET = 'test_jwt_secret';
// process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
// process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
// process.env.REFRESH_TOKEN_EXPIRY_DAYS = '1';
// process.env.MONGO_URI = 'mongodb://localhost:27017/test-db';
// // process.env.REDIS_URL = 'redis://localhost:6379';
// process.env.MISTRAL_API_KEY = 'test_mistral_key';
// process.env.STRIPE_SECRET_KEY = 'sk_test_...';
// process.env.STRIPE_WEBHOOK_SECRET = 'whsec_...';
// process.env.EMAIL_HOST = 'smtp.test.com';
// process.env.EMAIL_PORT = '587';
// process.env.EMAIL_USER = 'test';
// process.env.EMAIL_PASS = 'test';
// process.env.EMAIL_FROM = 'test@test.com';
// process.env.CLIENT_URL = 'http://localhost:3000';
// process.env.DAILY_APPLICATION_LIMIT = '10';

// // Increase timeout for async operations
// jest.setTimeout(10000);

// // Mock Winston logger
// jest.mock('../utils/logger', () => ({
//   info: jest.fn(),
//   error: jest.fn(),
//   warn: jest.fn(),
//   debug: jest.fn(),
// }));

// // Mock Redis
// jest.mock('ioredis', () => {
//   return jest.fn().mockImplementation(() => ({
//     get: jest.fn(),
//     set: jest.fn(),
//     setex: jest.fn(),
//     del: jest.fn(),
//     connect: jest.fn(),
//     disconnect: jest.fn(),
//     on: jest.fn(),
//   }));
// });

// // Mock BullMQ queues
// jest.mock('bullmq', () => ({
//   Queue: jest.fn().mockImplementation(() => ({
//     add: jest.fn().mockResolvedValue({}),
//   })),
//   Worker: jest.fn().mockImplementation(() => ({
//     run: jest.fn(),
//     on: jest.fn(),
//   })),
// }));

// // Global before/after hooks could go here
// global.beforeAll(async () => {
//   // Setup can go here (e.g., connect to in-memory DB)
// });

// global.afterAll(async () => {
//   // Cleanup
// });