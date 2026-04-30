// modules/messages/thread.model.js
const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

threadSchema.index({ jobId: 1, developerId: 1, startupId: 1 });

module.exports = mongoose.model("Thread", threadSchema);