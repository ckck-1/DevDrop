const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  familyId: {
    type: String,
    required: true, // Groups tokens from same rotation family
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  revoked: {
    type: Boolean,
    default: false,
  },
  createdByIp: {
    type: String,
  },
}, { timestamps: true });

// Index for quick lookup by userId and familyId
refreshTokenSchema.index({ userId: 1, familyId: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);