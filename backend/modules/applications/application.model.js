// backend/models/application.model.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  developerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Developer',
    required: true,
  },
  startupId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup',
    required: true,
  },
  // Added threadId to link applications directly to chats
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
    default: 'pending'
  },
  resumeSnapshot: String,
  coverLetter: String,
}, { timestamps: true });

applicationSchema.index({ jobId: 1, developerId: 1 }, { unique: true });
applicationSchema.index({ developerId: 1 });
applicationSchema.index({ startupId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);