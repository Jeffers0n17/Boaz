'use strict';

const express = require('express');
const crypto = require('node:crypto');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

router.post('/create-checkout-session', async (req, res) => {
  const stripe = getStripeClient();
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  if (!stripe) {
    // Modo demo: simula a criação da sessão sem chamar a Stripe de verdade.
    const sessionId = `demo_cs_${crypto.randomBytes(8).toString('hex')}`;
    db.prepare('UPDATE users SET billing_status = ? WHERE id = ?').run('demo_active', req.user.id);
    return res.json({
      demoMode: true,
      sessionId,
      url: `${baseUrl}/billing-success.html?session_id=${sessionId}&demo=1`,
      message: 'STRIPE_SECRET_KEY não configurada — sessão de checkout simulada localmente.',
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/billing-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard.html`,
      customer_email: req.user.email,
    });
    return res.json({ demoMode: false, sessionId: session.id, url: session.url });
  } catch (err) {
    return res.status(502).json({ error: 'stripe_error', message: err.message });
  }
});

router.get('/status', (req, res) => {
  const user = db.prepare('SELECT billing_status FROM users WHERE id = ?').get(req.user.id);
  res.json({ billingStatus: user ? user.billing_status : 'free', stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY) });
});

module.exports = router;
