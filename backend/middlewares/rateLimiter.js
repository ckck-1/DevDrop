const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redis = require('../config/redis'); 

const limiter = rateLimit({
  store: new RedisStore({
    // Standard setup for ioredis (your config)
    sendCommand: (...args) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  // Ensure the handler explicitly calls next if needed, 
  // though express-rate-limit usually handles this.
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: options.message,
    });
  },
});

module.exports = limiter;