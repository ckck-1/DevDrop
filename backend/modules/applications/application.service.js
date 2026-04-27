const applicationRepository = require('./application.repository');
const jobRepository = require('../jobs/job.repository');
const developerRepository = require('../developers/developer.repository');
const { addEmailJob } = require('../../queues/notification.queue');

class ApplicationService {
  async applyToJob(userId, jobId, applicationData) {
    // 1. Get Developer Profile
    const developer = await developerRepository.findByUserId(userId);
    if (!developer) throw new Error('Developer profile not found');

    // 2. Check Daily Limit (e.g., 10 applications per day)
    if (developer.dailyApplicationCount >= 10) {
      throw new Error('Daily application limit reached');
    }

    // 3. Verify Job exists
    const job = await jobRepository.findById(jobId);
    if (!job) throw new Error('Job does not exist');

    // 4. Create Application
    const application = await applicationRepository.create({
      jobId,
      developerId: developer._id,
      startupId: job.startupId._id,
      ...applicationData
    });

    // 5. Increment Count (Atomic)
    await developerRepository.incrementApplicationCount(developer._id);
    

// Inside applyToJob() function after application is created:
await addEmailJob('NEW_APPLICATION', {
  email: job.startupId.userId.email, // Assuming we populated the startup user email
  developerName: developer.fullName,
  jobTitle: job.title
});

    return application;
  }
}

module.exports = new ApplicationService();