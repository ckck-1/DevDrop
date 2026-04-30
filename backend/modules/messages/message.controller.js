const messageService = require("./message.service");
const { sendSuccess, sendError } = require("../../utils/response");

exports.getMessages = async (req, res) => {
  try {
    const messages = await messageService.getMessages(
      req.params.threadId,
      req.query.cursor
    );

    sendSuccess(res, messages);
  } catch (err) {
    sendError(res, err.message);
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;

    const message = await messageService.sendMessage(
      req.params.threadId,
      req.user.id,
      req.user.role,
      text
    );

    sendSuccess(res, message, "Message sent");
  } catch (err) {
    sendError(res, err.message);
  }
};