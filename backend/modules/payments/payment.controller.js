const stripe = require('stripe');
const startupRepository = require('../startups/startup.repository');
const { sendSuccess, sendError } = require('../../utils/response');

// Safety: Initialize stripe only when needed to ensure env vars are loaded
const getStripe = () => stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc    Create Stripe Checkout Session
 * @route   POST /api/v1/payments/create-checkout
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const stripeInstance = getStripe();
    const { credits } = req.body; // How many credits they want to buy

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${credits} Startup Job Credits`,
            },
            unit_amount: 1000, // $10 per credit (example)
          },
          quantity: credits || 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user.id,
        credits: credits || 1
      },
    });

    sendSuccess(res, { url: session.url }, 'Session created');
  } catch (error) {
    sendError(res, error.message, 500);
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
      req.body, // Must be raw body (Handled in app.js)
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, credits } = session.metadata;
    
    const startup = await startupRepository.findByUserId(userId);
    if (startup) {
      await startupRepository.addCredits(startup._id, parseInt(credits));
    }
  }

  res.json({ received: true });
};