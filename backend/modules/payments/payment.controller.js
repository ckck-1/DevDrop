const stripe = require('stripe');
const startupRepository = require('../startups/startup.repository');
const { sendSuccess, sendError } = require('../../utils/response');
const logger = require('../../utils/logger');

// Safety: Initialize stripe only when needed to ensure env vars are loaded
const getStripe = () => stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc    Create Stripe Checkout Session
 * @route   POST /api/v1/payments/create-checkout
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const stripeInstance = getStripe();
    const { credits } = req.body;

    // Basic validation already done by middleware
    const quantity = credits || 1;
    const unitAmount = 1000; // $10 per credit (example)

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${quantity} Startup Job Credits`,
            },
            unit_amount: unitAmount,
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user.id,
        credits: quantity
      },
    });

    logger.info(`Checkout session created: ${session.id} for user ${req.user.id}, credits: ${quantity}`);
    return sendSuccess(res, { url: session.url }, 'Session created');
  } catch (error) {
    logger.error(`Checkout error: ${error.message} for user ${req.user.id}`);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Stripe Webhook Listener
 * @route   POST /api/v1/payments/webhook
 */
exports.handleWebhook = async (req, res) => {
  const stripeInstance = getStripe();
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.warn(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, credits } = session.metadata;

    logger.info(`Payment successful: session ${session.id}, userId: ${userId}, credits: ${credits}`);

    const startup = await startupRepository.findByUserId(userId);
    if (startup) {
      await startupRepository.addCredits(startup._id, parseInt(credits));
      logger.info(`Credits added: startup ${startup._id} +${credits} credits`);
    } else {
      logger.warn(`Startup not found for userId ${userId} during webhook processing`);
    }
  }

  res.json({ received: true });
};