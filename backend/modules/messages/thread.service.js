const Thread = require("./thread.model");

class ThreadService {
  async findOrCreateThread({ jobId, userId, recruiterId, userMeta }) {
    let thread = await Thread.findOne({
      jobId,
      "participants.userId": { $all: [userId, recruiterId] },
    });

    if (!thread) {
      thread = await Thread.create({
        jobId,
        participants: [
          {
            userId,
            name: userMeta?.name || "Unknown",
            avatar: userMeta?.avatar || "",
            role: "candidate",
          },
          {
            userId: recruiterId,
            role: "recruiter",
          },
        ],
      });
    }

    return thread;
  }

  async getThreadsForUser(userId) {
    return Thread.find({
      "participants.userId": userId,
    }).sort({ updatedAt: -1 });
  }

  async updateLastMessage(threadId, text) {
    return Thread.findByIdAndUpdate(threadId, {
      lastMessage: { text, at: new Date() },
    });
  }
}

module.exports = new ThreadService();