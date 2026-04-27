const { Worker } = require('bullmq');
const { redis } = require('../config/redis');
const matchingService = require('../modules/ai/matching.service');
const logger = require('../utils/logger');

const aiWorker = new Worker('ai-matching', async (job) => {
  const { userId, type } = job.data;
  
  logger.info(`Processing AI Match for ${type}: ${userId}`);

  if (type === 'developer') {
    await matchingService.matchDevToJobs(userId);
  }
  // Add startup logic here later
  
}, { connection: redis });

aiWorker.on('completed', (job) => {
  logger.info(`Match Job ${job.id} completed successfully`);
});

aiWorker.on('failed', (job, err) => {
  logger.error(`Match Job ${job.id} failed: ${err.message}`);
});

module.exports = aiWorker;