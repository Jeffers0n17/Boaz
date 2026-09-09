'use strict';

const express = require('express');
const { db } = require('../../db');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function getOAuthClient() {
  const { google } = require('googleapis');
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

router.get('/auth', requireAuth, (req, res) => {
  if (!isGoogleConfigured()) {
    return res.json({
      demoMode: true,
      message: 'GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET não configurados — usando modo demo.',
      // Em modo demo não existe fluxo OAuth real: o front-end pode chamar
      // diretamente POST /api/integrations/google/connect-demo para simular a conexão.
      demoConnectUrl: '/api/integrations/google/connect-demo',
    });
  }

  const oauth2Client = getOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    state: String(req.user.id),
  });
  res.json({ demoMode: false, url });
});

router.post('/connect-demo', requireAuth, (req, res) => {
  db.prepare('UPDATE users SET google_calendar_connected = 1, google_calendar_demo = 1 WHERE id = ?').run(
    req.user.id
  );
  res.json({ connected: true, demoMode: true, message: 'Google Calendar conectado em modo demo.' });
});

router.get('/callback', async (req, res) => {
  // Fluxo real de OAuth (só é alcançável quando GOOGLE_CLIENT_ID/SECRET estão configurados).
  const { code, state } = req.query;
  if (!code || !isGoogleConfigured()) {
    return res.status(400).send('Callback inválido ou Google não configurado.');
  }
  try {
    const oauth2Client = getOAuthClient();
    await oauth2Client.getToken(code);
    const userId = Number(state);
    if (userId) {
      db.prepare('UPDATE users SET google_calendar_connected = 1, google_calendar_demo = 0 WHERE id = ?').run(userId);
    }
    res.redirect('/dashboard.html?google=connected');
  } catch (err) {
    res.status(502).send(`Erro ao trocar código por token: ${err.message}`);
  }
});

router.get('/status', requireAuth, (req, res) => {
  const user = db
    .prepare('SELECT google_calendar_connected as connected, google_calendar_demo as demo FROM users WHERE id = ?')
    .get(req.user.id);
  res.json({
    configured: isGoogleConfigured(),
    connected: Boolean(user?.connected),
    demoMode: Boolean(user?.demo),
  });
});

module.exports = router;
