// modules/messages/message.model.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["developer", "startup"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "application"],
      default: "text",
    },
  },
  { timestamps: true }
);

messageSchema.index({ threadId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);