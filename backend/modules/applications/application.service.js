// backend/services/application.service.js
const applicationRepository = require('./application.repository');
const jobRepository = require('../jobs/job.repository');
const developerRepository = require('../developers/developer.repository');
const startupRepository = require('../startups/startup.repository');
const userRepository = require('../users/user.repository');
const messageService = require('../messages/message.service'); 
const { addEmailJob } = require('../../queues/notification.queue');
const logger = require('../../utils/logger');

class ApplicationService {
  async applyToJob(userId, jobId, applicationData) {
    // 1. Get Developer Profile
    const developer = await developerRepository.findByUserId(userId);
    if (!developer) throw new Error('Developer profile not found');

    // 2. Verify Job exists and get the associated Startup
    const job = await jobRepository.findById(jobId);
    if (!job) throw new Error('Job does not exist');

    // Safely extract startupId whether jobId is populated or not
    const startupId = job.startupId._id || job.startupId; 
    
    const startup = await startupRepository.findById(startupId);
    if (!startup) throw new Error('Startup not found');

    const startupUser = await userRepository.findById(startup.userId);
    if (!startupUser) throw new Error('Startup user not found');

    // 3. Create/Find Message Thread automatically
    // We do this BEFORE application creation to ensure we have the threadId
    const thread = await messageService.createOrGetThread({
      jobId: job._id,
      developerId: developer._id,
      startupId: startup._id,
      initialMessage: `System: Application submitted for ${job.title}`
    });

    // 4. Create Application with threadId linked
    const application = await applicationRepository.create({
      jobId: job._id,
      developerId: developer._id,
      startupId: startup._id,
      threadId: thread._id, 
      coverLetter: applicationData.coverLetter,
      resumeSnapshot: applicationData.resumeSnapshot
    });

    // 5. Update counts and notify
    await developerRepository.incrementApplicationCount(developer._id);
    
    await addEmailJob('NEW_APPLICATION', {
      email: startupUser.email,
      developerName: developer.fullName,
      jobTitle: job.title
    }).catch(err => logger.error("Email Queue Error:", err));

    return application;
  }
}

module.exports = new ApplicationService();