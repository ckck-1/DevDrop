// Mock redis before importing anything else
const mockRedis = {
  get: jest.fn(),
  setex: jest.fn().mockResolvedValue('OK'),
  keys: jest.fn().mockResolvedValue(['key1']),
  del: jest.fn(),
};
jest.mock('../../../config/redis', () => mockRedis);

const jobService = require('../../../modules/jobs/job.service');
const jobRepository = require('../../../modules/jobs/job.repository');
const startupRepository = require('../../../startups/startup.repository');
const logger = require('../../../utils/logger');
const redis = require('../../../config/redis'); // Get reference to mocked redis

jest.mock('../../../modules/jobs/job.repository');
jest.mock('../../../startups/startup.repository');
jest.mock('../../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('JobService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('postJob', () => {
    it('should create a job and clear cache', async () => {
      const userId = 'startupUser1';
      const startup = { _id: 'startup1', companyName: 'TestCo' };
      const jobData = { title: 'Engineer', description: 'Build stuff', techStack: ['node'] };
      const createdJob = { ...jobData, _id: 'job1', startupId: startup._id };

      startupRepository.findByUserId.mockResolvedValue(startup);
      jobRepository.create.mockResolvedValue(createdJob);
      redis.keys.mockResolvedValue(['key1']);
      redis.del.mockResolvedValue(1);

      const result = await jobService.postJob(userId, jobData);

      expect(startupRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(jobRepository.create).toHaveBeenCalledWith({
        ...jobData,
        startupId: startup._id,
      });
      expect(redis.del).toHaveBeenCalledWith(['key1']);
      expect(logger.info).toHaveBeenCalledWith(`Job created: job1 by startup ${startup._id}`);
      expect(result).toEqual(createdJob);
    });

    it('should throw error if startup profile not found', async () => {
      startupRepository.findByUserId.mockResolvedValue(null);
      await expect(jobService.postJob('user', {}))
        .rejects.toThrow('Startup profile not found');
    });
  });

  describe('getJobFeed', () => {
    it('should serve from cache when available', async () => {
      const cached = [{ _id: 'job1' }];
      redis.get.mockResolvedValue(JSON.stringify(cached));

      const result = await jobService.getJobFeed({});

      expect(redis.get).toHaveBeenCalledWith(expect.stringMatching(/jobs:feed:p1:l20/));
      expect(result.jobs).toEqual(cached);
      expect(result.pagination).toBeDefined();
      expect(logger.info).toHaveBeenCalledWith('Serving Jobs from Cache');
    });

    it('should fetch from DB and cache when not in cache', async () => {
      const jobs = [{ _id: 'job1' }];
      jobRepository.findAll.mockResolvedValue(jobs);
      jobRepository.countOpenJobs.mockResolvedValue(5);
      redis.get.mockResolvedValue(null);

      const result = await jobService.getJobFeed({});

      expect(jobRepository.findAll).toHaveBeenCalled();
      expect(redis.setex).toHaveBeenCalledWith(expect.any(String), 300, JSON.stringify(jobs));
      expect(result).toEqual({
        jobs,
        pagination: { page: 1, limit: 20, total: 5, pages: 1 }
      });
    });
  });

  describe('getJobById', () => {
    it('should return job by id', async () => {
      const job = { _id: 'job1', title: 'Dev' };
      jobRepository.findById.mockResolvedValue(job);

      const result = await jobService.getJobById('job1');

      expect(jobRepository.findById).toHaveBeenCalledWith('job1');
      expect(result).toEqual(job);
    });
  });
});