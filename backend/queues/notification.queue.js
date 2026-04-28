const { Queue } = require('bullmq');
const redis = require('../config/redis');

const notificationQueue = new Queue('notifications', {
  connection: redis
});

/**
 * Adds an email job to the queue
 * @param {string} type - e.g., 'WELCOME_EMAIL', 'NEW_APPLICATION'
 * @param {Object} data - { email, name, ...details }
 */
const addEmailJob = async (type, data) => {
  await notificationQueue.add(type, data, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 10000, // Start with 10s delay if it fails
    },
    removeOnComplete: true, // Keep Redis clean
  });
};

module.exports = { addEmailJob };