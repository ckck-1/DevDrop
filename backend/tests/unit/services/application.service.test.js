const applicationService = require('../../../modules/applications/application.service');
const applicationRepository = require('../../../modules/applications/application.repository');
const jobRepository = require('../../../jobs/job.repository');
const developerRepository = require('../../../developers/developer.repository');
const startupRepository = require('../../../startups/startup.repository');
const userRepository = require('../../../users/user.repository');
const { addEmailJob } = require('../../../queues/notification.queue');
const logger = require('../../../utils/logger');

// Mock dependencies
jest.mock('../../../modules/applications/application.repository');
jest.mock('../../../jobs/job.repository');
jest.mock('../../../developers/developer.repository');
jest.mock('../../../startups/startup.repository');
jest.mock('../../../users/user.repository');
jest.mock('../../../queues/notification.queue');
jest.mock('../../../utils/logger');

describe('ApplicationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('applyToJob', () => {
    it('should successfully create an application and send notification', async () => {
      const userId = 'user1';
      const jobId = 'job1';
      const developerId = 'dev1';
      const startupId = 'startup1';
      const startupUserId = 'startupUser1';
      const applicationData = { coverLetter: 'Cover letter', resumeSnapshot: 'url' };

      const mockDeveloper = { _id: developerId, fullName: 'Dev Name', dailyApplicationCount: 0 };
      const mockJob = { _id: jobId, title: 'Job Title', startupId: { _id: startupId } };
      const mockStartup = { _id: startupId, userId: startupUserId };
      const mockStartupUser = { email: 'startup@example.com' };
      const mockCreatedApp = { _id: 'app1', jobId, developerId, startupId };

      developerRepository.findByUserId.mockResolvedValue(mockDeveloper);
      jobRepository.findById.mockResolvedValue(mockJob);
      startupRepository.findById.mockResolvedValue(mockStartup);
      userRepository.findById.mockResolvedValue(mockStartupUser);
      applicationRepository.create.mockResolvedValue(mockCreatedApp);
      developerRepository.incrementApplicationCount.mockResolvedValue({});

      const result = await applicationService.applyToJob(userId, jobId, applicationData);

      expect(developerRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(jobRepository.findById).toHaveBeenCalledWith(jobId);
      expect(startupRepository.findById).toHaveBeenCalledWith(startupId);
      expect(userRepository.findById).toHaveBeenCalledWith(startupUserId);
      expect(applicationRepository.create).toHaveBeenCalledWith({
        jobId,
        developerId,
        startupId,
        ...applicationData
      });
      expect(developerRepository.incrementApplicationCount).toHaveBeenCalledWith(developerId);
      expect(addEmailJob).toHaveBeenCalledWith('NEW_APPLICATION', {
        email: mockStartupUser.email,
        developerName: 'Dev Name',
        jobTitle: 'Job Title'
      });
      expect(result).toEqual(mockCreatedApp);
      expect(logger.info).toHaveBeenCalledWith(`Application submitted: app1 by developer ${developerId} for job ${jobId}`);
    });

    it('should throw error if daily limit exceeded', async () => {
      const dailyLimit = process.env.DAILY_APPLICATION_LIMIT ? parseInt(process.env.DAILY_APPLICATION_LIMIT) : 10;
      const mockDeveloper = { _id: 'dev', dailyApplicationCount: dailyLimit };
      developerRepository.findByUserId.mockResolvedValue(mockDeveloper);

      await expect(applicationService.applyToJob('user1', 'job1', {}))
        .rejects.toThrow(`Daily application limit of ${dailyLimit} reached`);
      expect(logger.warn).toHaveBeenCalledWith(`Developer dev exceeded daily application limit`);
    });
  });

  describe('getDeveloperApps', () => {
    it('should return paginated list of applications', async () => {
      const userId = 'user1';
      const developerId = 'dev1';
      const apps = [{ _id: 'app1' }, { _id: 'app2' }];
      const total = 2;

      developerRepository.findByUserId.mockResolvedValue({ _id: developerId });
      applicationRepository.findByDeveloperId.mockResolvedValue(apps);
      applicationRepository.countByDeveloperId.mockResolvedValue(total);

      const result = await applicationService.getDeveloperApps(userId, 1, 10);

      expect(result).toEqual({
        applications: apps,
        pagination: { page: 1, limit: 10, total: 2, pages: 1 }
      });
      expect(logger.debug).toHaveBeenCalledWith(`Developer ${userId} fetched applications page 1`);
    });
  });

  describe('getApplicantsByJob', () => {
    it('should return paginated applicants', async () => {
      const jobId = 'job1';
      const job = { _id: jobId, startupId: 'startup1' };
      const apps = [{ _id: 'app1' }];
      const total = 1;

      jobRepository.findById.mockResolvedValue(job);
      applicationRepository.findByJobId.mockResolvedValue(apps);
      applicationRepository.countByJobId.mockResolvedValue(total);

      const result = await applicationService.getApplicantsByJob(jobId, 1, 20);

      expect(result).toEqual({
        applications: apps,
        pagination: { page: 1, limit: 20, total: 1, pages: 1 }
      });
      expect(logger.info).toHaveBeenCalledWith(`Startup fetched applicants for job ${jobId}`);
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update status if authorized', async () => {
      const appId = 'app1';
      const status = 'accepted';
      const startupId = 'startup1';
      const application = { _id: appId, startupId };

      applicationRepository.findById.mockResolvedValue(application);
      applicationRepository.updateStatus.mockResolvedValue({ ...application, status });

      const result = await applicationService.updateApplicationStatus(appId, status, startupId);

      expect(applicationRepository.updateStatus).toHaveBeenCalledWith(appId, startupId, status);
      expect(result.status).toBe('accepted');
      expect(logger.info).toHaveBeenCalledWith(`Application ${appId} status updated to ${status} by startup ${startupId}`);
    });

    it('should throw if unauthorized', async () => {
      const appId = 'app1';
      const startupId = 'startup1';
      applicationRepository.findById.mockResolvedValue({ _id: appId, startupId: 'otherStartup' });

      await expect(applicationService.updateApplicationStatus(appId, 'accepted', startupId))
        .rejects.toThrow('Not authorized to update this application');
      expect(logger.warn).toHaveBeenCalledWith(`Unauthorized status update attempt: app1 by startup ${startupId}`);
    });
  });
});