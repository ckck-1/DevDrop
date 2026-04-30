const Message = require("./message.model");

class MessageRepository {
  async create(data) {
    return Message.create(data);
  }

  async getByThread(threadId, limit = 50, cursor) {
    const query = { threadId };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    return Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new MessageRepository();