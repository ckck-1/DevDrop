const developerRepository = require('./developer.repository');
const { addMatchJob } = require('../../queues/ai.queue');

class DeveloperService {
  /**
   * Retrieves a developer profile by User ID
   */
  async getProfile(userId) {
    const profile = await developerRepository.findByUserId(userId);
    if (!profile) throw new Error('Developer profile not found');
    return profile;
  }

  /**
   * Updates profile and triggers AI matching re-calculation
   */
  async updateProfile(userId, updateData) {
    // 1. Data Normalization: Ensure skills are uniform for AI processing
    if (updateData.skills && Array.isArray(updateData.skills)) {
      updateData.skills = updateData.skills.map(skill => 
        skill.toLowerCase().trim()
      );
    }

    // 2. Persistence: Update the database via Repository
    const profile = await developerRepository.updateByUserId(userId, updateData);
    
    if (!profile) {
      throw new Error('Failed to update profile: Profile does not exist');
    }
    
    // 3. Async Background Task: Trigger Mistral AI matching
    // We pass the userId and role to the BullMQ queue
    await addMatchJob(userId, 'developer');
    
    return profile;
  }

  /**
   * Specifically handles resume URL updates
   */
  async uploadResume(userId, resumeUrl) {
    const profile = await developerRepository.updateByUserId(userId, { resumeUrl });
    
    // Re-trigger matching as the resume might contain new context
    await addMatchJob(userId, 'developer');
    
    return profile;
  }
}

module.exports = new DeveloperService();