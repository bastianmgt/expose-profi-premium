// api/create-checkout.js
// Stripe Checkout Session erstellen

export default async function handler(req, res) {
  // CORS Headers
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
    
    if (!STRIPE_SECRET_KEY) {
      console.error('[ERROR] STRIPE_SECRET_KEY fehlt in Environment Variables');
      return res.status(500).json({ 
        success: false,
        error: 'Server-Konfigurationsfehler',
        message: 'Stripe ist nicht konfiguriert. Bitte kontaktieren Sie den Support.'
      });
    }

    // Stripe initialisieren
    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    // Success & Cancel URLs
    const YOUR_DOMAIN = process.env.DOMAIN || 'https://expose-profi.de';
    
    // Checkout Session erstellen
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'sepa_debit', 'giropay'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Premium Exposé',
              description: 'Vollständiges KI-generiertes Immobilien-Exposé mit PDF-Export',
              images: [`${YOUR_DOMAIN}/og-image.jpg`],
            },
            unit_amount: 2900, // 29.00 EUR (in Cents!)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`,
      metadata: {
        product: 'premium_expose',
        version: '1.0'
      },
      // Automatische Steuer-Berechnung (optional)
      automatic_tax: {
        enabled: false, // Kann später aktiviert werden
      },
      // Customer Email sammeln
      customer_email: req.body.email || undefined,
      // Billing Details
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
      message: 'Die Zahlungsseite konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
      details: error.message
    });
  }
}
