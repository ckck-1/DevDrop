const threadRepo = require("./thread.repository");

class ThreadService {
  async getUserThreads(userId) {
    return threadRepo.findUserThreads(userId);
  }

  async findOrCreateThread(participants) {
    return threadRepo.findOrCreate(participants);
  }

  async getThreadById(id) {
    return threadRepo.findById(id);
  }
}

module.exports = new ThreadService();