const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  techStack: [{
    type: String,
    lowercase: true,
  }],
  salaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time'
  },
  location: {
    type: String,
    default: 'Remote'
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'paused'],
    default: 'open'
  }
}, { timestamps: true });

// Crucial indexes for the Job Feed and Search
jobSchema.index({ startupId: 1 });
jobSchema.index({ techStack: 1 });
jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);