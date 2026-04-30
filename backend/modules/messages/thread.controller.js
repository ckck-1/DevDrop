const threadService = require("./thread.service");
const { sendSuccess, sendError } = require("../../utils/response");

exports.getThreads = async (req, res) => {
  try {
    const threads = await threadService.getUserThreads(req.user.id);
    sendSuccess(res, threads);
  } catch (err) {
    sendError(res, err.message);
  }
};

exports.findOrCreate = async (req, res) => {
  try {
    const { participants } = req.body;

    const thread = await threadService.findOrCreateThread(participants);
    sendSuccess(res, thread);
  } catch (err) {
    sendError(res, err.message);
  }
};

exports.getThread = async (req, res) => {
  try {
    const thread = await threadService.getThreadById(req.params.id);
    sendSuccess(res, thread);
  } catch (err) {
    sendError(res, err.message);
  }
};