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

  async getDeveloperApps(userId, page = 1, limit = 10) {
  // 1. Get developer profile
  const developer = await developerRepository.findByUserId(userId);
  if (!developer) throw new Error("Developer profile not found");

  // 2. Pagination setup
  const skip = (page - 1) * limit;

  // 3. Fetch applications
  const applications = await applicationRepository
    .find({ developerId: developer._id })
    .populate("jobId") // job details
    .populate("startupId") // startup details
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // 4. Count total
  const total = await applicationRepository.countDocuments({
    developerId: developer._id,
  });

  // 5. Format response (VERY IMPORTANT for frontend)
  const formatted = applications.map((app) => ({
    _id: app._id,
    jobId: app.jobId?._id,
    jobTitle: app.jobId?.title,
    company: app.startupId?.name,
    companyLogo: app.startupId?.logo || "🏢",
    coverLetter: app.coverLetter,
    status: app.status,
    appliedAt: app.createdAt,
    threadId: app.threadId,
  }));

  return {
    applications: formatted,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}
}

module.exports = new ApplicationService();