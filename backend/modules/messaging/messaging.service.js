
const { getIO } = require('../../config/socket');
const Conversation = require('./conversation.model');
const Message = require('./message.model');

exports.sendMessage = async (senderId, receiverId, text) => {
  // 1. Find or Create Conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] }
  });

  if (!conversation) {
    conversation = await Conversation.create({ participants: [senderId, receiverId] });
  }

  // 2. Create Message
 const message = await Message.create({
    conversationId: conversation._id,
    sender: senderId,
    text
  });

  // REAL-TIME EMIT
  const io = getIO();
  io.to(receiverId).emit('new_message', {
    conversationId: conversation._id,
    senderId,
    text,
    createdAt: message.createdAt
  });

  // Also notify the receiver about the "Typing" status or updated chat list
  io.to(receiverId).emit('update_chat_list', {
    lastMessage: text,
    updatedAt: Date.now()
  });

  return message;
};

exports.getConversations = async (userId) => {
  return await Conversation.find({ participants: userId })
    .populate('participants', 'name email role')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
};

exports.getMessages = async (conversationId) => {
  return await Message.find({ conversationId }).sort({ createdAt: 1 });
};