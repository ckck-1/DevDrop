const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stripeSessionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'usd',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  planType: {
    type: String,
    enum: ['credits_pack', 'subscription_monthly'],
    required: true,
  }
}, { timestamps: true });

paymentSchema.index({ userId: 1 });
paymentSchema.index({ stripeSessionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);