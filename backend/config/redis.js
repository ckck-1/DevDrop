const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;
const MAX_RETRIES = 3; // Stop trying after 3 attempts

const redisOptions = {
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
  retryStrategy: (times) => {
    if (times > MAX_RETRIES) {
      logger.warn('⚠️ Redis connection attempts exhausted. Giving up.');
      return null; // Returning null stops ioredis from retrying
    }
    return Math.min(times * 200, 3000);
  },
};

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, redisOptions);
  logger.info('🔌 Redis configured for cloud mode');
} else {
  redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    ...redisOptions
  });
  logger.info('🔌 Redis configured for local mode');
}

redis.on('ready', () => logger.info('✅ Redis ready'));

redis.on('error', (err) => {
  // We just log the error here. 
  // The retryStrategy handles the actual fallback logic.
  logger.error(`❌ Redis error: ${err.message}`);
});

// If Redis permanently fails to connect, its status becomes 'end'
redis.on('end', () => {
  logger.warn('⚠️ Redis disconnected permanently. Running in degraded mode.');
});

module.exports = redis;