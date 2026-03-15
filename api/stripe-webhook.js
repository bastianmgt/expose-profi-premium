// api/stripe-webhook.js
// Stripe Webhook Handler - Verifiziert Zahlungen

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
    // Webhook Event verifizieren
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[ERROR] Webhook Signature Verification Failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Event Type handler
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      console.log('[SUCCESS] Payment received!');
      console.log('  Session ID:', session.id);
      console.log('  Customer Email:', session.customer_email);
      console.log('  Amount Total:', session.amount_total / 100, 'EUR');
      console.log('  Payment Status:', session.payment_status);

      // Hier könnten Sie:
      // - Email an Kunden senden
      // - Datenbank aktualisieren
      // - Analytics Event triggern
      
      break;

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('[INFO] PaymentIntent succeeded:', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('[WARNING] Payment failed:', failedPayment.id);
      break;

    default:
      console.log(`[INFO] Unhandled event type: ${event.type}`);
  }

  // Stripe bestätigen dass Event empfangen wurde
  return res.status(200).json({ received: true });
}

// WICHTIG: Vercel config für raw body
export const config = {
  api: {
    bodyParser: false, // Stripe braucht raw body für Signature
  },
};
