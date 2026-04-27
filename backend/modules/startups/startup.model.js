const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  website: String,
  industry: String,
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201+'],
  },
  bio: String,
  logoUrl: String,
  isPremium: {
    type: Boolean,
    default: false,
  },
  // Scalable limit tracking
  contactCredits: {
    type: Number,
    default: 5,
  }
}, { timestamps: true });

startupSchema.index({ userId: 1 });
startupSchema.index({ companyName: 'text' }); // For search

module.exports = mongoose.model('Startup', startupSchema);