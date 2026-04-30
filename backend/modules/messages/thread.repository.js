// modules/messages/thread.repository.js
const Thread = require("./thread.model");

class ThreadRepository {
  async findOrCreate(jobId, startupId, developerId) {
    let thread = await Thread.findOne({
      jobId,
      startupId,
      developerId,
    });

    if (!thread) {
      thread = await Thread.create({
        jobId,
        startupId,
        developerId,
      });
    }

    return thread;
  }

  async findById(id) {
    return Thread.findById(id);
  }
}

module.exports = new ThreadRepository();