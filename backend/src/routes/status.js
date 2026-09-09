'use strict';

const express = require('express');
const whatsapp = require('../lib/whatsappClient');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'axia-backend',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    integrations: {
      anthropic: {
        configured: Boolean(process.env.ANTHROPIC_API_KEY),
        mode: process.env.ANTHROPIC_API_KEY ? 'real' : 'demo',
      },
      stripe: {
        configured: Boolean(process.env.STRIPE_SECRET_KEY),
        mode: process.env.STRIPE_SECRET_KEY ? 'real' : 'demo',
      },
      googleCalendar: {
        configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        mode: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? 'real' : 'demo',
      },
      whatsapp: whatsapp.getStatus(),
      elevenLabs: {
        configured: Boolean(process.env.ELEVENLABS_API_KEY),
        mode: process.env.ELEVENLABS_API_KEY ? 'real' : 'demo (TTS local via pyttsx3 no assistente de voz)',
      },
    },
  });
});

module.exports = router;
