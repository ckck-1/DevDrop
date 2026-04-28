const applicationRepository = require('./application.repository');
const jobRepository = require('../jobs/job.repository');
const developerRepository = require('../developers/developer.repository');
const startupRepository = require('../startups/startup.repository');
const userRepository = require('../users/user.repository');
const { addEmailJob } = require('../../queues/notification.queue');
const logger = require('../../utils/logger');

class ApplicationService {
  async applyToJob(userId, jobId, applicationData) {
    // 1. Get Developer Profile
    const developer = await developerRepository.findByUserId(userId);
    if (!developer) throw new Error('Developer profile not found');

    // 2. Check Daily Limit
    const dailyLimit = process.env.DAILY_APPLICATION_LIMIT
      ? parseInt(process.env.DAILY_APPLICATION_LIMIT)
      : 10;
    if (developer.dailyApplicationCount >= dailyLimit) {
      logger.warn(`Developer ${developer._id} exceeded daily application limit`);
      throw new Error(`Daily application limit of ${dailyLimit} reached`);
    }

    // 3. Verify Job exists
    const job = await jobRepository.findById(jobId);
    if (!job) throw new Error('Job does not exist');

    // 4. Get startup's user email
    const startup = await startupRepository.findById(job.startupId._id);
    if (!startup) throw new Error('Startup not found');

    const startupUser = await userRepository.findById(startup.userId);
    if (!startupUser) throw new Error('Startup user not found');

    // 5. Create Application
    const application = await applicationRepository.create({
      jobId,
      developerId: developer._id,
      startupId: startup._id,
      ...applicationData
    });
    logger.info(`Application submitted: ${application._id} by developer ${developer._id} for job ${jobId}`);

    // 6. Increment Count
    await developerRepository.incrementApplicationCount(developer._id);

    // 7. Queue notification
    await addEmailJob('NEW_APPLICATION', {
      email: startupUser.email,
      developerName: developer.fullName,
      jobTitle: job.title
    });

    return application;
  }

  async getDeveloperApps(userId, page = 1, limit = 10) {
    const developer = await developerRepository.findByUserId(userId);
    if (!developer) throw new Error('Developer profile not found');

    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
      applicationRepository.findByDeveloperId(developer._id, { skip, limit }),
      applicationRepository.countByDeveloperId(developer._id)
    ]);

    logger.debug(`Developer ${userId} fetched applications page ${page}`);
    return {
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getApplicantsByJob(jobId, page = 1, limit = 20) {
    const job = await jobRepository.findById(jobId);
    if (!job) throw new Error('Job not found');

    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
      applicationRepository.findByJobId(job._id, { skip, limit }),
      applicationRepository.countByJobId(job._id)
    ]);

    logger.info(`Startup fetched applicants for job ${jobId}`);
    return {
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateApplicationStatus(applicationId, status, startupId) {
    const application = await applicationRepository.findById(applicationId);
    if (!application) throw new Error('Application not found');
    if (application.startupId.toString() !== startupId.toString()) {
      logger.warn(`Unauthorized status update attempt: application ${applicationId} by startup ${startupId}`);
      throw new Error('Not authorized to update this application');
    }

    const updated = await applicationRepository.updateStatus(applicationId, startupId, status);
    logger.info(`Application ${applicationId} status updated to ${status} by startup ${startupId}`);
    return updated;
  }
}

module.exports = new ApplicationService();