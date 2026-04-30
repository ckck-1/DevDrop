const messagingService = require('./messaging.service');
const { sendSuccess, sendError } = require('../../utils/response');

exports.send = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const message = await messagingService.sendMessage(req.user.id, receiverId, text);
    sendSuccess(res, message, 'Message sent', 201);
  } catch (error) {
    sendError(res, error.message);
  }
};
const Job = require('../jobs/job.model'); // Ensure path is correct
const messagingService = require('./messaging.service');
const { sendSuccess, sendError } = require('../../utils/response');

exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id; // The Developer

    // 1. Find the job to get the Startup's ID
    const job = await Job.findById(jobId);
    if (!job) return sendError(res, 'Job not found', 404);

    // 2. The receiver is the startup owner
    const receiverId = job.startupId;

    // 3. Create initial message
    const initialText = `Hi! I'm interested in the ${job.title} position. Let's connect!`;
    const message = await messagingService.sendMessage(userId, receiverId, initialText);

    // 4. Return the conversationId so the frontend can redirect
    sendSuccess(res, { conversationId: message.conversationId }, 'Application sent');
  } catch (error) {
    sendError(res, error.message);
  }
};

exports.fetchConversations = async (req, res) => {
  try {
    const conversations = await messagingService.getConversations(req.user.id);
    sendSuccess(res, conversations, 'Conversations retrieved');
  } catch (error) {
    sendError(res, error.message);
  }
};
exports.notifyTyping = (req, res) => {
  const { receiverId, isTyping } = req.body;
  const io = getIO();
  
  io.to(receiverId).emit('user_typing', {
    senderId: req.user.id,
    isTyping
  });
  
  res.status(200).json({ success: true });
};

exports.fetchMessages = async (req, res) => {
  try {
    const messages = await messagingService.getMessages(req.params.conversationId);
    sendSuccess(res, messages, 'Messages retrieved');
  } catch (error) {
    sendError(res, error.message);
  }
};