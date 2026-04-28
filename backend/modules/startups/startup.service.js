const startupRepository = require('./startup.repository');
const logger = require('../../utils/logger');

class StartupService {
  async getStartupByUserId(userId) {
    const startup = await startupRepository.findByUserId(userId);
    if (!startup) {
      logger.debug(`Startup profile not found for userId: ${userId}`);
      throw new Error('Startup profile not found');
    }
    return startup;
  }

  async updateStartupProfile(userId, updateData) {
    const startup = await startupRepository.findByUserId(userId);
    if (!startup) throw new Error('Startup profile not found');

    const updatedStartup = await startupRepository.update(startup._id, updateData);
    logger.info(`Startup profile updated: ${startup._id} by user ${userId}`);
    return updatedStartup;
  }

  async getStartupById(id) {
    const startup = await startupRepository.findById(id);
    if (!startup) throw new Error('Startup not found');
    return startup;
  }
}

module.exports = new StartupService();