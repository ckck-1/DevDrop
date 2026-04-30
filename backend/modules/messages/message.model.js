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
      required: true,
    },

    senderRole: {
      type: String,
      enum: ["dev", "startup"],
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ threadId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);