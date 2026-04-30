// modules/messages/message.repository.js
const Message = require("./message.model");

class MessageRepository {
  async create(data) {
    return Message.create(data);
  }

  async findByThread(threadId) {
    return Message.find({ threadId }).sort({ createdAt: 1 });
  }
}

module.exports = new MessageRepository();