const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        role: { type: String, enum: ["candidate", "recruiter"], required: true },
        name: String,
        avatar: String,
      },
    ],

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    lastMessage: {
      text: String,
      at: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Thread", threadSchema);