const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

// Checkout: Protected (Startups Only)
router.post(
  '/create-checkout', 
  protect, 
  authorize('startup'), 
  paymentController.createCheckoutSession
);

// Webhook: Public (Called by Stripe)
// NOTE: This must use express.raw() in app.js for signature verification
router.post(
  '/webhook', 
  express.raw({ type: 'application/json' }), 
  paymentController.handleWebhook
);

module.exports = router;