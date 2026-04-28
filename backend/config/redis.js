const Redis = require('ioredis');
// We call config here again just to be 100% sure the vars are loaded for this module
require('dotenv').config(); 

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.error('❌ CRITICAL: REDIS_URL is missing from .env file!');
    process.exit(1);
}

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null, 
  // This 'tls' block is what fixes the "SSL alert number 80" error
  tls: {
    rejectUnauthorized: false 
  }
});

redis.on('connect', () => {
  console.log('✅ Connected to Upstash Redis (Cape Town)');
});

redis.on('error', (err) => {
  // Check if we are still hitting localhost
  if (err.message.includes('127.0.0.1')) {
     console.error('❌ Error: Application is still trying to connect to localhost instead of Cloud Redis!');
  } else {
     console.error('❌ Redis Connection Error:', err.message);
  }
});

module.exports = redis;