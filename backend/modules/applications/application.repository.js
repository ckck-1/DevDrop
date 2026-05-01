const Application = require('./application.model');

class ApplicationRepository {
  // ========================
  // CORE CRUD
  // ========================

  async create(applicationData) {
    return await Application.create(applicationData);
  }

  async findById(id) {
    return await Application.findById(id);
  }

  async find(query) {
    return Application.find(query);
  }

  // ========================
  // JOB BASED
  // ========================

  async findByJobId(jobId, pagination = {}) {
    const { skip = 0, limit = 20 } = pagination;

    return Application.find({ jobId })
      .populate('developerId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countByJobId(jobId) {
    return Application.countDocuments({ jobId });
  }

  // ========================
  // DEVELOPER BASED
  // ========================

  async findByDeveloperId(developerId, pagination = {}) {
    const { skip = 0, limit = 20 } = pagination;

    return Application.find({ developerId })
      .populate('jobId')
      .populate('threadId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countByDeveloperId(developerId) {
    return Application.countDocuments({ developerId });
  }

  // ========================
  // STATUS UPDATE
  // ========================

  async updateStatus(id, startupId, status) {
    return Application.findOneAndUpdate(
      { _id: id, startupId },
      { status },
      { new: true }
    );
  }

  // ========================
  // 🔥 ADD THIS (FIXES YOUR ERROR)
  // ========================

  async countDocuments(query) {
    return Application.countDocuments(query);
  }
}

module.exports = new ApplicationRepository();