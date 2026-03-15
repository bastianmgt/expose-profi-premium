// api/stripe-webhook.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error('[ERROR] Stripe Keys fehlen');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const stripe = require('stripe')(STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[ERROR] Webhook verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('[SUCCESS] Payment received!');
      console.log('  Session ID:', session.id);
      console.log('  Customer Email:', session.customer_email);
      console.log('  Amount:', session.amount_total / 100, 'EUR');
      break;

    case 'payment_intent.succeeded':
      console.log('[INFO] PaymentIntent succeeded');
      break;

    case 'payment_intent.payment_failed':
      console.log('[WARNING] Payment failed');
      break;

    default:
      console.log(`[INFO] Unhandled event: ${event.type}`);
  }

  return res.status(200).json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
