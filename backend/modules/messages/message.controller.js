// modules/messages/message.controller.js
const messageService = require("./message.service");
const { sendSuccess, sendError } = require("../../utils/response");

exports.applyToJob = async (req, res) => {
  try {
    const thread = await messageService.applyToJob(
      req.params.jobId,
      req.user.id,
      req.user.role
    );

    sendSuccess(res, { conversationId: thread._id }, "Application sent");
  } catch (error) {
    sendError(res, error.message, 400);
  }
};
const Thread = require("./thread.model");

exports.getThreads = async (req, res) => {
  try {
    const Thread = require("./thread.model");
    const Job = require("../jobs/job.model");
    const Startup = require("../startups/startup.model");

    const threads = await Thread.find({
      developerId: req.user.id,
    }).sort({ updatedAt: -1 });

    const formatted = await Promise.all(
      threads.map(async (t) => {
        const job = await Job.findById(t.jobId);
        const startup = await Startup.findById(t.startupId);

        return {
          _id: t._id,
          withName: startup?.companyName || "Startup",
          avatar: startup?.companyName?.charAt(0) || "S",
          lastMessage: t.lastMessage || "No messages yet",
          lastAt: new Date(t.updatedAt).toLocaleDateString(),
          unread: 0,
        };
      })
    );

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await messageService.getThreadMessages(
      req.params.threadId
    );

    sendSuccess(res, messages);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};