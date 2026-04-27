const Developer = require('./developer.model');

class DeveloperRepository {
  async create(devData) {
    return await Developer.create(devData);
  }

  async findByUserId(userId) {
    return await Developer.findOne({ userId });
  }

  async updateByUserId(userId, updateData) {
    return await Developer.findOneAndUpdate({ userId }, updateData, {
      new: true,
    });
  }

  // Atomic increment for daily limits
  async incrementApplicationCount(developerId) {
    return await Developer.findByIdAndUpdate(
      developerId,
      { $inc: { dailyApplicationCount: 1 } },
      { new: true }
    );
  }

  async resetAllDailyLimits() {
    return await Developer.updateMany({}, { $set: { dailyApplicationCount: 0 } });
  }

  // Used by AI Matching Service
  async findActiveBySkills(skills) {
    return await Developer.find({
      skills: { $in: skills },
      availability: 'available'
    });
  }
}

module.exports = new DeveloperRepository();