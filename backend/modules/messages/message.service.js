const messageRepo = require("./message.repository");
const threadRepo = require("./thread.repository");

class MessageService {
  async sendMessage(threadId, senderId, senderRole, text) {
    const message = await messageRepo.create({
      threadId,
      senderId,
      senderRole,
      text,
    });

    await threadRepo.updateLastMessage(threadId, text);

    return message;
  }

  async getMessages(threadId, cursor) {
    return messageRepo.getByThread(threadId, 50, cursor);
  }
}

module.exports = new MessageService();