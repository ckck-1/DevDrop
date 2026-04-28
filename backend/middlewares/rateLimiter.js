const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redis = require('../config/redis');
const logger = require('../utils/logger');

// Fallback memory limiter
const fallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Middleware function that dynamically checks Redis status per request
const limiter = async (req, res, next) => {
  // 'ready' means successfully connected to Redis
  if (redis && redis.status === 'ready') {
    const redisLimiter = rateLimit({
      store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
      }),
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    });
    return redisLimiter(req, res, next);
  } else {
    // If Redis is connecting, down, or failed, use memory
    return fallbackLimiter(req, res, next);
  }
};

module.exports = limiter;