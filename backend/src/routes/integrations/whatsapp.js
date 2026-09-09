'use strict';

const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const whatsapp = require('../../lib/whatsappClient');

const router = express.Router();

router.get('/status', requireAuth, (req, res) => {
  res.json(whatsapp.getStatus());
});

router.get('/qr', requireAuth, (req, res) => {
  const dataUrl = whatsapp.getQrDataUrl();
  if (!dataUrl) {
    return res.status(404).json({ error: 'no_qr', message: 'Nenhum QR code disponível no momento.', status: whatsapp.getStatus() });
  }
  res.json({ qr: dataUrl });
});

router.post('/send', requireAuth, async (req, res) => {
  const { to, message } = req.body || {};
  if (!to || !message) {
    return res.status(400).json({ error: 'invalid_input', message: 'to e message são obrigatórios' });
  }
  try {
    const result = await whatsapp.sendMessage(to, message);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: 'whatsapp_error', message: err.message });
  }
});

module.exports = router;
