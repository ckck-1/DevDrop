const Redis = require('ioredis');
const logger = require('../utils/logger');

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => logger.info('Redis Connected'));
redis.on('error', (err) => logger.error('Redis Error:', err));

const connectRedis = async () => {
  // ioredis connects automatically, but we can ping to verify
  await redis.ping();
};

module.exports = { redis, connectRedis };