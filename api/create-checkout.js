// api/create-checkout.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const DOMAIN = process.env.DOMAIN || 'https://expose-profi.de';

    if (!STRIPE_SECRET_KEY) {
      console.error('[ERROR] STRIPE_SECRET_KEY fehlt');
      return res.status(500).json({
        success: false,
        error: 'Server-Konfigurationsfehler',
        message: 'Stripe ist nicht konfiguriert. Bitte kontaktieren Sie den Support.'
      });
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'sepa_debit', 'giropay'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Premium Exposé',
              description: 'Vollständiges KI-generiertes Immobilien-Exposé mit PDF-Export',
            },
            unit_amount: 2900,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${DOMAIN}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}?canceled=true`,
      customer_email: req.body.email || undefined,
      billing_address_collection: 'auto',
    });

    console.log('[SUCCESS] Checkout Session erstellt:', session.id);

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('[ERROR] Stripe Checkout:', error);
    return res.status(500).json({
      success: false,
      error: 'Checkout-Fehler',
      message: 'Die Zahlungsseite konnte nicht erstellt werden.',
      details: error.message
    });
  }
}
