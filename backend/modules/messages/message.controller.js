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
    const threads = await Thread.find({
      developerId: req.user.id,
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: threads,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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