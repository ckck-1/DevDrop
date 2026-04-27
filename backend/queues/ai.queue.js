const { Queue } = require('bullmq');
const { redis } = require('../config/redis');

const aiQueue = new Queue('ai-matching', {
  connection: redis
});

const addMatchJob = async (userId, type) => {
  await aiQueue.add('analyze-match', { userId, type }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 }
  });
};

module.exports = { aiQueue, addMatchJob };