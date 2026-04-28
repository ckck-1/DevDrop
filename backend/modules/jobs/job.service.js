const jobRepository = require('./job.repository');
const startupRepository = require('../startups/startup.repository');
const redis = require('../../config/redis');
const logger = require('../../utils/logger');

class JobService {
  async postJob(userId, jobData) {
    const startup = await startupRepository.findByUserId(userId);
    if (!startup) throw new Error('Startup profile not found');

    const job = await jobRepository.create({
      ...jobData,
      startupId: startup._id
    });

    logger.info(`Job created: ${job._id} by startup ${startup._id}`);

    // Invalidate Job Feed Cache
    await this.clearJobCache();

    return job;
  }

  async getJobFeed(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;
    const cacheKey = `jobs:feed:p${page}:l${limit}`;

    // 1. Try Cache First
    const cachedJobs = await redis.get(cacheKey);
    if (cachedJobs) {
      logger.info('Serving Jobs from Cache');
      const jobs = JSON.parse(cachedJobs);
      const total = await jobRepository.countOpenJobs();
      return {
        jobs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      };
    }

    // 2. Database Fallback
    const [jobs, total] = await Promise.all([
      jobRepository.findAll({}, { skip, limit }),
      jobRepository.countOpenJobs()
    ]);

    // 3. Set Cache (Expires in 5 minutes)
    await redis.setex(cacheKey, 300, JSON.stringify(jobs));

    return {
      jobs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async clearJobCache() {
    const keys = await redis.keys('jobs:feed:*');
    if (keys.length > 0) await redis.del(keys);
  }

  async getJobById(id) {
    return await jobRepository.findById(id);
  }
}

module.exports = new JobService();