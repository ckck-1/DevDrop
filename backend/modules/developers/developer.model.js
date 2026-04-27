const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true, // e.g., "Senior Backend Engineer"
  },
  skills: [{
    type: String,
    lowercase: true,
  }],
  experienceYears: {
    type: Number,
    default: 0,
  },
  bio: String,
  githubUrl: String,
  linkedinUrl: String,
  portfolioUrl: String,
  resumeUrl: String,
  availability: {
    type: String,
    enum: ['available', 'busy', 'hired'],
    default: 'available',
  },
  dailyApplicationCount: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Compound index for AI Matching and Search
developerSchema.index({ skills: 1, availability: 1 });
developerSchema.index({ userId: 1 });

module.exports = mongoose.model('Developer', developerSchema);