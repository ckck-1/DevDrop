const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const startupRepository = require('../startups/startup.repository');
const { sendSuccess, sendError } = require('../../utils/response');

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Extract info from metadata
    const { userId, credits } = session.metadata;
    
    // Grant credits to the startup
    const startup = await startupRepository.findByUserId(userId);
    if (startup) {
      await startupRepository.addCredits(startup._id, parseInt(credits));
    }
  }

  res.json({ received: true });
};