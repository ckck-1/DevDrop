const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paymentRepository = require('./payment.repository');

class PaymentService {
  async createCheckoutSession(userId, planId) {
    // Plan details (usually fetched from a config or DB)
    const plans = {
      basic_credits: { amount: 5000, credits: 10, name: '10 Contact Credits' },
      pro_credits: { amount: 20000, credits: 50, name: '50 Contact Credits' }
    };

    const plan = plans[planId];
    if (!plan) throw new Error('Invalid plan selected');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: plan.name },
          unit_amount: plan.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancelled`,
      metadata: { userId, planId, credits: plan.credits }
    });

    return session;
  }
}

module.exports = new PaymentService();