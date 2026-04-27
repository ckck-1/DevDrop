const Startup = require('./startup.model');

class StartupRepository {
  async create(startupData) {
    return await Startup.create(startupData);
  }

  async findByUserId(userId) {
    return await Startup.findOne({ userId });
  }

  async deductCredit(startupId) {
    return await Startup.findOneAndUpdate(
      { _id: startupId, contactCredits: { $gt: 0 } },
      { $inc: { contactCredits: -1 } },
      { new: true }
    );
  }

  async addCredits(startupId, amount) {
    return await Startup.findByIdAndUpdate(
      startupId,
      { $inc: { contactCredits: amount } },
      { new: true }
    );
  }
}

module.exports = new StartupRepository();