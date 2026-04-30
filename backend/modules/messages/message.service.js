// modules/messages/message.service.js
const jobRepository = require("../jobs/job.repository");
const startupRepository = require("../startups/startup.repository");

const threadRepository = require("./thread.repository");
const messageRepository = require("./message.repository");

class MessageService {
  async applyToJob(jobId, developerId, developerRole) {
    const job = await jobRepository.findById(jobId);
    if (!job) throw new Error("Job not found");

    const startupId = job.startupId._id || job.startupId;

    const thread = await threadRepository.findOrCreate(
      jobId,
      startupId,
      developerId
    );

    const message = await messageRepository.create({
      threadId: thread._id,
      senderId: developerId,
      senderRole: developerRole,
      text: `I’m applying for ${job.title}. Looking forward to connecting!`,
      type: "application",
    });

    thread.lastMessage = message.text;
    await thread.save();

    return thread;
  }

  async getThreadMessages(threadId) {
    return messageRepository.findByThread(threadId);
  }
}

module.exports = new MessageService();