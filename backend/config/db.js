const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
let retryCount = 0;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    retryCount = 0; // Reset on success
    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB Connection Error: ${error.message}`);

    // Check for specific IP whitelist error
    if (error.message.includes('IP whitelist') || error.message.includes('authorized')) {
      logger.error('⚠️  ACTION REQUIRED: Add your IP to MongoDB Atlas IP Whitelist');
      logger.error('   Go to: https://cloud.mongodb.com/v2/#/atlas/security/ip-access-list');
      logger.error('   Or temporarily set: 0.0.0.0/0 (not recommended for production)');
    }

    retryCount++;

    if (retryCount < MAX_RETRIES) {
      logger.info(`🔄 Retrying MongoDB connection in ${retryCount * 2}s... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
      return connectDB();
    } else {
      logger.error('💥 MongoDB connection failed after maximum retries. Exiting...');
      process.exit(1);
    }
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
  process.exit(0);
});

module.exports = { connectDB };