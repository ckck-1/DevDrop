const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { validateCheckout } = require('./payment.validator');

// Checkout: Protected (Startups Only)
/**
 * @swagger
 * /api/v1/payments/create-checkout:
 *   post:
 *     summary: Create Stripe checkout session
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credits
 *             properties:
 *               credits:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1000
 *     responses:
 *       200:
 *         description: Checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/create-checkout',
  protect,
  authorize('startup'),
  validateCheckout,
  paymentController.createCheckoutSession
);

// Webhook: Public (Called by Stripe)
/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Stripe webhook handler
 *     tags: [Payments]
 *     security: [] # No auth - verified via signature
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

module.exports = router;