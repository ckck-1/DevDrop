// backend/services/application.service.js
const applicationRepository = require('./application.repository');
const jobRepository = require('../jobs/job.repository');
const developerRepository = require('../developers/developer.repository');
const startupRepository = require('../startups/startup.repository');
const userRepository = require('../users/user.repository');
const messageService = require('../messages/message.service'); // Ensure this is imported
const { addEmailJob } = require('../../queues/notification.queue');
const logger = require('../../utils/logger');

class ApplicationService {
  async applyToJob(userId, jobId, applicationData) {
    const developer = await developerRepository.findByUserId(userId);
    if (!developer) throw new Error('Developer profile not found');

    const job = await jobRepository.findById(jobId);
    if (!job) throw new Error('Job does not exist');

    const startup = await startupRepository.findById(job.startupId._id);
    if (!startup) throw new Error('Startup not found');

    const startupUser = await userRepository.findById(startup.userId);
    if (!startupUser) throw new Error('Startup user not found');

    // 1. Create/Find Message Thread automatically
    const thread = await messageService.createOrGetThread({
      jobId,
      developerId: developer._id,
      startupId: startup._id,
      // Optional: send an initial automated message
      initialMessage: `Application submitted for ${job.title}`
    });

    // 2. Create Application with threadId linked
    const application = await applicationRepository.create({
      jobId,
      developerId: developer._id,
      startupId: startup._id,
      threadId: thread._id, 
      ...applicationData
    });

    await developerRepository.incrementApplicationCount(developer._id);
    
    await addEmailJob('NEW_APPLICATION', {
      email: startupUser.email,
      developerName: developer.fullName,
      jobTitle: job.title
    });

    return application;
  }

  // ... rest of your methods (getDeveloperApps, etc.)
}

module.exports = new ApplicationService();