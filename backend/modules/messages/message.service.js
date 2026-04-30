const Message = require("./message.model");
const threadService = require("./thread.service");

class MessageService {
  async sendMessage(threadId, senderId, senderRole, text) {
    const message = await Message.create({
      threadId,
      senderId,
      senderRole,
      text,
    });

    await threadService.updateLastMessage(threadId, text);

    return message;
  }

  async getMessages(threadId) {
    return Message.find({ threadId }).sort({ createdAt: 1 });
  }
}

module.exports = new MessageService();