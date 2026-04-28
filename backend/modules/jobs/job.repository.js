const Job = require('./job.model');

class JobRepository {
  async create(jobData) {
    return await Job.create(jobData);
  }

  async findById(id) {
    return await Job.findById(id).populate('startupId', 'companyName logoUrl');
  }

  async findAll(filter = {}, pagination = { skip: 0, limit: 20 }) {
    return await Job.find({ ...filter, status: 'open' })
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('startupId', 'companyName logoUrl');
  }

  async countOpenJobs() {
    return await Job.countDocuments({ status: 'open' });
  }

  async update(id, startupId, updateData) {
    // Ensure only the owner startup can update
    return await Job.findOneAndUpdate(
      { _id: id, startupId },
      updateData,
      { new: true }
    );
  }

  async delete(id, startupId) {
    return await Job.findOneAndDelete({ _id: id, startupId });
  }
}

module.exports = new JobRepository();