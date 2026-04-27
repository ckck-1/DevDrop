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
  startupId: { // Denormalized for faster querying by startups
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
    default: 'pending'
  },
  resumeSnapshot: String, // URL to resume at time of application
  coverLetter: String,
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ jobId: 1, developerId: 1 }, { unique: true });
applicationSchema.index({ developerId: 1 });
applicationSchema.index({ startupId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);