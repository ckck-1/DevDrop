const Application = require('./application.model');

class ApplicationRepository {
  async create(applicationData) {
    return await Application.create(applicationData);
  }

  async findByJobId(jobId) {
    return await Application.find({ jobId })
      .populate('developerId')
      .sort({ createdAt: -1 });
  }

  async findByDeveloperId(developerId) {
    return await Application.find({ developerId })
      .populate('jobId')
      .sort({ createdAt: -1 });
  }

  async updateStatus(id, startupId, status) {
    return await Application.findOneAndUpdate(
      { _id: id, startupId },
      { status },
      { new: true }
    );
  }
}

module.exports = new ApplicationRepository();