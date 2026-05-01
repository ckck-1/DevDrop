const Application = require('./application.model');

class ApplicationRepository {
  async create(applicationData) {
    return await Application.create(applicationData);
  }

  async findByJobId(jobId, pagination = {}) {
    const { skip = 0, limit = 20 } = pagination;
    return await Application.find({ jobId })
      .populate('developerId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countByJobId(jobId) {
    return await Application.countDocuments({ jobId });
  }

  async findByDeveloperId(developerId, pagination = {}) {
  const { skip = 0, limit = 20 } = pagination;
  return await Application.find({ developerId })
    .populate({
      path: 'jobId',
      populate: { path: 'startupId', select: 'companyName logoUrl' } // Deep populate for the UI
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

  async countByDeveloperId(developerId) {
    return await Application.countDocuments({ developerId });
  }

  async updateStatus(id, startupId, status) {
    return await Application.findOneAndUpdate(
      { _id: id, startupId },
      { status },
      { new: true }
    );
  }

  async findById(id) {
    return await Application.findById(id);
  }
}

module.exports = new ApplicationRepository();