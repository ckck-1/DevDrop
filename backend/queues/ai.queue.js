const { Queue } = require('bullmq');
const redis = require('../config/redis');
const logger = require('../utils/logger');

const aiQueue = new Queue('ai-matching', {
  connection: redis,
  // ADD THESE TO PREVENT THE HANG:
  sharedConnection: true, 
  skipCheck: true 
});

const addMatchJob = async (userId, type) => {
  try {
    await aiQueue.add('analyze-match', { userId, type }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    });
    logger.info(`🚀 AI Match Job added for user: ${userId}`);
  } catch (error) {
    logger.error('❌ Failed to add job to AI Queue:', error.message);
  }
};

module.exports = { aiQueue, addMatchJob };