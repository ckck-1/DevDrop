const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        role: { type: String, enum: ["dev", "startup"], required: true },
      },
    ],

    lastMessage: {
      type: String,
      default: "",
    },

    lastAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

threadSchema.index({ "participants.userId": 1 });

module.exports = mongoose.model("Thread", threadSchema);