require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');
const redis = require('./config/redis');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// 🧠 Validate critical env early (prevents silent crashes)
if (!process.env.MONGO_URI) {
  logger.error('❌ MONGO_URI is missing in .env');
  process.exit(1);
}







const startServer = async () => {
  try {
    console.log('⚡ Starting server...');

    // 1. Connect MongoDB (BLOCKING - MUST succeed)
    await connectDB();
    console.log('✅ MongoDB Connected');

    // 2. Start Express server ASAP after DB is ready
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // 3. Redis (NON-BLOCKING, safe init)
    if (redis && typeof redis.on === 'function') {
      redis.on('connect', () => {
        console.log('🔌 Redis connecting...');
      });

      redis.on('ready', () => {
        console.log('⚡ Redis ready');
      });

      redis.on('error', (err) => {
        console.log('❌ Redis error:', err.message);
      });
    } else {
      console.log('⚠️ Redis not initialized properly (skipping)');
    }

    // 4. Graceful shutdown
    const shutdown = () => {
      logger.info('👋 Shutdown signal received... closing server');

      server.close(() => {
        logger.info('💤 HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();