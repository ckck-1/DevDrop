const { Worker } = require('bullmq');
// FIX: Change { redis } to redis
const redis = require('../config/redis'); 
const matchingService = require('./matching.service'); // Check this path too
const logger = require('../../utils/logger');

const aiWorker = new Worker('ai-matching', async (job) => {
  const { userId, type } = job.data;
  
  logger.info(`Processing AI Match for ${type}: ${userId}`);

  if (type === 'developer') {
    await matchingService.matchDevToJobs(userId);
  }
  
}, { 
  connection: redis // Now this will correctly use your Upstash Cloud Redis
});

aiWorker.on('completed', (job) => {
  logger.info(`Match Job ${job.id} completed successfully`);
});

aiWorker.on('failed', (job, err) => {
  logger.error(`Match Job ${job.id} failed: ${err.message}`);
});

module.exports = aiWorker;