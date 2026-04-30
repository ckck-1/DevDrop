const threadRepo = require("./thread.repository");

class ThreadService {
  async findOrCreateThread(participants) {
    if (!participants || participants.length === 0) {
      throw new Error("Participants required");
    }

    return threadRepo.findOrCreate(participants);
  }

  async getThreads(userId) {
    return threadRepo.getThreadsByUser(userId);
  }

  async getThread(threadId) {
    return threadRepo.getById(threadId);
  }
}

module.exports = new ThreadService();