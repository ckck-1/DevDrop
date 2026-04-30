const Thread = require("./thread.model");

class ThreadRepository {
  async findUserThreads(userId) {
    return Thread.find({
      "participants.userId": userId,
    }).sort({ lastAt: -1 });
  }

  async findById(id) {
    return Thread.findById(id);
  }

  async findOrCreate(participants) {
    const thread = await Thread.findOne({
      participants: {
        $all: participants.map((p) => ({
          $elemMatch: { userId: p.userId },
        })),
      },
    });

    if (thread) return thread;

    return Thread.create({
      participants,
    });
  }

  async updateLastMessage(threadId, text) {
    return Thread.findByIdAndUpdate(threadId, {
      lastMessage: text,
      lastAt: new Date(),
    });
  }
}

module.exports = new ThreadRepository();