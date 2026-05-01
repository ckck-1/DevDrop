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

  // Example logic required in message.service.js
async createOrGetThread({ jobId, developerId, startupId, initialMessage }) {
  let thread = await Thread.findOne({ jobId, developerId });
  if (!thread) {
    thread = await Thread.create({ jobId, developerId, startupId });
    // Add the initial message to the thread here if needed
  }
  return thread;
}
}

module.exports = new MessageService();