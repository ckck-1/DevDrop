const developerRepository = require('./developer.repository');
const { addMatchJob } = require('../../queues/ai.queue');
const logger = require('../../utils/logger');

class DeveloperService {
  async getProfile(userId) {
    const profile = await developerRepository.findByUserId(userId);
    if (!profile) {
      logger.debug(`Developer profile not found for userId: ${userId}`);
      throw new Error('Developer profile not found');
    }
    return profile;
  }

  /**
   * Updates profile and triggers AI matching re-calculation
   */
  async updateProfile(userId, updateData) {
    if (updateData.skills && Array.isArray(updateData.skills)) {
      updateData.skills = updateData.skills.map(skill => skill.toLowerCase().trim());
    }

    const profile = await developerRepository.updateByUserId(userId, updateData);
    if (!profile) {
      throw new Error('Failed to update profile: Profile does not exist');
    }

    logger.info(`Developer profile updated: ${profile._id} by user ${userId}`);

    // Trigger AI matching
    await addMatchJob(userId, 'developer');
    return profile;
  }

  async uploadResume(userId, resumeUrl) {
    const profile = await developerRepository.updateByUserId(userId, { resumeUrl });
    logger.info(`Resume uploaded for developer: ${profile._id}`);

    await addMatchJob(userId, 'developer');
    return profile;
  }
}

module.exports = new DeveloperService();