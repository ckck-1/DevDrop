const { Worker } = require('bullmq');
const { redis } = require('../config/redis');
const notificationService = require('../modules/notifications/notification.service');
const logger = require('../utils/logger');

const notificationWorker = new Worker('notifications', async (job) => {
  const { type, data } = job;
  logger.info(`Processing Email Job: ${job.name} for ${job.data.email}`);

  switch (job.name) {
    case 'WELCOME_EMAIL':
      await notificationService.sendWelcomeEmail(job.data.email, job.data.name);
      break;
    
    case 'NEW_APPLICATION':
      await notificationService.sendApplicationAlert(
        job.data.email, 
        job.data.developerName, 
        job.data.jobTitle
      );
      break;
    case 'VERIFICATION_EMAIL':
      await notificationService.sendVerificationEmail(
        job.data.email, 
        job.data.verificationUrl
      );
      break;

    default:
      logger.warn(`Unknown job type: ${job.name}`);
  }
}, { connection: redis });

notificationWorker.on('failed', (job, err) => {
  logger.error(`Email Job ${job.id} failed: ${err.message}`);
});

module.exports = notificationWorker;