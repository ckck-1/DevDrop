const { Queue } = require('bullmq');
// FIX: Remove the curly braces around redis
const redis = require('../config/redis'); 

const aiQueue = new Queue('ai-matching', {
  connection: redis
});

const addMatchJob = async (userId, type) => {
  try {
    await aiQueue.add('analyze-match', { userId, type }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    });
    console.log(`🚀 AI Match Job added for user: ${userId}`);
  } catch (error) {
    console.error('❌ Failed to add job to AI Queue:', error.message);
  }
};

module.exports = { aiQueue, addMatchJob };