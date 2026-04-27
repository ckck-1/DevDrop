const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup',
    required: true,
  },
  developerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Developer',
    required: true,
  },
  initiatedBy: {
    type: String,
    enum: ['developer', 'startup'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'ignored'],
    default: 'pending'
  }
}, { timestamps: true });

connectionSchema.index({ startupId: 1, developerId: 1 }, { unique: true });
connectionSchema.index({ developerId: 1 });

module.exports = mongoose.model('Connection', connectionSchema);