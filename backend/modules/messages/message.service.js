const Message = require("./message.model");
const Thread = require("./thread.model"); // ✅ FIXED (this was missing)
const threadService = require("./thread.service");

class MessageService {
  // Send a message
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

  //  Get messages
  async getMessages(threadId) {
    return Message.find({ threadId }).sort({ createdAt: 1 });
  }

  //  Create or get thread (FIXED + IMPROVED)
  async createOrGetThread({ jobId, developerId, startupId, initialMessage }) {
  //  Find existing thread using participants array
  let thread = await Thread.findOne({
    jobId,
    "participants.userId": { $all: [developerId, startupId] },
  });

  // Create if not found
  if (!thread) {
    thread = await Thread.create({
      jobId,
      participants: [
        {
          userId: developerId,
          role: "candidate",
        },
        {
          userId: startupId,
          role: "recruiter",
        },
      ],
      lastMessage: {
        text: initialMessage || "Application started",
        at: new Date(),
      },
    });

    // Optional system message
    if (initialMessage) {
      await Message.create({
        threadId: thread._id,
        senderRole: "system",
        text: initialMessage,
      });
    }
  }

  return thread;
}
}

module.exports = new MessageService();